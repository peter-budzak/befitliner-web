import { createHmac } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'nodejs';
const reply = (error: string, status: number) => NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '3600' } : {}) } });
export async function POST(req: NextRequest) {
  if (req.headers.get('origin') && req.headers.get('origin') !== req.nextUrl.origin) return reply('invalid_origin', 403);
  if (!req.headers.get('content-type')?.includes('application/json')) return reply('invalid_json', 415);
  // Enforce the actual streamed byte count, even without a Content-Length header.
  let input: Record<string, unknown>;
  try {
    const reader = req.body?.getReader(); if (!reader) return reply('invalid_json', 400);
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 12000) { await reader.cancel(); return reply('payload_too_large', 413); } chunks.push(value); }
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!input || typeof input !== 'object' || Array.isArray(input)) return reply('invalid_json', 400);
  } catch { return reply('invalid_json', 400); }
  const limits: Record<string, [number, number]> = { country_code: [2, 2], contact_name: [2, 120], company: [0, 160], email: [3, 254], phone: [5, 40], experience: [10, 2000], message: [0, 2000] };
  const data: Record<string, string> = {};
  for (const [field, [min, max]] of Object.entries(limits)) {
    const raw = input[field] ?? ''; if (typeof raw !== 'string') return reply('invalid_fields', 400);
    const value = raw.trim(); if (value.length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) return reply('invalid_fields', 400);
    data[field] = value;
  }
  data.email = data.email.toLowerCase(); data.country_code = data.country_code.toUpperCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^[A-Z]{2}$/.test(data.country_code) || input.privacy_consent !== 'yes' || input.website || typeof input.request_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.request_id)) return reply('invalid_fields', 400);
  const started = Number(input.started_at);
  if (!Number.isFinite(started) || Date.now() - started < 2000 || Date.now() - started > 86400000) return reply('invalid_fields', 400);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return reply('temporarily_unavailable', 503);
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const hash = (value: string) => createHmac('sha256', key).update(value).digest('hex');
  // Vercel overwrites x-vercel-forwarded-for; do not trust a client-supplied generic XFF.
  const ip = process.env.VERCEL ? req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() || 'unknown' : 'local';
  const { data: result, error } = await db.rpc('submit_partner_application', { p_data: data, p_request_id: input.request_id, p_hash: hash(JSON.stringify(data)), p_ip: hash(ip) });
  if (error) {
    if (error.message.includes('rate_limited')) return reply('rate_limited', 429);
    if (error.message.includes('idempotency_conflict')) return reply('idempotency_conflict', 409);
    if (error.message.includes('country_unavailable')) return reply('country_unavailable', 400);
    return reply('temporarily_unavailable', 503);
  }
  try {
    await fetch(`${url}/functions/v1/partner-application-notify`, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: result.id }), signal: AbortSignal.timeout(12000) });
  } catch { /* Durable pending/sending state is visible in the admin console. Never undo the application. */ }
  return NextResponse.json({ ok: true, id: result.id }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}
