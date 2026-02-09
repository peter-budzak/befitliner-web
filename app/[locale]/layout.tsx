import {notFound} from 'next/navigation';

const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}> | {locale: string};
}) {
  const resolved = params instanceof Promise ? await params : params;
  const locale = resolved?.locale;

  if (!locale || !LOCALES.includes(locale as any)) {
    notFound();
  }

  // Root layout (`app/layout.tsx`) owns <html>/<body>.
  return children;
}