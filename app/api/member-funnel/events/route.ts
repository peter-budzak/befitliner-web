import { createClient } from "@supabase/supabase-js";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return new Response(null, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 16000)
    return new Response(null, { status: 413 });
  const raw = await request.text();
  if (raw.length > 16000) return new Response(null, { status: 413 });
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return new Response(null, { status: 503 });
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.rpc("record_member_funnel_events", {
    payload,
  });
  return new Response(null, {
    status: error ? 400 : 204,
    headers: { "Cache-Control": "no-store" },
  });
}
