import {notFound} from 'next/navigation';
import {isSiteLocale, LOCALES} from '@/lib/seo';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({locale}));
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

  if (!locale || !isSiteLocale(locale)) {
    notFound();
  }

  // Root layout (`app/layout.tsx`) owns <html>/<body>.
  return children;
}
