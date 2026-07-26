import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import HealthFunnel from '@/components/health/health-funnel';

const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;

export const metadata: Metadata = {
  title: 'Fitliner Health Card',
  description: 'Turn lab and diagnostic scale reports into a clear, secure health timeline with personalized Fitliner guidance.',
};

export default async function HealthPage({params}: {params: Promise<{locale: string}> | {locale: string}}) {
  const resolved = params instanceof Promise ? await params : params;
  if (!LOCALES.includes(resolved.locale as (typeof LOCALES)[number])) notFound();
  return <HealthFunnel locale={resolved.locale} />;
}
