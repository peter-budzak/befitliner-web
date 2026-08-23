import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { requireEnv } from "../_shared/fitliner_payments.ts";

type Lead = {
  id: string; request_id: string; user_id: string | null; email: string; locale: string;
  answers: Record<string, string | string[]>; campaign_eligible_at: string;
  unsubscribe_token: string; discount_token: string; status: string;
  health_funnel_email_log: Array<{ sequence_step: number }>;
};

const HOURS = [1, 24, 72];
const APP_URL = "https://befitliner.com";
const FUNCTION_URL = "https://jkjncktexqqkrmezdjui.supabase.co/functions/v1";

function textValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function copy(lead: Lead, step: number) {
  const sk = lead.locale === "sk";
  const goal = textValue(lead.answers.goal);
  const barrier = textValue(lead.answers.barrier);
  const goalSk: Record<string, string> = { archive: "históriu krvných výsledkov", trends: "vývoj krvných hodnôt", understand: "porozumenie krvným hodnotám", doctor: "prehľad pre konzultáciu s lekárom" };
  const goalEn: Record<string, string> = { lab_results: "blood results", body_composition: "body composition", both: "results and body composition", prevention: "long-term health trends" };
  const barrierSk: Record<string, string> = { scattered: "rozhádzané výsledky", understanding: "nejasný význam hodnôt", trends: "chýbajúci vývoj v čase", routine: "pravidelnosť meraní" };
  const barrierEn: Record<string, string> = { scattered: "scattered reports", understanding: "unclear values", trends: "missing trends", routine: "a consistent testing routine" };
  const focus = sk ? goalSk[goal] ?? "históriu krvných výsledkov" : goalEn[goal] ?? "health results";
  const challenge = sk ? barrierSk[barrier] ?? "neprehľadné výsledky" : barrierEn[barrier] ?? "unclear reports";
  const resume = `${APP_URL}/${encodeURIComponent(lead.locale || "en")}/health?campaign=health-abandoned-${step}&rid=${lead.request_id}`;
  const unsubscribe = `${FUNCTION_URL}/health-email-unsubscribe?token=${lead.unsubscribe_token}`;
  const subjectsSk = ["Tvoj Fitliner Health plán je pripravený", `Urob si poriadok v téme: ${focus}`, "VIP ponuka: prvý rok Fitliner Health o 50 % lacnejšie"];
  const subjectsEn = ["Your Fitliner Health plan is ready", `Bring clarity to your ${focus}`, "VIP offer: 50% off your first year of Fitliner Health"];
  const bodiesSk = [
    `Tvoj osobný plán je pripravený. Zdravotná karta ti pomôže sledovať ${focus} na jednom mieste a vidieť ich vývoj v čase.`,
    `Fitliner rieši problém „${challenge}“ tým, že rozdelí každý biomarker do vlastnej histórie, aby sa výsledky nikdy nepomiešali.`,
    "Ak chceš začať teraz, prvý rok môžeš získať za 17,40 € namiesto 34,80 €. Ponuka platí 48 hodín; ďalší rok sa obnoví za štandardných 34,80 €.",
  ];
  const bodiesEn = [
    `Your personal plan is ready. The Health Card helps you track ${focus} in one place and understand change over time.`,
    `You highlighted “${challenge}”. Fitliner keeps every biomarker in its own timeline, so reports never get mixed together.`,
    "Start now and get your first year for €17.40 instead of €34.80. The offer is valid for 48 hours; the following year renews at the standard €34.80.",
  ];
  const subject = (sk ? subjectsSk : subjectsEn)[step - 1];
  const body = (sk ? bodiesSk : bodiesEn)[step - 1];
  const cta = step === 3 ? (sk ? "Aktivovať s 50 % zľavou" : "Activate with 50% off") : (sk ? "Zobraziť môj plán" : "View my plan");
  const discount = step === 3 ? `&offer=${lead.discount_token}` : "";
  const href = `${resume}${discount}`;
  const html = `<div style="margin:0;padding:32px 16px;background:#08070c"><div style="max-width:560px;margin:auto;background:#131119;border:1px solid #292333;border-radius:22px;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#fff"><div style="font-size:12px;letter-spacing:.2em;color:#a78bfa;font-weight:800">FITLINER™ HEALTH</div><h1 style="font-size:30px;line-height:1.15;margin:20px 0 14px">${subject}</h1><p style="font-size:17px;line-height:1.65;color:#c9c5d1">${body}</p><p style="margin:28px 0"><a href="${href}" style="display:block;text-align:center;background:#7c3aed;color:#fff;text-decoration:none;font-weight:800;padding:16px;border-radius:14px">${cta}</a></p><p style="font-size:13px;line-height:1.5;color:#817b8b">${sk ? "Fitliner neposkytuje diagnózu ani lekársku radu." : "Fitliner does not provide diagnosis or medical advice."}</p><hr style="border:0;border-top:1px solid #292333;margin:24px 0"><p style="font-size:12px;color:#817b8b">${sk ? "Tento e-mail dostávaš na základe dobrovoľného súhlasu." : "You receive this email based on your optional consent."} <a href="${unsubscribe}" style="color:#b9a1ff">${sk ? "Odhlásiť e-maily" : "Unsubscribe"}</a></p></div></div>`;
  return { subject, html, text: `${subject}\n\n${body}\n\n${cta}: ${href}\n\nUnsubscribe: ${unsubscribe}`, unsubscribe };
}

async function sendEmail(lead: Lead, step: number) {
  const content = copy(lead, step);
  const payload: Record<string, unknown> = {
    from: { email: Deno.env.get("MAILERSEND_FROM_EMAIL") ?? "no-reply@mail.befitliner.com", name: Deno.env.get("MAILERSEND_FROM_NAME") ?? "Fitliner" },
    to: [{ email: lead.email }], subject: content.subject, html: content.html, text: content.text,
    tags: ["health-funnel", `health-funnel-${step}`],
    list_unsubscribe: content.unsubscribe,
  };
  let response = await fetch("https://api.mailersend.com/v1/email", { method: "POST", headers: { Authorization: `Bearer ${requireEnv("MAILERSEND_API_KEY")}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (response.status === 422) {
    delete payload.list_unsubscribe;
    response = await fetch("https://api.mailersend.com/v1/email", { method: "POST", headers: { Authorization: `Bearer ${requireEnv("MAILERSEND_API_KEY")}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  }
  if (!response.ok) throw new Error(`MailerSend ${response.status}: ${await response.text()}`);
  return response.headers.get("x-message-id");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const admin = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.from("health_web_funnel_submissions")
    .select("id,request_id,user_id,email,locale,answers,campaign_eligible_at,unsubscribe_token,discount_token,status,health_funnel_email_log(sequence_step)")
    .eq("marketing_consent", true).is("marketing_unsubscribed_at", null)
    .in("status", ["lead_captured", "checkout_open", "failed"]).not("campaign_eligible_at", "is", null)
    .order("campaign_eligible_at", { ascending: true }).limit(40);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const results: Record<string, unknown>[] = [];
  for (const lead of (data ?? []) as Lead[]) {
    if (lead.user_id) {
      const { data: active } = await admin.rpc("has_active_health_card_entitlement", { p_user_id: lead.user_id, p_at: new Date().toISOString() });
      if (active === true) continue;
    }
    const elapsedHours = (Date.now() - new Date(lead.campaign_eligible_at).getTime()) / 3_600_000;
    const sent = new Set((lead.health_funnel_email_log ?? []).map((row) => row.sequence_step));
    const step = HOURS.findIndex((hours, index) => elapsedHours >= hours && !sent.has(index + 1)) + 1;
    if (!step) continue;
    try {
      if (step === 3) await admin.from("health_web_funnel_submissions").update({ discount_expires_at: new Date(Date.now() + 48 * 3_600_000).toISOString() }).eq("id", lead.id);
      const messageId = await sendEmail(lead, step);
      const { error: logError } = await admin.from("health_funnel_email_log").insert({ submission_id: lead.id, sequence_step: step, provider_message_id: messageId });
      if (logError && logError.code !== "23505") throw logError;
      results.push({ id: lead.id, step, status: "sent" });
    } catch (sendError) {
      console.error("Health funnel email failed", { id: lead.id, step, error: String(sendError) });
      results.push({ id: lead.id, step, status: "failed" });
    }
  }
  return Response.json({ ok: true, processed: results.length, results });
});
