import {NextRequest, NextResponse} from 'next/server';

type SupportedLocale = 'sk' | 'en' | 'de' | 'es' | 'fr' | 'zh-Hans';

function localeFromRequest(request: NextRequest): SupportedLocale {
  const preferred = request.headers
    .get('accept-language')
    ?.split(',')
    .map((entry) => entry.trim().split(';')[0]?.toLowerCase())
    .filter(Boolean) ?? [];

  for (const language of preferred) {
    if (language === 'sk' || language.startsWith('sk-')) return 'sk';
    if (language === 'de' || language.startsWith('de-')) return 'de';
    if (language === 'es' || language.startsWith('es-')) return 'es';
    if (language === 'fr' || language.startsWith('fr-')) return 'fr';
    if (language === 'zh' || language.startsWith('zh-')) return 'zh-Hans';
    if (language === 'en' || language.startsWith('en-')) return 'en';
  }

  return 'en';
}

export function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${localeFromRequest(request)}/gyms/success`;
  redirectUrl.search = '';

  return NextResponse.redirect(redirectUrl, 307);
}
