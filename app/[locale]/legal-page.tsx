import {promises as fs} from 'fs';
import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import path from 'path';
import matter from 'gray-matter';
import {remark} from 'remark';
import remarkHtml from 'remark-html';

export const LEGAL_LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;
export type LegalLocale = (typeof LEGAL_LOCALES)[number];
export type LegalDocument = 'privacy' | 'terms';

export type LegalPageProps = {
  params: Promise<{locale: string}> | {locale: string};
};

const LANGUAGE_TAGS: Record<LegalLocale, string> = {
  en: 'en',
  sk: 'sk',
  de: 'de',
  es: 'es',
  fr: 'fr',
  'zh-Hans': 'zh-Hans'
};

const LANGUAGE_LABELS: Record<LegalLocale, string> = {
  en: 'English',
  sk: 'Slovenčina',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  'zh-Hans': '简体中文'
};

const UI: Record<
  LegalLocale,
  {back: string; lastUpdated: string; languages: string; related: string; privacy: string; terms: string}
> = {
  en: {
    back: 'Back to Fitliner',
    lastUpdated: 'Last updated',
    languages: 'Languages',
    related: 'Related legal document',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use'
  },
  sk: {
    back: 'Späť na Fitliner',
    lastUpdated: 'Naposledy aktualizované',
    languages: 'Jazyky',
    related: 'Súvisiaci právny dokument',
    privacy: 'Zásady ochrany osobných údajov',
    terms: 'Podmienky používania'
  },
  de: {
    back: 'Zurück zu Fitliner',
    lastUpdated: 'Zuletzt aktualisiert',
    languages: 'Sprachen',
    related: 'Zugehöriges Rechtsdokument',
    privacy: 'Datenschutzerklärung',
    terms: 'Nutzungsbedingungen'
  },
  es: {
    back: 'Volver a Fitliner',
    lastUpdated: 'Última actualización',
    languages: 'Idiomas',
    related: 'Documento legal relacionado',
    privacy: 'Política de privacidad',
    terms: 'Términos de uso'
  },
  fr: {
    back: 'Retour à Fitliner',
    lastUpdated: 'Dernière mise à jour',
    languages: 'Langues',
    related: 'Document juridique associé',
    privacy: 'Politique de confidentialité',
    terms: 'Conditions d’utilisation'
  },
  'zh-Hans': {
    back: '返回 Fitliner',
    lastUpdated: '最后更新',
    languages: '语言',
    related: '相关法律文件',
    privacy: '隐私政策',
    terms: '使用条款'
  }
};

function isLegalLocale(value: string): value is LegalLocale {
  return LEGAL_LOCALES.includes(value as LegalLocale);
}

function isoDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const text = String(value ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
}

async function resolveLocale(params: LegalPageProps['params']): Promise<LegalLocale> {
  const resolved = params instanceof Promise ? await params : params;
  if (!isLegalLocale(resolved.locale)) notFound();
  return resolved.locale;
}

async function loadLegalMarkdown(locale: LegalLocale, document: LegalDocument) {
  const filePath = path.join(
    process.cwd(),
    'content',
    'legal',
    locale,
    `${document}.md`
  );

  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch {
    // A missing translation must fail loudly instead of silently publishing
    // English contract text under another language URL.
    notFound();
  }

  const parsed = matter(raw);
  const title = String(parsed.data.title ?? '').trim();
  const description = String(parsed.data.description ?? '').trim();
  const lastUpdated = isoDate(parsed.data.lastUpdated);

  if (!title || !description || !lastUpdated) {
    throw new Error(`Invalid legal document front matter: ${filePath}`);
  }

  const processed = await remark().use(remarkHtml).process(parsed.content);
  return {
    title,
    description,
    lastUpdated,
    html: processed.toString()
  };
}

function localizedDate(value: string, locale: LegalLocale) {
  return new Intl.DateTimeFormat(LANGUAGE_TAGS[locale], {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(new Date(`${value}T00:00:00Z`));
}

export async function buildLegalMetadata(
  params: LegalPageProps['params'],
  document: LegalDocument
): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = await loadLegalMarkdown(locale, document);
  const pathName = `/${locale}/${document}`;
  const languages = Object.fromEntries([
    ...LEGAL_LOCALES.map((item) => [LANGUAGE_TAGS[item], `/${item}/${document}`]),
    ['x-default', `/en/${document}`]
  ]);

  return {
    title: content.title,
    description: content.description,
    alternates: {canonical: pathName, languages},
    openGraph: {
      type: 'website',
      url: pathName,
      title: content.title,
      description: content.description,
      locale: LANGUAGE_TAGS[locale]
    },
    robots: {index: true, follow: true}
  };
}

export async function LegalDocumentPage({
  params,
  document
}: LegalPageProps & {document: LegalDocument}) {
  const locale = await resolveLocale(params);
  const content = await loadLegalMarkdown(locale, document);
  const ui = UI[locale];
  const relatedDocument: LegalDocument = document === 'privacy' ? 'terms' : 'privacy';

  return (
    <main lang={LANGUAGE_TAGS[locale]} className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
        <Link className="text-sm text-white/70 transition hover:text-white" href={`/${locale}`}>
          ← {ui.back}
        </Link>

        <header className="mt-7 border-b border-white/10 pb-7">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.title}</h1>
          <p className="mt-3 text-sm text-white/55">
            {ui.lastUpdated}: <time dateTime={content.lastUpdated}>{localizedDate(content.lastUpdated, locale)}</time>
          </p>
          <nav aria-label={ui.languages} className="mt-5 flex flex-wrap gap-2">
            {LEGAL_LOCALES.map((item) => (
              <Link
                key={item}
                href={`/${item}/${document}`}
                hrefLang={LANGUAGE_TAGS[item]}
                aria-current={item === locale ? 'page' : undefined}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  item === locale
                    ? 'border-[#9B7BFF] bg-[#7C3AED]/25 text-white'
                    : 'border-white/15 text-white/65 hover:border-white/35 hover:text-white'
                }`}
              >
                {LANGUAGE_LABELS[item]}
              </Link>
            ))}
          </nav>
        </header>

        <article
          className="legal-copy mt-8"
          dangerouslySetInnerHTML={{__html: content.html}}
        />

        <footer className="mt-12 border-t border-white/10 pt-7 text-sm text-white/65">
          <p>{ui.related}</p>
          <Link className="mt-2 inline-block font-semibold text-[#B9A1FF] hover:text-white" href={`/${locale}/${relatedDocument}`}>
            {ui[relatedDocument]} →
          </Link>
        </footer>
      </div>
    </main>
  );
}
