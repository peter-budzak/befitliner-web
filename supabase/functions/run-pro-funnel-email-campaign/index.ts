import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { requireEnv } from "../_shared/fitliner_payments.ts";
import { proStripeConfig, verifyProStripeAccount } from "../_shared/fitliner_pro_stripe.ts";
import { ensureProCoupon } from "../_shared/fitliner_pro_coupon.ts";

type Mail = { funnel_id: string; sequence: 1 | 2 | 3; token: string; email: string; unsubscribe_token: string };
const subjects = [
  "Dokonči svoj štart s Fitliner PRO",
  "Získaj 20 % zľavu na prvú platbu za Fitliner PRO",
  "Získaj 30 % zľavu na prvú platbu za Fitliner PRO",
];
const bodies = [
  "Tvoj profil je pripravený. Vyber si plán a pokračuj s rovnakým e-mailom.",
  "Prvú platbu za mesačný alebo ročný plán máš o 20 % nižšiu. Ďalšie platby sú za bežnú cenu.",
  "Prvú platbu za mesačný alebo ročný plán máš o 30 % nižšiu. Ďalšie platby sú za bežnú cenu.",
];

function safeEqual(left: string, right: string) {
  if (!left || left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}

async function send(mail: Mail, origin: string, mailKey: string) {
  const subject = subjects[mail.sequence - 1];
  const body = bodies[mail.sequence - 1];
  const resume = new URL("/sk/zacat", origin);
  resume.searchParams.set("pro", "resume");
  resume.searchParams.set("flow", mail.funnel_id);
  if (mail.sequence !== 1) resume.searchParams.set("offer", mail.token);
  const unsubscribe = new URL("/api/fitliner-pro/unsubscribe", origin);
  unsubscribe.searchParams.set("token", mail.unsubscribe_token);
  const href = resume.href.replaceAll("&", "&amp;");
  const response = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    signal: AbortSignal.timeout(12000),
    headers: { Authorization: `Bearer ${mailKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: { email: Deno.env.get("MAILERSEND_FROM_EMAIL") ?? "no-reply@mail.befitliner.com", name: "Fitliner" },
      to: [{ email: mail.email }],
      subject,
      html: `<h1>${subject}</h1><p>${body}</p><p><a href="${href}">Pokračovať vo Fitlineri</a></p><p><a href="${unsubscribe.href}">Odhlásiť pripomienky a ponuky</a></p>`,
      text: `${subject}\n\n${body}\n\nPokračovať: ${resume.href}\nOdhlásiť: ${unsubscribe.href}`,
      tags: ["fitliner-pro", `fitliner-pro-${mail.sequence}`],
      settings: { track_clicks: false, track_opens: false, track_content: false },
    }),
  });
  if (response.status !== 202) throw new Error(`MailerSend rejected delivery (${response.status})`);
  return response.headers.get("x-message-id");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  if (!safeEqual(req.headers.get("x-pro-cron-secret") ?? "", requireEnv("FITLINER_PRO_CRON_SECRET"))) {
    return new Response(null, { status: 401 });
  }
  if (Deno.env.get("FITLINER_PRO_RECOVERY_ENABLED") !== "true") return Response.json({ enabled: false });

  try {
    const url = requireEnv("SUPABASE_URL");
    const config = proStripeConfig(url);
    const origin = new URL(requireEnv("FITLINER_PRO_WEB_ORIGIN")).origin;
    const mailKey = requireEnv("MAILERSEND_API_KEY");
    if (!config.live || origin !== "https://www.befitliner.com") throw new Error("Unexpected environment");
    await verifyProStripeAccount(config);
    await Promise.all([ensureProCoupon(config, 20), ensureProCoupon(config, 30)]);
    const admin = createClient(url, requireEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
    const { data, error } = await admin.rpc("claim_fitliner_pro_funnel_mail");
    if (error) throw error;

    const results = await Promise.allSettled(((data ?? []) as Mail[]).map(async (mail) => {
      const lead = await admin.from("fitliner_pro_funnel")
        .select("purchased_at,unsubscribed_at,verified_at,consent_at,user_id").eq("id", mail.funnel_id).maybeSingle();
      let status: "sent" | "failed" | "skipped" = "skipped";
      let providerId: string | null = null;
      try {
        if (lead.error) throw lead.error;
        if (lead.data?.verified_at && lead.data.consent_at && !lead.data.purchased_at && !lead.data.unsubscribed_at) {
          const access = await admin.rpc("has_active_fitliner_pro", { p_user_id: lead.data.user_id });
          if (access.error) throw access.error;
          if (!access.data) {
            providerId = await send(mail, origin, mailKey);
            status = "sent";
          }
        }
      } catch {
        status = "failed";
      }
      const result = await admin.from("fitliner_pro_funnel_mail").update({
        status, provider_id: providerId, sent_at: status === "sent" ? new Date().toISOString() : null,
      }).eq("funnel_id", mail.funnel_id).eq("sequence", mail.sequence).eq("status", "sending");
      if (result.error || status === "failed") throw new Error("Mail delivery failed");
    }));
    return Response.json({ checked: results.length, failed: results.filter(result => result.status === "rejected").length });
  } catch {
    return Response.json({ error: "Campaign unavailable" }, { status: 503 });
  }
});
