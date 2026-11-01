import {NextResponse} from 'next/server';
import {webAppEnabled} from '@/lib/web-app';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  const headers = {'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer'};
  if (!webAppEnabled()) {
    return new Response('Webové prihlásenie zatiaľ nie je dostupné. Použite mobilnú aplikáciu Fitliner.', {status: 503, headers});
  }
  // Fixed destination; never forward returnTo, tokens or email from query strings.
  return NextResponse.redirect(new URL('/app/index.html', request.url), {status: 307, headers});
}
