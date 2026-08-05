import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/json-ld';
import {GUIDES, GUIDE_LOCALES, GUIDE_SLUGS, isGuideLocale, isGuideSlug} from '@/lib/guides';
import {absoluteUrl, pageMetadata, SITE_URL} from '@/lib/seo';

type PageProps = {params: Promise<{locale: string; slug: string}> | {locale: string; slug: string}};

export function generateStaticParams() {
  return GUIDE_LOCALES.flatMap((locale) => GUIDE_SLUGS.map((slug) => ({locale, slug})));
}

function languages(slug: string) {
  return {
    en: absoluteUrl(`/en/guides/${slug}`),
    sk: absoluteUrl(`/sk/guides/${slug}`),
    'x-default': absoluteUrl(`/en/guides/${slug}`)
  };
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const resolved = params instanceof Promise ? await params : params;
  if (!isGuideLocale(resolved.locale) || !isGuideSlug(resolved.slug)) return {};
  const guide = GUIDES[resolved.locale][resolved.slug];
  return pageMetadata({
    locale: resolved.locale,
    path: `guides/${resolved.slug}`,
    title: guide.title,
    description: guide.description,
    languages: languages(resolved.slug)
  });
}

export default async function GuidePage({params}: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  if (!isGuideLocale(resolved.locale) || !isGuideSlug(resolved.slug)) notFound();
  const locale = resolved.locale;
  const guide = GUIDES[locale][resolved.slug];
  const sk = locale === 'sk';
  const articleUrl = `${SITE_URL}/${locale}/guides/${guide.slug}`;
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${articleUrl}#article`,
      headline: guide.title,
      description: guide.description,
      url: articleUrl,
      mainEntityOfPage: articleUrl,
      inLanguage: locale,
      datePublished: '2026-07-28',
      dateModified: '2026-07-28',
      author: {'@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Fitliner Product Team'},
      publisher: {'@id': `${SITE_URL}/#organization`},
      image: `${SITE_URL}/og/gym-default.png`
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {'@type': 'ListItem', position: 1, name: 'Fitliner', item: `${SITE_URL}/${locale}`},
        {'@type': 'ListItem', position: 2, name: sk ? 'Návody' : 'Guides', item: `${SITE_URL}/${locale}/guides`},
        {'@type': 'ListItem', position: 3, name: guide.title, item: articleUrl}
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-[#0B0B0D] text-white">
      <JsonLd data={schemas} />
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 sm:py-18">
        <nav aria-label="Breadcrumb" className="text-sm text-white/50">
          <Link className="hover:text-white" href={`/${locale}`}>Fitliner</Link>
          <span aria-hidden className="mx-2">/</span>
          <Link className="hover:text-white" href={`/${locale}/guides`}>{sk ? 'Návody' : 'Guides'}</Link>
        </nav>

        <article className="mt-10">
          <header className="border-b border-white/10 pb-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{guide.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-6xl">{guide.title}</h1>
            <p className="mt-6 text-lg leading-8 text-white/68">{guide.intro}</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/42">
              <span>{guide.readingTime}</span>
              <time dateTime="2026-07-28">{sk ? 'Aktualizované 28. júla 2026' : 'Updated July 28, 2026'}</time>
              <span>{sk ? 'Fitliner Product Team' : 'Fitliner Product Team'}</span>
            </div>
          </header>

          <aside className="mt-8 rounded-3xl border border-[#8B5CF6]/25 bg-[#7C3AED]/10 p-6" aria-label={sk ? 'Kľúčové zistenia' : 'Key takeaways'}>
            <h2 className="text-lg font-bold">{sk ? 'Čo si odniesť' : 'Key takeaways'}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/72">
              {guide.takeaways.map((item) => <li key={item} className="flex gap-3"><span className="text-[#B9A1FF]">✓</span><span>{item}</span></li>)}
            </ul>
          </aside>

          <div className="mt-10 space-y-12">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-bold tracking-[-0.02em] sm:text-3xl">{section.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-white/72">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                {section.bullets && (
                  <ul className="mt-5 space-y-3 pl-5 text-base leading-7 text-white/68">
                    {section.bullets.map((item) => <li key={item} className="list-disc pl-1">{item}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <footer className="mt-14 border-t border-white/10 pt-8">
            <p className="text-sm leading-7 text-white/50">
              {sk
                ? 'Ako bol obsah vytvorený: článok pripravil Fitliner Product Team podľa dokumentovaných funkcií produktu a prevádzkových obmedzení. Zdravotný obsah je produktové vysvetlenie, nie medicínska rada.'
                : 'How this content was created: the Fitliner Product Team prepared this guide from documented product behaviour and operational limitations. Health content explains the product and is not medical advice.'}
            </p>
            <Link className="mt-6 inline-flex rounded-2xl bg-[#8B5CF6] px-6 py-3 font-semibold hover:brightness-110" href={guide.relatedProduct.href}>
              {guide.relatedProduct.label} →
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
