import JsonLd from "@/components/seo/json-ld";
import { discoveryMetadata, discoverySchema } from "@/lib/page-discovery";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isSiteLocale } from "@/lib/seo";
import { FEATURE_LOCALES, featureCopy, isFeatureLocale } from "@/lib/features";
import { PARTNER_LANGUAGE_NAMES } from "@/lib/partners/locales";
import "./features.css";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isFeatureLocale(locale)) return {};
  return discoveryMetadata("features", locale);
}

const groups = [
  {
    id: "personal",
    items: ["today", "training", "nutrition", "progress", "coach", "health"],
  },
  { id: "community", items: ["gyms", "community", "diamonds", "account"] },
  { id: "business", items: ["trainers", "owners"] },
] as const;
const symbols: Record<string, string> = {
  today: "◷",
  training: "↗",
  nutrition: "◉",
  progress: "↗",
  coach: "✦",
  health: "+",
  gyms: "⌂",
  community: "◎",
  trainers: "↗",
  owners: "⌂",
  diamonds: "◇",
  account: "◎",
};
export default async function Features({ params }: Props) {
  const { locale } = await params;
  if (!isFeatureLocale(locale)) notFound();
  const t = featureCopy(locale);
  const homeLocale = isSiteLocale(locale) ? locale : "en";
  const ios =
    process.env.NEXT_PUBLIC_APPSTORE_URL ||
    "https://apps.apple.com/app/id6760855966";
  const android =
    process.env.NEXT_PUBLIC_PLAYSTORE_URL ||
    "https://play.google.com/store/apps/details?id=com.fitliner.app";
  return (
    <main className="features-page">
      <JsonLd data={discoverySchema("features", locale)} />
      <nav className="features-nav features-container" aria-label={t.home}>
        <Link
          className="features-logo"
          href={`/${homeLocale}`}
          aria-label={`Fitliner — ${t.home}${homeLocale !== locale ? " (EN)" : ""}`}
        >
          FITLINER<span>®</span>
        </Link>
        <details className="features-language">
          <summary>
            {PARTNER_LANGUAGE_NAMES[locale]} <span aria-hidden="true">⌄</span>
            <span className="sr-only"> — {t.language}</span>
          </summary>
          <div>
            {FEATURE_LOCALES.map((l) => (
              <Link
                key={l}
                href={`/${l}/features`}
                lang={l}
                hrefLang={l}
                aria-current={l === locale ? "page" : undefined}
              >
                {PARTNER_LANGUAGE_NAMES[l]}
              </Link>
            ))}
          </div>
        </details>
      </nav>
      <header className="features-hero features-container">
        <div>
          <p className="features-kicker">FITLINER / {t.all}</p>
          <h1>{t.title}</h1>
          <p className="features-lead">{t.intro}</p>
          <div className="features-actions">
            <a className="features-button" href="#personal">
              {t.browse}
              <span aria-hidden="true">↓</span>
            </a>
            <a className="features-text-link" href="#download">
              {t.download} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <figure className="features-visual">
          <Image
            src="/images/audiences/member-couple.webp"
            alt={t.imageNote}
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 800px) 100vw, 45vw"
          />
          <figcaption>{t.imageNote}</figcaption>
          <div className="features-visual-caption" aria-hidden="true">
            {t.teaser}
            <br />
            <em>FITLINER.</em>
          </div>
        </figure>
      </header>
      <nav className="features-jump features-container" aria-label={t.all}>
        {groups.map((g, i) => (
          <a key={g.id} href={`#${g.id}`}>
            <span>0{i + 1}</span>
            {t[g.id]}
            <span aria-hidden="true">↓</span>
          </a>
        ))}
      </nav>
      <div className="features-container">
        {groups.map((g, i) => (
          <section
            className="features-group"
            id={g.id}
            key={g.id}
            aria-labelledby={`${g.id}-title`}
          >
            <div className="features-section-heading">
              <p className="features-kicker">0{i + 1} / FITLINER</p>
              <h2 id={`${g.id}-title`}>{t[g.id]}</h2>
            </div>
            <div className="features-grid">
              {g.items.map((id) => {
                const item = t.sections.find((s) => s.id === id)!;
                const related =
                  id === "health"
                    ? "health"
                    : id === "gyms" || id === "owners"
                      ? "gyms"
                      : id === "trainers"
                        ? "trainers"
                        : null;
                const relatedLocale =
                  isSiteLocale(locale) ||
                  (locale === "pl" && related === "gyms")
                    ? locale
                    : "en";
                return (
                  <article
                    className="feature-card"
                    id={`feature-${id}`}
                    key={id}
                  >
                    <div className="feature-icon" aria-hidden="true">
                      {symbols[id]}
                    </div>
                    <h3>{item.title}</h3>
                    <p className="feature-summary">{item.summary}</p>
                    <ul>
                      {item.items.map((text) => (
                        <li key={text}>{text}</li>
                      ))}
                    </ul>
                    {related && (
                      <Link
                        className="features-text-link feature-related"
                        href={`/${relatedLocale}/${related}`}
                      >
                        {item.title}
                        {relatedLocale !== locale ? " (EN)" : ""}
                        <span aria-hidden="true"> ↗</span>
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
        <aside className="features-availability" id="availability">
          <h2>{t.availabilityTitle}</h2>
          <p>{t.availability}</p>
          <details>
            <summary>{t.rolloutTitle}</summary>
            <p>{t.rollout}</p>
          </details>
        </aside>
        <section id="download" className="features-download">
          <p className="features-kicker">FITLINER / iOS & Android</p>
          <h2>{t.footer}</h2>
          <div className="features-store-links">
            {[
              { name: "App Store", href: ios, icon: "appstore" },
              { name: "Google Play", href: android, icon: "googleplay" },
            ].map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t.download} — ${s.name}`}
              >
                <Image
                  src={`/badge/${s.icon}.png`}
                  alt=""
                  width={32}
                  height={36}
                />
                <span>
                  <small>{t.download}</small>
                  <strong>{s.name}</strong>
                </span>
              </a>
            ))}
          </div>
        </section>
        <footer className="features-footer">
          <span>© {new Date().getFullYear()} Fitliner</span>
          <Link href={`/${homeLocale}`}>
            {t.home}
            {homeLocale !== locale ? " (EN)" : ""} ↗
          </Link>
        </footer>
      </div>
    </main>
  );
}
