import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/json-ld';
import {
  GymFaq,
  GymLink,
  GymQualification,
  GymTracking,
} from '@/components/gyms/gyms-interactions';
import {
  GYMS_COPY,
  GYMS_CHECKOUT_URL,
  GYMS_VEED_EMBED_URL,
  GYMS_PACKAGE_IMAGE,
} from '@/lib/gyms';
import {
  isSiteLocale,
  LOCALES,
  pageMetadata,
  SITE_URL,
  SUPPORT_EMAIL,
} from '@/lib/seo';
import './gyms.css';

type PageProps = {params: Promise<{locale: string}> | {locale: string}};
export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale} = await params;
  if (!isSiteLocale(locale)) return {};
  const copy = GYMS_COPY[locale];
  return pageMetadata({
    locale,
    path: 'gyms',
    title: `${copy.eyebrow} · ${copy.sticky}`,
    description: copy.intro,
  });
}

function AccessIcon({kind}: {kind: number}) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      {kind === 0 ? (
        <>
          <path d="M18 68V12h38v56M12 68h52M27 60V20h21v40Z" />
          <path d="M41 37v9M61 27h9v18h-9zM63 34h5" />
        </>
      ) : kind === 1 ? (
        <>
          <path d="M12 68h47M19 68V14h35v54M25 14v10h23V14M44 39v9M62 35h12v16H62z" />
          <circle cx="68" cy="43" r="2" />
        </>
      ) : (
        <>
          <path d="M12 28h56v17H12zM20 45v24M60 45v24M40 39v22M40 48l-17-8M40 48l18-12" />
          <path d="M53 21h9" />
        </>
      )}
    </svg>
  );
}

export default async function GymsPage({params}: PageProps) {
  const {locale} = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = GYMS_COPY[locale];
  const order = (location: string, label = t.cta) => (
    <GymLink href="#offer" location={location} className="gym-button">
      {label}
      <span aria-hidden="true">↗</span>
    </GymLink>
  );
  const callHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${t.eyebrow} — ${t.verify}`)}`;
  return (
    <main className="gym-landing">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${SITE_URL}/${locale}/gyms#service`,
            name: t.eyebrow,
            description: t.intro,
            url: `${SITE_URL}/${locale}/gyms`,
            provider: {'@id': `${SITE_URL}/#organization`},
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            inLanguage: locale,
            mainEntity: t.faq.map(([name, text]) => ({
              '@type': 'Question',
              name,
              acceptedAnswer: {'@type': 'Answer', text},
            })),
          },
        ]}
      />
      <nav className="gym-nav gym-container" aria-label={t.eyebrow}>
        <Link className="gym-wordmark" href={`/${locale}`}>
          FITLINER<span>®</span>
        </Link>
        <div className="gym-languages">
          {LOCALES.map((lang) => (
            <Link
              key={lang}
              href={`/${lang}/gyms`}
              hrefLang={lang}
              aria-current={lang === locale ? 'page' : undefined}
            >
              {lang === 'zh-Hans' ? '中文' : lang.toUpperCase()}
            </Link>
          ))}
        </div>
      </nav>

      <header id="gym-hero" className="gym-hero gym-container">
        <p className="gym-eyebrow">
          <span />
          {t.eyebrow}
        </p>
        <h1>{t.title}</h1>
        <p className="gym-intro">{t.intro}</p>
        <div id="film" className="gym-hero-video">
          <div className="gym-video">
            <iframe
              src={GYMS_VEED_EMBED_URL}
              title={t.watch}
              loading="eager"
              allow="fullscreen; picture-in-picture"
              allowFullScreen
              className="gym-veed-embed"
            />
          </div>
          {locale !== 'sk' && <p className="gym-small">{t.videoLanguage}</p>}
        </div>
        <div className="gym-hero-actions">
          {order('hero')}
        </div>
        <p className="gym-small">{t.shipping}</p>
        <ul className="gym-reassurance">
          {t.reassurance.map((item) => (
            <li key={item}>
              <span aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <div className="gym-hero-line" aria-hidden="true">
          <span>FITLINER</span>
          <span>01 — 13</span>
        </div>
      </header>

      <section className="gym-section gym-container">
        <div className="gym-section-heading">
          <span className="gym-index">02 /</span>
          <h2>{t.automationTitle}</h2>
        </div>
        <p className="gym-body">{t.automationBody}</p>
        <ol className="gym-workflow">
          {t.workflow.map((step, index) => (
            <li key={step}>
              <span className="gym-step-number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p>{step}</p>
              <span className="gym-flow-arrow" aria-hidden="true">
                ↓
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="gym-existing">
        <div className="gym-container gym-split">
          <div>
            <p className="gym-eyebrow">03 / {t.existingTitle}</p>
            <h2>{t.existingAnswer}</h2>
            <p className="gym-body">{t.existingBody}</p>
            <ul className="gym-check-list">
              {t.existingBenefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <GymLink
              href="#compatibility"
              event="gyms_existing_system_cta_click"
              location="existing-system"
              className="gym-text-link"
            >
              {t.verify} <span aria-hidden="true">↗</span>
            </GymLink>
          </div>
          <div
            className="gym-system-diagram"
            aria-label={`${t.currentSystem} + Fitliner → ${t.door}`}
          >
            <div className="gym-system-inputs">
              <div>
                <span aria-hidden="true">▤</span>
                {t.currentSystem}
              </div>
              <span className="gym-plus" aria-hidden="true">
                +
              </span>
              <div className="gym-system-fitliner">
                <span aria-hidden="true">F</span>FITLINER
              </div>
            </div>
            <div className="gym-system-connector" aria-hidden="true" />
            <div className="gym-system-door">
              <AccessIcon kind={0} />
              <span>{t.door}</span>
            </div>
            <p>{t.existingBenefits[2]}</p>
          </div>
        </div>
      </section>

      <section className="gym-section gym-container">
        <div className="gym-section-heading">
          <span className="gym-index">04 /</span>
          <h2>{t.accessTitle}</h2>
        </div>
        <p className="gym-body">{t.accessBody}</p>
        <div className="gym-access-grid">
          {t.access.map((item, index) => (
            <article key={item}>
              <AccessIcon kind={index} />
              <h3>{item}</h3>
            </article>
          ))}
        </div>
        <div className="gym-install-note">
          <h3>{t.unknown}</h3>
          <p>{t.technician}</p>
        </div>
      </section>

      <section className="gym-section gym-container gym-split gym-package">
        <figure className="gym-package-visual">
          {GYMS_PACKAGE_IMAGE ? (
            <Image
              src={GYMS_PACKAGE_IMAGE}
              alt={t.packageTitle}
              width={800}
              height={1000}
              sizes="(max-width: 700px) 90vw, 500px"
            />
          ) : (
            <>
              <div className="gym-sheet">
                <span className="gym-sheet-brand">FITLINER</span>
                <p>{t.diagram}</p>
                <svg
                  viewBox="0 0 260 85"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <rect x="12" y="22" width="60" height="40" rx="4" />
                  <path d="M72 42h40V15h65v27h25M112 42v29h65V42" />
                  <rect x="202" y="22" width="44" height="40" rx="4" />
                </svg>
                <div className="gym-module" aria-hidden="true">
                  <span>FITLINER</span>
                  <i />
                  <div>••••••</div>
                </div>
                <div className="gym-sheet-lines" aria-hidden="true" />
              </div>
              <figcaption>{t.packagePreview}</figcaption>
            </>
          )}
        </figure>
        <div>
          <p className="gym-eyebrow">05 / FITLINER STARTER KIT</p>
          <h2>{t.packageTitle}</h2>
          <p className="gym-body">{t.packageBody}</p>
          <ul className="gym-package-items">
            {t.packageItems.map((item, index) => (
              <li key={item}>
                <span>0{index + 1}</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="gym-body">{t.packageNote}</p>
        </div>
      </section>

      <section className="gym-section gym-container gym-benefits">
        <p className="gym-index">06 /</p>
        <h2>{t.benefitsTitle}</h2>
        <ul>
          {t.benefits.map((benefit, index) => (
            <li key={benefit}>
              <span>0{index + 1}</span>
              {benefit}
              <span aria-hidden="true">↗</span>
            </li>
          ))}
        </ul>
        <blockquote>{t.quote}</blockquote>
      </section>

      <section className="gym-member">
        <div className="gym-container gym-split">
          <div>
            <p className="gym-eyebrow">07 / FITLINER APP</p>
            <h2>{t.memberTitle}</h2>
            <p className="gym-body">{t.memberBody}</p>
            <ul className="gym-check-list">
              {t.memberFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="gym-phone">
            <Image
              src="/app_screen.png"
              alt={t.screenAlt}
              width={1125}
              height={2436}
              sizes="(max-width: 768px) 260px, 300px"
            />
          </div>
        </div>
      </section>

      <section className="gym-section gym-container">
        <div className="gym-section-heading">
          <span className="gym-index">08 /</span>
          <h2>{t.howTitle}</h2>
        </div>
        <ol className="gym-onboarding">
          {t.steps.map((step, index) => (
            <li key={step}>
              <span>0{index + 1}</span>
              <h3>{step}</h3>
            </li>
          ))}
        </ol>
      </section>

      <section id="offer" className="gym-section gym-container">
        <div className="gym-offer">
          <div>
            <p className="gym-eyebrow">09 / FITLINER STARTER KIT</p>
            <h2>{t.offerTitle}</h2>
            <p className="gym-body">{t.offerBody}</p>
            <ul className="gym-check-list">
              {t.packageItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="gym-offer-price">
            <p className="gym-price">
              15 <span>€</span>
            </p>
            <p>{t.priceLabel}</p>
            <GymLink
              href={GYMS_CHECKOUT_URL}
              order
              location="offer-checkout"
              className="gym-button"
            >
              {t.cta}
              <span aria-hidden="true">↗</span>
            </GymLink>
            <p className="gym-small">{t.offerReassurance}</p>
            <p className="gym-price-note">{t.priceNote}</p>
          </div>
        </div>
      </section>

      <section className="gym-section gym-container gym-founder">
        <span className="gym-index">10 /</span>
        <div>
          <h2>{t.founderTitle}</h2>
          <p className="gym-body">{t.founderBody}</p>
          <a href="#film" className="gym-text-link">
            {t.watch} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className="gym-section gym-container">
        <div className="gym-section-heading">
          <span className="gym-index">11 /</span>
          <h2>{t.faqTitle}</h2>
        </div>
        <GymFaq items={t.faq} />
      </section>
      <section className="gym-container gym-qualification-wrap">
        <GymQualification locale={locale} copy={t} />
      </section>
      <section className="gym-section gym-container gym-close">
        <p className="gym-eyebrow">FITLINER</p>
        <h2>{t.closeTitle}</h2>
        <p className="gym-body">{t.closeBody}</p>
        {order('final')}
        <GymLink
          href={callHref}
          location="final-call"
          event="gyms_call_cta_click"
          className="gym-call"
        >
          {t.call} ↗
        </GymLink>
      </section>
      <footer className="gym-container gym-footer">
        <Link className="gym-wordmark" href={`/${locale}`}>
          FITLINER
        </Link>
        <div>
          <Link href={`/${locale}`}>{t.back}</Link>
          <Link href={`/${locale}/privacy`}>{t.privacy}</Link>
          <Link href={`/${locale}/terms`}>{t.terms}</Link>
        </div>
        <GymTracking key={locale} copy={t} locale={locale} />
      </footer>
    </main>
  );
}
