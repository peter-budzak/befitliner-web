import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v26.0';
const PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || '475851925437843';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EVENT_ID_RE = /^[a-zA-Z0-9_-]{8,100}$/;
const ALLOWED_EVENTS = new Set(['CompleteRegistration']);

type ConversionPayload = {
  event_name?: unknown;
  event_id?: unknown;
  event_time?: unknown;
  event_source_url?: unknown;
  email?: unknown;
  external_id?: unknown;
  fbp?: unknown;
  fbc?: unknown;
};

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestHost = request.headers.get('host');
    return originUrl.host === requestHost;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Origin is not allowed.' }, { status: 403 });
  }

  const accessToken = process.env.META_CONVERSIONS_API_TOKEN?.trim();
  if (!accessToken) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'server_not_configured' });
  }

  const body = (await request.json().catch(() => null)) as ConversionPayload | null;
  const eventName = cleanString(body?.event_name, 80);
  const eventId = cleanString(body?.event_id, 100);
  const email = cleanString(body?.email, 320).toLowerCase();
  const externalId = cleanString(body?.external_id, 100);
  const eventSourceUrl = cleanString(body?.event_source_url, 2000);
  const fbp = cleanString(body?.fbp, 250);
  const fbc = cleanString(body?.fbc, 250);
  const requestedEventTime = Number(body?.event_time);
  const now = Math.floor(Date.now() / 1000);
  const eventTime = Number.isInteger(requestedEventTime)
    && requestedEventTime <= now + 60
    && requestedEventTime >= now - 86_400
    ? requestedEventTime
    : now;

  if (!ALLOWED_EVENTS.has(eventName) || !EVENT_ID_RE.test(eventId)) {
    return NextResponse.json({ error: 'Invalid conversion event.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || !eventSourceUrl.startsWith('http')) {
    return NextResponse.json({ error: 'Invalid conversion identifiers.' }, { status: 400 });
  }

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const clientIpAddress = forwardedFor || request.headers.get('x-real-ip') || undefined;
  const clientUserAgent = request.headers.get('user-agent') || undefined;
  const userData: Record<string, string | string[]> = {
    em: [sha256(email)],
  };

  if (externalId) userData.external_id = [sha256(externalId)];
  if (clientIpAddress) userData.client_ip_address = clientIpAddress;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const metaPayload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: {
          content_name: 'Fitliner Health',
          status: 'completed',
        },
      },
    ],
  };

  const testEventCode = process.env.META_TEST_EVENT_CODE?.trim();
  if (testEventCode) metaPayload.test_event_code = testEventCode;

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(PIXEL_ID)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metaPayload),
      cache: 'no-store',
    }
  );
  const result = await response.json().catch(() => ({}));

  if (!response.ok || result?.error) {
    console.error('Meta Conversions API request failed', {
      status: response.status,
      code: result?.error?.code,
      subcode: result?.error?.error_subcode,
    });
    return NextResponse.json({ error: 'Conversion could not be delivered.' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    events_received: result?.events_received ?? 0,
    trace_id: result?.fbtrace_id ?? null,
    test_event: Boolean(testEventCode),
  });
}
