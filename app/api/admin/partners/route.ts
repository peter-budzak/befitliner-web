import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
const response = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
async function authorize(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = req.headers.get('authorization');
  if (!url || !anon || !token?.startsWith('Bearer ')) return false;
  const client = createClient(url, anon, { global: { headers: { Authorization: token } }, auth: { persistSession: false } });
  const { data, error } = await client.auth.getUser(token.slice(7));
  if (error || !data.user) return false;
  const allowed = await client.rpc('is_gym_console_admin');
  return !allowed.error && allowed.data === true;
}
export async function POST(req: NextRequest) {
  if (!await authorize(req)) return response({ error: 'forbidden' }, 403);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return response({ error: 'temporarily_unavailable' }, 503);
  let input; try { input = await req.json(); } catch { return response({ error: 'invalid_json' }, 400); }
  if (!input || typeof input.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(input.id)) return response({ error: 'invalid_id' }, 400);
  if (input.action === 'status' && ['new','reviewing','contacted','accepted','rejected'].includes(input.status)) {
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await db.from('partner_applications').update({ status: input.status, updated_at: new Date().toISOString() }).eq('id', input.id).select('id').maybeSingle();
    return error ? response({ error: 'update_failed' }, 503) : !data ? response({ error: 'not_found' }, 404) : response({ ok: true });
  }
  if (['notify','check'].includes(input.action)) {
    try {
      const r = await fetch(`${url}/functions/v1/partner-application-notify`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: input.id, action: input.action }), signal: AbortSignal.timeout(15000) });
      return response(await r.json(), r.status);
    } catch { return response({ error: 'notification_unavailable' }, 503); }
  }
  return response({ error: 'invalid_action' }, 400);
}
