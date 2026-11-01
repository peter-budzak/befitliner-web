import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");

  if (Number(request.headers.get("content-length") ?? 0) > 64000)
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  const text = await request.text();
  if (text.length > 64000)
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  const action =
    data.action === "web_prepare"
      ? "web_prepare"
      : data.action === "web_resume"
        ? "web_resume"
        : "web_import";
  if (action !== "web_prepare" && !auth?.startsWith("Bearer "))
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  try {
    const response = await fetch(`${url}/functions/v1/trainer-commerce`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
      headers: {
        "Content-Type": "application/json",
        Authorization: auth ?? `Bearer ${key}`,
        apikey: key,
      },
      body: JSON.stringify({
        action,
        request_id: data.request_id,
        profile: data.profile,
        offers: data.offers,
        draft: data.draft,
        token: data.token,
      }),
    });
    const result = await response.json();
    return NextResponse.json(response.ok ? result : { error: "save_failed" }, {
      status: response.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  const slug = (request.nextUrl.searchParams.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const headers = { "Cache-Control": "private, no-store" };
  if (
    !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug) ||
    slug.length < 3 ||
    slug.length > 64
  )
    return NextResponse.json({ available: false }, { headers });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    return NextResponse.json(
      { error: "unavailable" },
      { status: 503, headers },
    );
  try {
    const auth = request.headers.get("authorization");
    const response = await fetch(
      `${url}/rest/v1/rpc/trainer_web_slug_available`,
      {
        method: "POST",
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: auth?.startsWith("Bearer ") ? auth : `Bearer ${key}`,
        },
        body: JSON.stringify({ p_slug: slug }),
      },
    );
    if (!response.ok) throw new Error("availability");
    const available = await response.json();
    if (typeof available !== "boolean") throw new Error("availability");
    return NextResponse.json({ available }, { headers });
  } catch {
    return NextResponse.json(
      { error: "unavailable" },
      { status: 503, headers },
    );
  }
}
