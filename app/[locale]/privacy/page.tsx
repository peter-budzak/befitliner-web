import {promises as fs} from 'fs';
import path from 'path';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import matter from 'gray-matter';
import {remark} from 'remark';
import remarkHtml from 'remark-html';

const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;
type Locale = (typeof LOCALES)[number];

async function safeReadJson(filePath: string): Promise<any | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw?.trim()) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function loadMessages(locale: Locale): Promise<any> {
  if (!LOCALES.includes(locale as any)) notFound();

  const base = path.join(process.cwd(), 'messages');
  const localized = await safeReadJson(path.join(base, `${locale}.json`));
  if (localized) return localized;

  const fallback = await safeReadJson(path.join(base, `en.json`));
  return fallback ?? {};
}

async function loadLegalMarkdown(locale: Locale, doc: 'privacy' | 'terms') {
  const root = path.join(process.cwd(), 'content', 'legal');

  const tryPaths = [
    path.join(root, locale, `${doc}.md`),
    path.join(root, 'en', `${doc}.md`)
  ];

  let raw: string | null = null;
  for (const p of tryPaths) {
    try {
      raw = await fs.readFile(p, 'utf8');
      if (raw?.trim()) break;
    } catch {
      // continue
    }
  }

  if (!raw?.trim()) notFound();

  const parsed = matter(raw);

  const lastUpdatedMatch = parsed.content
    .split('\n')
    .slice(0, 30)
    .join('\n')
    .match(/^\s*Last updated:\s*(.+)\s*$/im);

  const lastUpdated =
    (typeof parsed.data?.lastUpdated === 'string' && parsed.data.lastUpdated.trim()) ||
    (typeof parsed.data?.last_updated === 'string' && parsed.data.last_updated.trim()) ||
    (lastUpdatedMatch?.[1]?.trim() ?? null);

  const processed = await remark().use(remarkHtml).process(parsed.content);
  const html = processed.toString();

  return {html, lastUpdated};
}

export default async function Page({
  params
}: {
  params: Promise<{locale: Locale}> | {locale: Locale};
}) {
  const resolved = params instanceof Promise ? await params : params;
  const locale = resolved.locale;

  const t = await loadMessages(locale);

  const title = t?.footer?.privacy ?? 'Privacy Policy';
  const back = t?.brand ? `← ${t.brand}` : '← Back';

  const {html, lastUpdated} = await loadLegalMarkdown(locale, 'privacy');

  return (
    <main className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link className="text-sm text-white/70 hover:text-white" href={`/${locale}`}>
          {back}
        </Link>

        <h1 className="mt-6 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-white/50">
          Last updated: {lastUpdated ?? '—'}
        </p>
        <article
          className="prose prose-invert mt-8 max-w-none prose-headings:scroll-mt-24 prose-a:text-white/90 hover:prose-a:text-white"
          dangerouslySetInnerHTML={{__html: html}}
        />
      </div>
    </main>
  );
}