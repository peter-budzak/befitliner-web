import {notFound} from 'next/navigation';
import {isGymLocale, GYM_LOCALES} from '@/lib/seo';

export function generateStaticParams() {
  return GYM_LOCALES.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}> | {locale: string};
}) {
  const resolved = params instanceof Promise ? await params : params;
  const locale = resolved?.locale;

  if (!locale || !isGymLocale(locale)) {
    notFound();
  }

  // Root layout (`app/layout.tsx`) owns <html>/<body>.
  return children;
}
