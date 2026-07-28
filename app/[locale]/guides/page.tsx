import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/json-ld';
import {GUIDES, GUIDE_LOCALES, isGuideLocale} from '@/lib/guides';
import {absoluteUrl, pageMetadata, SITE_URL} from '@/lib/seo';

type PageProps = {params: Promise<{locale: string}> | {locale: string}};

export function generateStaticParams() {
  return GUIDE_LOCALES.map((locale) => ({locale}));
}

function languages(path = '') {
  return {
    en: absoluteUrl(`/en/guides${path}`),
    sk: absoluteUrl(`/sk/guides${path}`),
    'x-default': absoluteUrl(`/en/guides${path}`)
  };
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const resolved = params instanceof Promise ? await params : params;
  if (!isGuideLocale(resolved.locale)) return {};
  const sk = resolved.locale === 'sk';
  return pageMetadata({
    locale: resolved.locale,
    path: 'guides',
    title: sk ? 'Fitliner návody: gym technológie, vstup a Health' : 'Fitliner Guides: Gym Technology, Access and Health',
    description: sk
      ? 'Praktické a transparentné návody o mobilnom vstupe do fitka, výbere gym systému a zodpovednom spracovaní zdravotných reportov.'
      : 'Practical, transparent guides to phone-based gym access, gym software selection and responsible health-report organization.',
    languages: languages()
  });
}

export default async function GuidesPage({params}: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  if (!isGuideLocale(resolved.locale)) notFound();
  const locale = resolved.locale;
  const sk = locale === 'sk';
  const guides = Object.values(GUIDES[locale]);
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/${locale}/guides#page`,
    name: sk ? 'Fitliner návody' : 'Fitliner guides',
    url: `${SITE_URL}/${locale}/guides`,
    inLanguage: locale,
    hasPart: guides.map((guide) => ({
      '@type': 'Article',
      headline: guide.title,
      description: guide.description,
      url: `${SITE_URL}/${locale}/guides/${guide.slug}`
    }))
  };

  return (
    <main className="min-h-screen bg-[#0B0B0D] text-white">
      <JsonLd data={itemList} />
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-18">
        <Link className="text-sm text-white/60 hover:text-white" href={`/${locale}`}>← {sk ? 'Späť na Fitliner' : 'Back to Fitliner'}</Link>
        <header className="mt-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{sk ? 'Fitliner knowledge base' : 'Fitliner knowledge base'}</p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-6xl">{sk ? 'Praktické návody bez SEO vaty.' : 'Practical guides without the SEO filler.'}</h1>
          <p className="mt-6 text-base leading-8 text-white/65 sm:text-lg">
            {sk
              ? 'Vysvetľujeme, ako technológia reálne funguje, kde sú jej limity a na čo sa pýtať pred rozhodnutím. Obsah vychádza z dokumentovaných funkcií Fitliner a jasne oddeľuje produktové informácie od zdravotnej rady.'
              : 'We explain how the technology works, where its limits are and what to ask before making a decision. Content is based on documented Fitliner functionality and clearly separates product information from medical advice.'}
          </p>
        </header>

        <section className="mt-12 grid gap-5" aria-label={sk ? 'Návody' : 'Guides'}>
          {guides.map((guide) => (
            <article key={guide.slug} className="rounded-[2rem] border border-white/10 bg-white/5 p-7 sm:p-9">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#A78BFA]">{guide.eyebrow}</div>
              <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
                <Link className="hover:text-[#C4B5FD]" href={`/${locale}/guides/${guide.slug}`}>{guide.title}</Link>
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/63 sm:text-base">{guide.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                <span className="text-white/40">{guide.readingTime}</span>
                <Link className="font-semibold text-[#B9A1FF] hover:text-white" href={`/${locale}/guides/${guide.slug}`}>
                  {sk ? 'Čítať celý návod' : 'Read the full guide'} →
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
