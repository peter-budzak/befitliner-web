import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HealthFunnel from '@/components/health/health-funnel';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== 'sk') return {};

  return {
    title: 'Fitliner Health – zdravotné výsledky a trendy na jednom mieste',
    description:
      'Nahrajte výsledky krvných testov a diagnostickej váhy, sledujte ich vývoj a vytvorte si dlhodobý zdravotný prehľad.',
    alternates: {
      canonical: 'https://befitliner.com/sk/health',
    },
    openGraph: {
      title: 'Fitliner Health – vaše výsledky v jednom prehľade',
      description:
        'Výsledky krvných testov, diagnostickej váhy a ich vývoj prehľadne v Health Card.',
      url: 'https://befitliner.com/sk/health',
      siteName: 'Fitliner',
      type: 'website',
      locale: 'sk_SK',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function HealthPage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'sk') notFound();

  return <HealthFunnel locale={locale} />;
}
