import { createClient } from '@supabase/supabase-js';

const tokenPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;

function page(body: string, status = 200) {
  return new Response(`<!doctype html><html lang="sk"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Fitliner PRO</title><main>${body}</main></html>`, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'",
    },
  });
}

export function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  if (!tokenPattern.test(token)) return page('<p>Odkaz je neplatný.</p>', 400);
  return page(`<h1>Odhlásiť e-maily Fitliner PRO</h1><form method="post" action="/api/fitliner-pro/unsubscribe"><input type="hidden" name="token" value="${token}"><button type="submit">Odhlásiť pripomienky a ponuky</button></form>`);
}

export async function POST(request: Request) {
  const data = await request.formData().catch(() => null);
  const token = data?.get('token');
  if (typeof token !== 'string' || !tokenPattern.test(token)) return page('<p>Odkaz je neplatný.</p>', 400);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return page('<p>Skús to znova o chvíľu.</p>', 503);
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await client.rpc('unsubscribe_fitliner_pro_funnel', { p_token: token });
  return error ? page('<p>Skús to znova o chvíľu.</p>', 503) : page('<h1>Odhlásenie potvrdené</h1><p>Ďalšie pripomienky a ponuky Fitliner PRO ti už nepošleme.</p>');
}
