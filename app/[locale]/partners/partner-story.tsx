import { getPartnerFaq } from "@/lib/partners/faq";
import type { PartnerCopy } from "@/lib/partners/copy";
import type { PartnerLocale } from "@/lib/partners/locales";
import Image from "next/image";
import Link from "next/link";

export function PartnerIntro({
  locale,
  copy,
}: {
  locale: PartnerLocale;
  copy: PartnerCopy;
}) {
  const t = (key: keyof PartnerCopy) => copy[key];
  const benefits = [
    [
      "01",
      t("Phone-based access"),
      t(
        "Members open the door through the app. Owners stay in control of gym access.",
      ),
    ],
    [
      "02",
      t("Memberships & payments"),
      t(
        "Digital memberships and online payments connect purchases with gym access.",
      ),
    ],
    [
      "03",
      t("An everyday connection"),
      t(
        "Training, communication and activity insights give members reasons to return to the app.",
      ),
    ],
  ];
  return (
    <>
      <header className="partner-hero partner-container">
        <div className="partner-hero-copy">
          <p className="partner-kicker">
            FITLINER / {t("COUNTRY PARTNER PROGRAM")}
          </p>
          <h1>
            {t("Build the Fitliner network")}
            <em>{t("in your country.")}</em>
          </h1>
          <p className="partner-lead">
            {t(
              "Help gyms simplify access, memberships and payments. We develop the product. You open doors in your market.",
            )}
          </p>
          <div className="partner-actions">
            <a className="partner-cta" href="#apply">
              {t("Explore the partnership")} <span aria-hidden="true">↗</span>
            </a>
            <a className="partner-text-link" href="#product">
              {t("What will I offer gyms?")} <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="partner-hero-footnote">
            {t(
              "For entrepreneurs and sales professionals who know their local fitness market.",
            )}
          </p>
        </div>
        <div className="partner-hero-art">
          <Image
            src="/images/audiences/gym.webp"
            alt={t("Illustrative gym setting")}
            width={960}
            height={640}
            priority
            sizes="(max-width: 800px) 100vw, 46vw"
          />
          <div className="partner-art-label">
            <span className="partner-dot" aria-hidden="true" />{" "}
            {t("LOCAL MARKET. SHARED PRODUCT.")}
          </div>
          <div className="partner-share-card">
            <span>{t("Your agreed share")}</span>
            <strong>
              50<span>%</span>
            </strong>
            <p>{t("of net distributable revenue")}</p>
            <small>{t("After costs, subject to agreement.")}</small>
          </div>
          <small className="partner-photo-caption">
            {t("Illustrative photograph")}
          </small>
        </div>
      </header>
      <div className="partner-container partner-value-strip" data-reveal>
        {[
          t("Product & technology by Fitliner"),
          t("Local sales led by you"),
          t("Potential recurring revenue"),
        ].map((t) => (
          <span key={t}>
            <span aria-hidden="true">↗</span>
            {t}
          </span>
        ))}
      </div>
      <section
        className="partner-container partner-section partner-product"
        id="product"
        data-reveal
      >
        <div className="partner-product-visual">
          <Image
            src="/gym.png"
            alt={t("Fitliner app preview: opening a gym entrance")}
            width={600}
            height={900}
            sizes="(max-width: 800px) 85vw, 380px"
          />
          <span className="partner-screen-caption">
            {t("Application interface preview")}
          </span>
        </div>
        <div>
          <p className="partner-kicker">{t("THE PRODUCT YOU WILL SELL")}</p>
          <h2>{t("One app. Everyday value for a gym.")}</h2>
          <p className="partner-muted">
            {t(
              "A sales conversation starts with a real owner’s problem: making access, memberships and member communication easier to manage.",
            )}
          </p>
          <div className="partner-benefits">
            {benefits.map(([n, title, body]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            className="partner-text-link"
            href={`/${locale === "hu" ? "en" : locale}/gyms`}
          >
            {t("Explore the offer for gyms")}{" "}
            {locale === "hu" && <> ({t("In English")})</>} ↗
          </Link>
        </div>
      </section>
      <section className="partner-collaboration">
        <div className="partner-container partner-section" data-reveal>
          <p className="partner-kicker">{t("A CLEAR DIVISION OF ROLES")}</p>
          <h2>{t("You know the market. We build the technology.")}</h2>
          <div className="partner-role-grid">
            <article>
              <span className="partner-role-tag">FITLINER</span>
              <h3>{t("A product to build on.")}</h3>
              <ul>
                {[
                  t("App and platform development"),
                  t("Updates and product improvements"),
                  t("Central payment infrastructure"),
                ].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
            <article>
              <span className="partner-role-tag">
                {t("YOU / COUNTRY PARTNER")}
              </span>
              <h3>{t("Relationships that create growth.")}</h3>
              <ul>
                {[
                  t("Finding and approaching gyms"),
                  t("Local marketing and sales conversations"),
                  t("Acquiring and activating paying gyms"),
                ].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          </div>
          <p className="partner-small">
            {t(
              "The scope of training, sales materials, installation and local support will be agreed before signing.",
            )}
          </p>
        </div>
      </section>
    </>
  );
}

export function PartnerQuestions({ copy }: { copy: PartnerCopy }) {
  const t = (key: keyof PartnerCopy) => copy[key];
  const steps = [
    [
      t("Get to know each other"),
      t(
        "We assess your market, experience and fit. The agreement defines the terms.",
      ),
    ],
    [
      t("Prove the partnership"),
      t(
        "During 90 days without exclusivity, the goal is 10 activated, paying gyms.",
      ),
    ],
    [
      t("Grow the partnership"),
      t(
        "Verified results can qualify you for 12 months of exclusivity. Renewal depends on country targets.",
      ),
    ],
  ];
  const faq = getPartnerFaq(copy);
  return (
    <>
      <section className="partner-container partner-section" data-reveal>
        <p className="partner-kicker">
          {t("FROM FIRST CONVERSATION TO PARTNERSHIP")}
        </p>
        <h2>{t("Results first. Exclusivity next.")}</h2>
        <div className="partner-steps">
          {steps.map(([title, body], i) => (
            <article key={title}>
              <small>0{i + 1}</small>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="partner-container partner-section partner-faq"
        id="faq"
        data-reveal
      >
        <div>
          <p className="partner-kicker">{t("BEFORE YOU DECIDE")}</p>
          <h2>{t("Good partnerships start with clear answers.")}</h2>
        </div>
        <div>
          {faq.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
