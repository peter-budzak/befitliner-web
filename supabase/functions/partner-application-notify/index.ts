import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.104.1';
const url = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const db = createClient(url, serviceKey, { auth: { persistSession: false } });
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
Deno.serve(async (req) => {
  if (req.method !== 'POST') return reply({ error: 'method_not_allowed' }, 405);
  // Called only by the trusted Next.js server. Public and user JWTs cannot send mail.
  if (req.headers.get('authorization') !== `Bearer ${serviceKey}`) return reply({ error: 'forbidden' }, 403);
  try {
    const { id, action } = await req.json();
    if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) return reply({ error: 'invalid_id' }, 400);
    const { data: app, error } = await db.from('partner_applications').select('*').eq('id', id).single();
    if (error || !app) return reply({ error: 'not_found' }, 404);
    const key = Deno.env.get('MAILERSEND_API_KEY'), sender = Deno.env.get('MAILERSEND_FROM_EMAIL');
    const update = async (values: Record<string, unknown>) => {
      const { error } = await db.from('partner_applications').update({ ...values, notification_updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw Error('state_write_failed');
    };
    if (action === 'check') {
      if (!key || !app.notification_message_id) return reply({ status: app.notification_status });
      const r = await fetch(`https://api.mailersend.com/v1/messages/${encodeURIComponent(app.notification_message_id)}`, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000) });
      if (!r.ok) return reply({ error: 'provider_status_unavailable' }, 502);
      const body = await r.json();
      const emails = body.data?.emails ?? [];
      const delivered = emails.some((e: { status?: string }) => e.status === 'delivered');
      const rejected = emails.some((e: { status?: string }) => ['rejected','bounced','hard_bounced'].includes(e.status ?? ''));
      if (delivered || rejected) await update({ notification_status: delivered ? 'delivered' : 'rejected' });
      return reply({ status: delivered ? 'delivered' : rejected ? 'rejected' : app.notification_status });
    }
    if (!['pending', 'failed'].includes(app.notification_status)) return reply({ status: app.notification_status });
    if (!key || !sender) { await update({ notification_status: 'failed', notification_error: 'provider_not_configured' }); return reply({ error: 'provider_not_configured' }, 503); }
    // Atomic claim prevents concurrent requests and repeated form submits from sending twice.
    const { data: claimed, error: claimError } = await db.from('partner_applications').update({ notification_status: 'sending', notification_attempts: app.notification_attempts + 1, notification_error: null, notification_updated_at: new Date().toISOString() }).eq('id', id).eq('notification_status', app.notification_status).eq('notification_attempts', app.notification_attempts).select('id').maybeSingle();
    if (claimError) return reply({ error: 'claim_failed' }, 503);
    if (!claimed) return reply({ status: 'already_claimed' });
    try {
      const r = await fetch('https://api.mailersend.com/v1/email', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({
        from: { email: sender, name: Deno.env.get('MAILERSEND_FROM_NAME') || 'Fitliner' }, to: [{ email: 'peter@peterbudzak.com' }], reply_to: { email: app.email },
        subject: `Fitliner: Nová partnerská prihláška – ${app.country_code} [${id}]`,
        text: [`ID: ${id}`, `Krajina: ${app.country_code}`, `Meno: ${app.contact_name}`, `Firma: ${app.company || '—'}`, `Telefón: ${app.phone}`, `E-mail: ${app.email}`, `Skúsenosti: ${app.experience}`, `Správa: ${app.message || '—'}`].join('\n\n'), tags: ['country-partner-application']
      }), signal: AbortSignal.timeout(8000) });
      const messageId = r.headers.get('x-message-id');
      if (r.status === 202 && messageId) await update({ notification_status: 'accepted', notification_message_id: messageId, notification_error: null });
      // Only explicit rejection is safe to retry. Network/5xx/unknown responses may have accepted mail.
      else await update({ notification_status: [400,401,403,404,422,429].includes(r.status) ? 'failed' : 'unknown', notification_error: `provider_http_${r.status}`, notification_message_id: messageId });
    } catch { await update({ notification_status: 'unknown', notification_error: 'ambiguous_delivery_check_provider_before_retry' }); }
    return reply({ ok: true });
  } catch { return reply({ error: 'notification_unavailable' }, 503); }
});
