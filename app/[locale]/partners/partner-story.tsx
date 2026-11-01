import Image from "next/image";
import Link from "next/link";

export function PartnerIntro({ sk, locale }: { sk: boolean; locale: string }) {
  const benefits = sk
    ? [
        [
          "01",
          "Vstup cez telefón",
          "Člen otvorí dvere cez aplikáciu. Majiteľ má kontrolu nad prístupom do fitka.",
        ],
        [
          "02",
          "Členstvá a platby",
          "Digitálne členstvá a online platby spájajú nákup s prístupom do fitness centra.",
        ],
        [
          "03",
          "Každodenný kontakt",
          "Tréningy, komunikácia a prehľad aktivity dávajú členom dôvod vracať sa do aplikácie.",
        ],
      ]
    : [
        [
          "01",
          "Phone-based access",
          "Members open the door through the app. Owners stay in control of gym access.",
        ],
        [
          "02",
          "Memberships & payments",
          "Digital memberships and online payments connect purchases with gym access.",
        ],
        [
          "03",
          "An everyday connection",
          "Training, communication and activity insights give members reasons to return to the app.",
        ],
      ];
  return (
    <>
      <header className="partner-hero partner-container">
        <div className="partner-hero-copy">
          <p className="partner-kicker">FITLINER / COUNTRY PARTNER PROGRAM</p>
          <h1>
            {sk ? "Vybudujte sieť Fitliner" : "Build the Fitliner network"}
            <em>{sk ? "vo svojej krajine." : "in your country."}</em>
          </h1>
          <p className="partner-lead">
            {sk
              ? "Pomôžte fitness centrám zjednodušiť vstupy, členstvá a platby. My rozvíjame produkt. Vy otvárate dvere na svojom trhu."
              : "Help gyms simplify access, memberships and payments. We develop the product. You open doors in your market."}
          </p>
          <div className="partner-actions">
            <a className="partner-cta" href="#apply">
              {sk ? "Mám záujem o partnerstvo" : "Explore the partnership"}{" "}
              <span aria-hidden="true">↗</span>
            </a>
            <a className="partner-text-link" href="#product">
              {sk ? "Čo budem ponúkať fitkám?" : "What will I offer gyms?"}{" "}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="partner-hero-footnote">
            {sk
              ? "Pre podnikateľov a obchodníkov, ktorí poznajú lokálny fitness trh."
              : "For entrepreneurs and sales professionals who know their local fitness market."}
          </p>
        </div>
        <div className="partner-hero-art">
          <Image
            src="/images/audiences/gym.webp"
            alt={
              sk
                ? "Ilustračná fotografia prostredia fitness centra"
                : "Illustrative gym setting"
            }
            width={960}
            height={640}
            priority
            sizes="(max-width: 800px) 100vw, 46vw"
          />
          <div className="partner-art-label">
            <span className="partner-dot" aria-hidden="true" />{" "}
            {sk
              ? "LOKÁLNY TRH. SPOLOČNÝ PRODUKT."
              : "LOCAL MARKET. SHARED PRODUCT."}
          </div>
          <div className="partner-share-card">
            <span>{sk ? "Váš dohodnutý podiel" : "Your agreed share"}</span>
            <strong>
              50<span>%</span>
            </strong>
            <p>
              {sk
                ? "z čistého rozdeliteľného príjmu"
                : "of net distributable revenue"}
            </p>
            <small>
              {sk
                ? "Po odpočítaní nákladov, podľa zmluvy."
                : "After costs, subject to agreement."}
            </small>
          </div>
          <small className="partner-photo-caption">
            {sk ? "Ilustračná fotografia" : "Illustrative photograph"}
          </small>
        </div>
      </header>
      <div className="partner-container partner-value-strip" data-reveal>
        {(sk
          ? [
              "Produkt a technológia od Fitliner",
              "Lokálny predaj vo vašich rukách",
              "Potenciál opakovaných príjmov",
            ]
          : [
              "Product & technology by Fitliner",
              "Local sales led by you",
              "Potential recurring revenue",
            ]
        ).map((t) => (
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
            alt={
              sk
                ? "Ukážka aplikácie Fitliner: otvorenie vstupu do fitness centra"
                : "Fitliner app preview: opening a gym entrance"
            }
            width={600}
            height={900}
            sizes="(max-width: 800px) 85vw, 380px"
          />
          <span className="partner-screen-caption">
            {sk
              ? "Ukážka rozhrania aplikácie"
              : "Application interface preview"}
          </span>
        </div>
        <div>
          <p className="partner-kicker">
            {sk
              ? "PRODUKT, KTORÝ BUDETE PREDÁVAŤ"
              : "THE PRODUCT YOU WILL SELL"}
          </p>
          <h2>
            {sk
              ? "Jedna aplikácia. Každodenná hodnota pre fitko."
              : "One app. Everyday value for a gym."}
          </h2>
          <p className="partner-muted">
            {sk
              ? "Obchodný rozhovor začína konkrétnym problémom majiteľa: ako spravovať vstupy, členstvá a kontakt s členmi jednoduchšie."
              : "A sales conversation starts with a real owner’s problem: making access, memberships and member communication easier to manage."}
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
          <Link className="partner-text-link" href={`/${locale}/gyms`}>
            {sk
              ? "Pozrieť ponuku pre fitness centrá"
              : "Explore the offer for gyms"}{" "}
            ↗
          </Link>
        </div>
      </section>
      <section className="partner-collaboration">
        <div className="partner-container partner-section" data-reveal>
          <p className="partner-kicker">
            {sk ? "JASNÉ ROZDELENIE ÚLOH" : "A CLEAR DIVISION OF ROLES"}
          </p>
          <h2>
            {sk
              ? "Vy poznáte trh. My tvoríme technológiu."
              : "You know the market. We build the technology."}
          </h2>
          <div className="partner-role-grid">
            <article>
              <span className="partner-role-tag">FITLINER</span>
              <h3>
                {sk
                  ? "Produkt, na ktorom môžete stavať."
                  : "A product to build on."}
              </h3>
              <ul>
                {(sk
                  ? [
                      "Vývoj aplikácie a platformy",
                      "Aktualizácie a rozvoj funkcií",
                      "Centrálna platobná infraštruktúra",
                    ]
                  : [
                      "App and platform development",
                      "Updates and product improvements",
                      "Central payment infrastructure",
                    ]
                ).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
            <article>
              <span className="partner-role-tag">
                {sk ? "VY / NÁRODNÝ PARTNER" : "YOU / COUNTRY PARTNER"}
              </span>
              <h3>
                {sk
                  ? "Vzťahy, ktoré prinesú rast."
                  : "Relationships that create growth."}
              </h3>
              <ul>
                {(sk
                  ? [
                      "Vyhľadávanie a oslovovanie fitness centier",
                      "Lokálny marketing a obchodné rokovania",
                      "Získavanie a aktivácia platiacich fitiek",
                    ]
                  : [
                      "Finding and approaching gyms",
                      "Local marketing and sales conversations",
                      "Acquiring and activating paying gyms",
                    ]
                ).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          </div>
          <p className="partner-small">
            {sk
              ? "Konkrétny rozsah zaškolenia, obchodných materiálov, inštalácie a lokálnej podpory dohodneme pred podpisom zmluvy."
              : "The scope of training, sales materials, installation and local support will be agreed before signing."}
          </p>
        </div>
      </section>
    </>
  );
}

export function PartnerQuestions({ sk }: { sk: boolean }) {
  const steps = sk
    ? [
        [
          "Zoznámime sa",
          "Posúdime váš trh, skúsenosti a možnosti spolupráce. Podmienky si dohodneme v zmluve.",
        ],
        [
          "Overíme spoluprácu",
          "Počas 90 dní bez exkluzivity je cieľom 10 aktivovaných platiacich fitness centier.",
        ],
        [
          "Rozšírime partnerstvo",
          "Po overení výsledkov môžete získať exkluzivitu na 12 mesiacov. Obnovenie závisí od cieľov krajiny.",
        ],
      ]
    : [
        [
          "Get to know each other",
          "We assess your market, experience and fit. The agreement defines the terms.",
        ],
        [
          "Prove the partnership",
          "During 90 days without exclusivity, the goal is 10 activated, paying gyms.",
        ],
        [
          "Grow the partnership",
          "Verified results can qualify you for 12 months of exclusivity. Renewal depends on country targets.",
        ],
      ];
  const faq = sk
    ? [
        [
          "Pre koho je partnerstvo vhodné?",
          "Pre podnikateľov a obchodníkov, ktorí poznajú fitness segment, dokážu oslovovať majiteľov fitiek a chcú systematicky rozvíjať svoj trh. Existujúce kontakty môžu pomôcť; skúsenosti a plán posudzujeme individuálne.",
        ],
        [
          "Z čoho sa počíta môj podiel?",
          "Z dohodnutého čistého rozdeliteľného príjmu, nie automaticky z celej tržby. Pri jednorazovej cene 297 € sa najprv odpočítajú príslušné priame náklady. Pri 2 % platformovom poplatku je rozdelenie 1 % + 1 % orientačný model, ktorý závisí od nákladov a zmluvy.",
        ],
        [
          "Je potrebná vstupná investícia?",
          "Konkrétne finančné podmienky, náklady na lokálny predaj a prípadnú inštaláciu je potrebné dohodnúť individuálne. Stránka nesľubuje partnerstvo bez nákladov; kalkulačka nezahŕňa všetky vaše prevádzkové náklady ani dane.",
        ],
        [
          "Kedy získam exkluzivitu?",
          "Úvodných 90 dní je bez exkluzivity. Po získaní 10 aktivovaných platiacich fitiek a overení podmienok môžete získať exkluzivitu na 12 mesiacov. Nie je automatická ani doživotná.",
        ],
        [
          "Sú ročné ciele už záväzné?",
          "Zobrazené neschválené ciele sú návrhy. Finálny cieľ, podmienky obnovy a definíciu aktivovaného fitka stanoví zmluva pre danú krajinu.",
        ],
        [
          "Čo sa stane po odoslaní prihlášky?",
          "Posúdime uvedené skúsenosti a vybranú krajinu a ozveme sa s ďalším postupom. Samotná prihláška nezakladá zmluvu, nárok na exkluzivitu ani povinnosť začať spoluprácu.",
        ],
      ]
    : [
        [
          "Who is this partnership for?",
          "Entrepreneurs and sales professionals who know the fitness sector, can approach gym owners and want to develop their market systematically. Existing relationships can help; experience and plans are assessed individually.",
        ],
        [
          "How is my share calculated?",
          "From agreed net distributable revenue, not automatically from total sales. Applicable direct costs are deducted from the €297 one-off price before splitting. A 1% + 1% split of the 2% platform fee is illustrative and depends on costs and the agreement.",
        ],
        [
          "Is an upfront investment required?",
          "Financial terms, local sales costs and any installation costs need to be agreed individually. This page does not promise a cost-free partnership; the calculator excludes some operating costs and taxes.",
        ],
        [
          "When can I receive exclusivity?",
          "The first 90 days are non-exclusive. After acquiring 10 activated paying gyms and meeting the agreed criteria, you may qualify for 12 months of exclusivity. It is neither automatic nor lifelong.",
        ],
        [
          "Are annual targets already binding?",
          "Targets shown as unapproved are proposals. The final target, renewal terms and definition of an activated gym are set in the agreement for each country.",
        ],
        [
          "What happens after I apply?",
          "We review your experience and selected country and contact you about next steps. Applying does not create a contract, grant exclusivity or commit you to starting the partnership.",
        ],
      ];
  return (
    <>
      <section className="partner-container partner-section" data-reveal>
        <p className="partner-kicker">
          {sk
            ? "OD PRVÉHO ROZHOVORU K PARTNERSTVU"
            : "FROM FIRST CONVERSATION TO PARTNERSHIP"}
        </p>
        <h2>
          {sk
            ? "Najprv výsledky. Potom exkluzivita."
            : "Results first. Exclusivity next."}
        </h2>
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
        data-reveal
      >
        <div>
          <p className="partner-kicker">
            {sk ? "PREDTÝM, NEŽ SA ROZHODNETE" : "BEFORE YOU DECIDE"}
          </p>
          <h2>
            {sk
              ? "Dobré partnerstvo začína jasnými odpoveďami."
              : "Good partnerships start with clear answers."}
          </h2>
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
