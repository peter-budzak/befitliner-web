import {promises as fs} from 'fs';
import path from 'path';
import Link from 'next/link';
import {notFound} from 'next/navigation';

const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;
type Locale = (typeof LOCALES)[number];

type Messages = {
  brand: string;
  h1: string;
  sub: string;
  cta_ios: string;
  cta_android: string;
  note: string;
  footer: {
    claim: string;
    links_title: string;
    privacy: string;
    terms: string;
    for_gyms: string;
    app_title: string;
    download_ios: string;
    download_android: string;
    rights: string;
  };
};

async function loadMessages(locale: string): Promise<Messages> {
  if (!LOCALES.includes(locale as any)) notFound();
  const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as Messages;
}

function LanguageSwitcherDesktop({current}: {current: string}) {
  const FLAGS: Record<string, string> = {
    en: '🇺🇸',
    sk: '🇸🇰',
    de: '🇩🇪',
    es: '🇪🇸',
    fr: '🇫🇷',
    'zh-Hans': '🇨🇳'
  };

  return (
    <div className="hidden items-center gap-2 sm:flex">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}`}
          title={l}
          className={
            'flex h-8 w-8 items-center justify-center rounded-full border text-lg transition ' +
            (l === current
              ? 'border-white/40 bg-white/15'
              : 'border-white/10 bg-white/5 hover:bg-white/10')
          }
        >
          {FLAGS[l]}
        </Link>
      ))}
    </div>
  );
}

function LanguageSwitcherMobile({current}: {current: string}) {
  const FLAGS: Record<string, string> = {
    en: '🇺🇸',
    sk: '🇸🇰',
    de: '🇩🇪',
    es: '🇪🇸',
    fr: '🇫🇷',
    'zh-Hans': '🇨🇳'
  };

  const currentFlag = FLAGS[current] ?? '🌐';

  return (
    <details className="relative sm:hidden">
      <summary className="list-none cursor-pointer select-none">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
          <span className="text-lg">{currentFlag}</span>
          <span className="text-xs text-white/60">{current}</span>
          <span className="ml-1 text-white/50">▾</span>
        </div>
      </summary>

      <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0D] shadow-2xl">
        {LOCALES.map((l) => (
          <Link
            key={l}
            href={`/${l}`}
            className={
              'flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 ' +
              (l === current ? 'bg-white/5' : '')
            }
          >
            <span className="text-lg">{FLAGS[l]}</span>
            <span className="text-xs text-white/70">{l}</span>
          </Link>
        ))}
      </div>
    </details>
  );
}

export default async function Page({
  params
}: {
  params: Promise<{locale: Locale}> | {locale: Locale};
}) {
  const resolved = params instanceof Promise ? await params : params;
  const locale = resolved.locale;
  const t = await loadMessages(locale);

  // TODO: keď budeš mať linky, dáme ich sem alebo do env:
  const iosUrl = process.env.NEXT_PUBLIC_APPSTORE_URL || '#';
  const androidUrl = process.env.NEXT_PUBLIC_PLAYSTORE_URL || '#';

  return (
    <main className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 font-semibold tracking-wide">
            <img
              src="/icon.png"
              alt="BeFitliner logo"
              className="h-9 w-9 rounded-xl"
            />
            <span>{t.brand}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcherMobile current={locale} />
            <LanguageSwitcherDesktop current={locale} />
          </div>
        </div>

        <section className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              {t.h1}
            </h1>

            <p className="mt-5 text-lg text-white/75">{t.sub}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={iosUrl}
                className="rounded-2xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold hover:opacity-95"
              >
                {t.cta_ios}
              </a>

              <a
                href={androidUrl}
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10"
              >
                {t.cta_android}
              </a>
            </div>

            <div className="mt-4 text-xs text-white/55">{t.note}</div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-[#7C3AED]/25 blur-3xl" />

            <div className="relative mx-auto w-full max-w-sm rounded-[2.2rem] border border-white/10 bg-white/5 p-4 shadow-2xl">
              {/* Phone frame */}
              <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/40">
                {/* Top notch bar */}
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="h-2 w-24 rounded-full bg-white/10" />
                  <div className="h-2 w-10 rounded-full bg-white/10" />
                </div>

                {/* Screenshot */}
                <div className="px-4 pb-4">
                  <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-black">
                    <img
                      src="/app_screen.png"
                      alt="Fitliner app screenshot"
                      className="h-[560px] w-full object-cover object-top"
                    />
                  </div>

                  
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-white/10 pt-10 pb-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="text-sm font-semibold text-white">{t.brand}</div>
              <div className="mt-2 text-sm text-white/60">{t.footer.claim}</div>
            </div>

            {/* Links */}
            <div className="text-sm">
              <div className="text-white/70">{t.footer.links_title}</div>
              <div className="mt-3 flex flex-col gap-2 text-white/60">
                <Link className="hover:text-white" href={`/${locale}/privacy`}>
                  🛡️ {t.footer.privacy}
                </Link>
                <Link className="hover:text-white" href={`/${locale}/terms`}>
                  📄 {t.footer.terms}
                </Link>
                <Link className="hover:text-white" href={`/${locale}/gyms`}>
                  🏋️ {t.footer.for_gyms}
                </Link>
              </div>
            </div>

            {/* App */}
            <div className="text-sm">
              <div className="text-white/70">{t.footer.app_title}</div>
              <div className="mt-3 flex flex-col gap-2 text-white/60">
                <a className="hover:text-white" href={iosUrl}>
                   {t.footer.download_ios}
                </a>
                <a className="hover:text-white" href={androidUrl}>
                  ▶︎ {t.footer.download_android}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 text-xs text-white/40">
            © {new Date().getFullYear()} BeFitliner. {t.footer.rights}
          </div>
        </footer>
      </div>
    </main>
  );
}