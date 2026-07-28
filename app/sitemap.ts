import type {MetadataRoute} from 'next';
import {absoluteUrl, LOCALES, localizedAlternates} from '@/lib/seo';

const LAST_PRODUCT_UPDATE = new Date('2026-07-28T00:00:00Z');
const guideSlugs = ['phone-gym-access', 'gym-management-software-checklist', 'health-report-timeline'];

export default function sitemap(): MetadataRoute.Sitemap {
  const productPages = LOCALES.flatMap((locale) => [
    {
      url: absoluteUrl(`/${locale}`),
      lastModified: LAST_PRODUCT_UPDATE,
      changeFrequency: 'monthly' as const,
      priority: locale === 'en' ? 1 : 0.9,
      alternates: {languages: localizedAlternates()}
    },
    {
      url: absoluteUrl(`/${locale}/health`),
      lastModified: LAST_PRODUCT_UPDATE,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
      alternates: {languages: localizedAlternates('health')},
      images: [absoluteUrl('/images/health/fitliner-health-paper-to-history-hero.jpg')]
    },
    {
      url: absoluteUrl(`/${locale}/gyms`),
      lastModified: LAST_PRODUCT_UPDATE,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
      alternates: {languages: localizedAlternates('gyms')}
    }
  ]);

  const guideLanguages = (suffix = '') => ({
    en: absoluteUrl(`/en/guides${suffix}`),
    sk: absoluteUrl(`/sk/guides${suffix}`),
    'x-default': absoluteUrl(`/en/guides${suffix}`)
  });

  const guides: MetadataRoute.Sitemap = ['en', 'sk'].flatMap((locale) => [
    {
      url: absoluteUrl(`/${locale}/guides`),
      lastModified: LAST_PRODUCT_UPDATE,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
      alternates: {languages: guideLanguages()}
    },
    ...guideSlugs.map((slug) => ({
      url: absoluteUrl(`/${locale}/guides/${slug}`),
      lastModified: LAST_PRODUCT_UPDATE,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
      alternates: {languages: guideLanguages(`/${slug}`)}
    }))
  ]);

  return [...productPages, ...guides];
}
