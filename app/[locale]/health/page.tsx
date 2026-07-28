import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/json-ld';
import HealthFunnel from '@/components/health/health-funnel';
import {HEALTH_SEO, isSiteLocale, pageMetadata, SITE_URL} from '@/lib/seo';

const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;

export async function generateMetadata({params}: {params: Promise<{locale: string}> | {locale: string}}): Promise<Metadata> {
  const resolved = params instanceof Promise ? await params : params;
  if (!isSiteLocale(resolved.locale)) return {};
  return pageMetadata({
    locale: resolved.locale,
    path: 'health',
    ...HEALTH_SEO[resolved.locale],
    image: '/images/health/fitliner-health-paper-to-history-hero.jpg'
  });
}

export default async function HealthPage({params}: {params: Promise<{locale: string}> | {locale: string}}) {
  const resolved = params instanceof Promise ? await params : params;
  if (!LOCALES.includes(resolved.locale as (typeof LOCALES)[number])) notFound();
  const locale = resolved.locale as (typeof LOCALES)[number];
  const healthApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/${locale}/health#application`,
    name: 'Fitliner Health Card',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'iOS, Android, Web',
    url: `${SITE_URL}/${locale}/health`,
    description: HEALTH_SEO[locale].description,
    image: `${SITE_URL}/images/health/fitliner-health-paper-to-history-hero.jpg`,
    publisher: {'@id': `${SITE_URL}/#organization`},
    offers: {
      '@type': 'Offer',
      price: '34.80',
      priceCurrency: 'EUR',
      category: 'annual subscription',
      availability: 'https://schema.org/InStock'
    },
    featureList: [
      'Import laboratory and diagnostic-scale reports',
      'Review extracted values before saving',
      'Follow confirmed metrics over time',
      'Contextual guidance with clear medical limitations'
    ]
  };

  return <><JsonLd data={healthApplication} /><HealthFunnel locale={locale} /></>;
}
