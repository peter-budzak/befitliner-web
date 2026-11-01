"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Answers,
  Step,
  steps,
  questions,
  packages,
  euro,
  recommendation,
  trainingBenefit,
  offerStorageKey,
  offerSeconds,
  programPrice,
} from "./model";
import s from "./member-funnel.module.css";
import { ValueDemo, CheckoutValue, EverydayImage } from "./value-demo";

import { CoachDemo, HealthDemo, PriceComparison } from "./insight-demos";
import { FunnelAnalytics } from "./telemetry";

export default function MemberFunnel() {
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState("");
  const [member, setMember] = useState(false);
  const [plan, setPlan] = useState("month");
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(600);
  useEffect(() => {
    if (deadline === null) return;
    const tick = () => setRemaining(offerSeconds(deadline, Date.now()));
    const timer = setInterval(tick, 250);
    const sync = (event: StorageEvent) => {
      if (event.key === offerStorageKey && event.newValue) {
        const other = Number(event.newValue);
        if (Number.isFinite(other) && other > 0)
          setDeadline(Math.min(deadline, other));
      }
    };
    window.addEventListener("storage", sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", sync);
    };
  }, [deadline]);
  const heading = useRef<HTMLHeadingElement>(null);
  const index = steps.indexOf(step);
  const q = questions.find((q) => q.id === step);
  const rec = recommendation(answers);
  const benefit = trainingBenefit(answers);
  const progressSteps = steps.length - 2;
  const selected = packages.find((p) => p.id === plan)!;
  const total = programPrice(selected, remaining);
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);
  function go(next: Step) {
    if (next === "offer" && deadline === null) {
      let end = Date.now() + 600000;
      try {
        const saved = Number(localStorage.getItem(offerStorageKey));
        if (Number.isFinite(saved) && saved > 0) end = saved;
        else localStorage.setItem(offerStorageKey, String(end));
      } catch {
        /* The offer remains valid for this page session. */
      }
      setDeadline(end);
      setRemaining(offerSeconds(end, Date.now()));
    }
    setStep(next);
  }
  function next() {
    go(steps[index + 1]);
  }
  function restart() {
    setAnswers({});
    setEmail("");
    setMember(false);
    setPlan("month");
    go("intro");
  }
  const answerLabel = (id: string) =>
    questions
      .find((q) => q.id === id)
      ?.options.find((o) => o.value === answers[id])?.title;
  const title = (text: string) => (
    <h1 ref={heading} tabIndex={-1}>
      {text}
    </h1>
  );
  const button = (text: string, action = next, disabled = false) => (
    <button
      data-track="next"
      className={s.primary}
      onClick={action}
      disabled={disabled}
    >
      {text}
      <span aria-hidden="true">↗</span>
    </button>
  );
  const week = (
    <div className={s.week}>
      {["Po", "Ut", "St", "Št", "Pi", "So", "Ne"].map((d, i) => (
        <div key={d} className={rec.week.includes(i) ? s.activeDay : ""}>
          <small>{d}</small>
          <span>{rec.week.includes(i) ? "↗" : "·"}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className={s.shell} id="member-funnel">
      <FunnelAnalytics
        step={step}
        member={member}
        offerPhase={
          deadline === null ? "none" : remaining > 0 ? "active" : "expired"
        }
      />
      <header className={s.header}>
        <Link data-track="home" href="/sk" className={s.logo}>
          FITLINER<sup>™</sup>
        </Link>
        <span className={s.testBadge}>
          <i /> Interaktívna ukážka · bez platby
        </span>
      </header>
      {step !== "intro" && (
        <div className={s.progressWrap}>
          <div className={s.progress}>
            <span
              style={{
                width: `${Math.min((index / progressSteps) * 100, 100)}%`,
              }}
            />
          </div>
          <div className={s.progressMeta}>
            <button
              data-track="back"
              onClick={() => go(steps[Math.max(0, index - 1)])}
              disabled={step === "done"}
            >
              ← Späť
            </button>
            <span>
              {q?.section ??
                (index < steps.indexOf("email")
                  ? "Tvoja cesta"
                  : index < steps.indexOf("offer")
                    ? "Tvoj profil"
                    : "Tvoj program")}{" "}
              <b>
                {Math.min(index, progressSteps)} / {progressSteps}
              </b>
            </span>
          </div>
        </div>
      )}
      <main className={step === "intro" ? s.hero : s.main} key={step}>
        {step === "intro" && (
          <>
            <div className={s.heroCopy}>
              <div className={s.eyebrow}>TVOJA FORMA. TVOJ RYTMUS.</div>
              {title("Začni pri sebe.\nZvyšok poskladáme spolu.")}
              <p className={s.lead}>
                Tréning, strava a tvoj progres na jednom mieste. Objav, ako môže
                Fitliner zapadnúť do tvojho života.
              </p>
              {button("Nájsť svoju cestu")}
              <div className={s.heroFacts}>
                <span>◷ Približne 3 minúty · pre dospelých 18+</span>
                <span>✓ Podľa tvojich odpovedí</span>
              </div>
              <div className={s.memberNote}>
                Cvičíš v partnerskom fitku?
                <br />
                <strong>S aktívnym členstvom máš celú appku zdarma.</strong>
              </div>
            </div>
            <div className={s.heroVisual}>
              <Image
                src="/images/member-funnel/hero.jpg"
                alt="Dvojica pri tréningu v modernom fitnesscentre"
                fill
                priority
                sizes="(max-width: 760px) 100vw, 50vw"
              />
              <div className={s.imageTag}>
                MALÉ KROKY. TVOJ VLASTNÝ PROGRES.
              </div>
              <div className={s.floatingCard}>
                <span className={s.purpleIcon}>↗</span>
                <div>
                  <small>VŠETKO SPOLU</small>
                  <strong>Jasný plán na ďalší tréning</strong>
                  <p>Trénuj. Zapisuj. Sleduj svoj posun.</p>
                </div>
              </div>
            </div>
          </>
        )}
        {q && (
          <>
            <div className={s.eyebrow}>{q.section}</div>
            {title(q.title)}
            <p className={s.lead}>{q.note}</p>
            <div className={s.options} role="group" aria-label={q.title}>
              {q.options.map((o, optionIndex) => (
                <button
                  type="button"
                  className={`${s.option} ${answers[q.id] === o.value ? s.selected : ""}`}
                  key={o.value}
                  data-track={`answer_${optionIndex + 1}`}
                  onClick={() => {
                    setAnswers({ ...answers, [q.id]: o.value });
                    next();
                  }}
                >
                  <span className={s.optionIcon}>{o.icon}</span>
                  <span>
                    <strong>{o.title}</strong>
                    <small>{o.detail}</small>
                  </span>
                  <span className={s.radio}>
                    {answers[q.id] === o.value ? "✓" : "↗"}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === "coach-proof" && (
          <>
            <div className={s.eyebrow}>POMOC, KTORÁ MÁ TVOJE SÚVISLOSTI</div>
            {title("Tvoj AI tréner nezačína pri prázdnom chate.")}
            <p className={s.lead}>
              Profil, tréning a strava v jednej aplikácii. Pozri sa, čo ti to
              ušetrí v bežnom dni.
            </p>
            <CoachDemo answers={answers} />
            {button("Chcem takúto pomoc poruke")}
          </>
        )}
        {step === "training-proof" && (
          <>
            <div className={s.eyebrow}>PODĽA TOHO, ČO TI STOJÍ V CESTE</div>
            {title(benefit.title)}
            <p className={s.lead}>{benefit.description}</p>
            <ValueDemo kind="training" answers={answers} />
            {button("Chcem mať tréning takto poruke")}
          </>
        )}
        {step === "habits-proof" && (
          <>
            <div className={s.eyebrow}>VIAC NEŽ POCIT NA KONCI TÝŽDŇA</div>
            {title("Tvoj vývoj má svoje miesto.")}
            <p className={s.lead}>
              Tréningy aj zdravotné výsledky si vieš pozrieť v čase. Namiesto
              hľadania papierov nájdeš staršie merania vo svojom účte.
            </p>
            <HealthDemo />
            <details className={s.preferences}>
              <summary data-track="training_details">
                Ako uvidím vývoj tréningu?
              </summary>
              <ValueDemo kind="progress" answers={answers} />
            </details>
            {button("Chcem vidieť svoj vlastný progres")}
          </>
        )}
        {step === "email" && (
          <>
            <div className={s.eyebrow}>VÝHODA TVOJHO ČLENSTVA</div>
            {title("Možno už máš Fitliner zdarma.")}
            <p className={s.lead}>
              Použi e-mail, ktorý máš zaregistrovaný vo svojom fitku. Aktívne
              členstvo v partnerskom fitku ti sprístupní celú aplikáciu.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              <label htmlFor="email" className={s.label}>
                Tvoj e-mail
              </label>
              <input
                data-track="email_field"
                id="email"
                className={s.input}
                type="email"
                autoComplete="email"
                placeholder="meno@email.sk"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button data-track="email_submit" className={s.primary}>
                Pokračovať k overeniu <span>↗</span>
              </button>
            </form>
            <p className={s.caption}>
              V tejto ukážke e-mail nikam neposielame ani neoverujeme. Zostáva
              iba v pamäti tejto stránky.
            </p>
          </>
        )}
        {step === "verification" && (
          <>
            <div className={s.eyebrow}>TEST OBOCH MOŽNOSTÍ</div>
            {title("Vyskúšaj svoju vetvu.")}
            <p className={s.lead}>
              V ostrej verzii tu overíme vlastníctvo e-mailu a aktívne členstvo.
              Teraz si môžeš oba výsledky nasimulovať.
            </p>
            <div className={s.options}>
              <button
                className={s.option}
                data-track="member_yes"
                onClick={() => {
                  setMember(true);
                  go("result");
                }}
              >
                <span className={s.optionIcon}>✓</span>
                <span>
                  <strong>Mám aktívne členstvo</strong>
                  <small>Celá aplikácia je v cene členstva</small>
                </span>
                <span>↗</span>
              </button>
              <button
                className={s.option}
                data-track="member_no"
                onClick={() => {
                  setMember(false);
                  go("result");
                }}
              >
                <span className={s.optionIcon}>↗</span>
                <span>
                  <strong>Nemám partnerské členstvo</strong>
                  <small>Chcem si pozrieť platené programy</small>
                </span>
                <span>↗</span>
              </button>
            </div>
            <p className={s.caption}>
              Simulácia pre {email}. Žiadne oprávnenia účtu sa nemenia.
            </p>
          </>
        )}
        {step === "result" && (
          <>
            <div className={s.eyebrow}>TVOJ OSOBNÝ SÚHRN</div>
            {title("Tvoja cesta má jasný smer.")}
            <p className={s.lead}>
              Toto je východisko podľa tvojich odpovedí. Konkrétny tréning si
              následne pripravíš v aplikácii.
            </p>
            <div className={s.productCard}>
              <div className={s.cardTop}>
                <span>{rec.style}</span>
                <span className={s.pill}>{rec.location}</span>
              </div>
              <h2>{rec.goal}</h2>
              <div className={s.stats}>
                <div>
                  <strong>{rec.days}×</strong>
                  <small>týždenne</small>
                </div>
                <div>
                  <strong>{rec.minutes}</strong>
                  <small>minút na tréning</small>
                </div>
                <div>
                  <strong>Ty</strong>
                  <small>určuješ tempo</small>
                </div>
              </div>
              {week}
              <p className={s.caption}>
                Navrhnutý rytmus týždňa, ktorý si môžeš upraviť.
              </p>
              <details className={s.preferences}>
                <summary data-track="preferences">Tvoje preferencie</summary>
                {[
                  ["experience", "Skúsenosť"],
                  ["equipment", "Vybavenie"],
                  ["obstacle", "Čo chceš zjednodušiť"],
                  ["food", "Strava"],
                ].map(([id, label]) => (
                  <div key={id}>
                    <small>{label}</small>
                    <span>{answerLabel(id)}</span>
                  </div>
                ))}
              </details>
            </div>
            {member ? (
              <div className={s.successBox}>
                <strong>✓ Celá aplikácia v cene členstva</strong>
                <p>
                  Pri aktívnom členstve v partnerskom fitku nepotrebuješ ďalšie
                  predplatné. Toto je simulovaný výsledok.
                </p>
              </div>
            ) : (
              <p className={s.caption}>
                Bez partnerského členstva zostane dostupná obmedzená bezplatná
                verzia. Presný rozsah pripravujeme.
              </p>
            )}
            {button(
              member ? "Dokončiť ukážku zdarma" : "Pozrieť môj program",
              () => go(member ? "done" : "offer"),
            )}
          </>
        )}
        {step === "offer" && (
          <>
            <div className={s.eyebrow}>DAJ SVOJMU CIEĽU PRIESTOR</div>
            {title("Vyber si svoj štart.")}
            <p className={s.lead}>
              Tréningový plán, záznamy a prehľad v jednej aplikácii. Tvoj
              rytmus: {rec.days}× týždenne po {rec.minutes} minút.
            </p>
            <PriceComparison />
            <div className={s.urgency}>
              <div>
                <strong>
                  {remaining > 0
                    ? "Tvoja 10-minútová uvítacia ponuka"
                    : "Uvítacia ponuka skončila"}
                </strong>
                <small>
                  {remaining > 0
                    ? "Po vypršaní sa ceny automaticky zvýšia aj v súhrne."
                    : "Teraz sa zobrazujú ceny po skončení ponuky."}
                </small>
              </div>
              <b aria-label="Zostávajúci čas ponuky">
                {String(Math.floor(remaining / 60)).padStart(2, "0")}:
                {String(remaining % 60).padStart(2, "0")}
              </b>
            </div>
            <div
              className={s.plans}
              role="radiogroup"
              aria-label="Dĺžka programu"
            >
              {packages.map((p) => (
                <button
                  key={p.id}
                  data-track={`plan_${p.id}`}
                  role="radio"
                  aria-checked={plan === p.id}
                  className={`${s.plan} ${plan === p.id ? s.selected : ""}`}
                  onKeyDown={(e) => {
                    const delta =
                      e.key === "ArrowRight" || e.key === "ArrowDown"
                        ? 1
                        : e.key === "ArrowLeft" || e.key === "ArrowUp"
                          ? -1
                          : 0;
                    if (delta) {
                      e.preventDefault();
                      const i = packages.findIndex((item) => item.id === p.id);
                      const target =
                        (i + delta + packages.length) % packages.length;
                      (
                        e.currentTarget.parentElement?.children[
                          target
                        ] as HTMLButtonElement
                      )?.click();
                      (
                        e.currentTarget.parentElement?.children[
                          target
                        ] as HTMLButtonElement
                      )?.focus();
                    }
                  }}
                  onClick={() => setPlan(p.id)}
                >
                  <small>{p.tag}</small>
                  <div>
                    <strong>{p.name}</strong>
                    <span className={s.radio}>{plan === p.id ? "✓" : ""}</span>
                  </div>
                  <div>
                    <span className={s.price}>
                      {euro(programPrice(p, remaining))}
                    </span>
                  </div>
                  <p>
                    za {p.duration} · konečná testovacia cena
                    {remaining > 0 && (
                      <>
                        <br />
                        Po skončení ponuky {euro(p.regular)}
                      </>
                    )}
                  </p>
                </button>
              ))}
            </div>
            <div className={s.inclusions}>
              <span>✓ Tréning a záznamy</span>
              <span>✓ Strava a zdravotná história</span>
              <span>✓ Pomoc AI</span>
            </div>
            {button("Pokračovať k súhrnu")}
            <p className={s.caption}>
              Testovacia ponuka vrátane prípadných daní. Všetky tri programy
              ukazujú rovnaký rozsah funkcií a líšia sa dĺžkou. Dnes sa nič
              neúčtuje. Podmienky reálneho predplatného a obnovenia stanovíme
              pred spustením platieb.
            </p>
          </>
        )}
        {step === "checkout" && (
          <>
            <div className={s.eyebrow}>POSLEDNÝ KROK UKÁŽKY</div>
            {title("Menej pamätania. Jasnejší ďalší krok.")}
            <p className={s.lead}>
              Toto je priestor, ktorý si chceš vytvoriť pre seba. Skontroluj
              svoj program a vyskúšaj dokončenie bez platby.
            </p>
            <EverydayImage />
            <div className={s.productCard}>
              <div className={s.cardTop}>
                <span>FITLINER PROGRAM</span>
                <span className={s.pill}>{selected.duration}</span>
              </div>
              <h2>{selected.name}</h2>
              <div className={`${s.bill} ${s.total}`}>
                <span>Celková cena programu</span>
                <strong>{euro(total)}</strong>
              </div>
              <div className={s.cardBottom}>
                Dnes zaplatíš <strong>0,00 €</strong> · test bez platby
              </div>
            </div>
            <p className={s.caption}>
              Konečná testovacia cena vrátane prípadných daní. Žiadna karta,
              predplatné ani automatické obnovenie sa neaktivujú.
            </p>
            <p
              className={s.caption}
              aria-live={remaining === 0 ? "polite" : "off"}
            >
              {remaining > 0
                ? `Uvítacia cena platí ešte ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}. Potom sa zmení na ${euro(selected.regular)}.`
                : "Uvítacia ponuka vypršala. Vyššia cena je už zahrnutá v súhrne."}
            </p>
            {button("Dokončiť test bez platby", () => go("done"))}
            <CheckoutValue answers={answers} />
            {button("Dokončiť test bez platby", () => go("done"))}
            <button
              data-track="change_plan"
              className={s.textButton}
              onClick={() => go("offer")}
            >
              Zmeniť program
            </button>
          </>
        )}
        {step === "done" && (
          <>
            <div className={s.doneIcon}>✓</div>
            <div className={s.eyebrow}>UKÁŽKA JE DOKONČENÁ</div>
            {title(
              member
                ? "Tvoja forma. Výhoda tvojho fitka."
                : "Prvý krok máš za sebou.",
            )}
            <p className={s.lead}>
              {member
                ? "Otestoval/a si vetvu plného prístupu cez partnerské fitko."
                : "Prešiel/prešla si celou cestou od cieľa až po výber programu."}{" "}
              Nič sme neúčtovali ani nevytvorili účet.
            </p>
            <div className={s.productCard}>
              <h2>{rec.goal}</h2>
              {week}
              <div className={s.cardBottom}>
                {rec.days}× týždenne · {rec.minutes} minút · {rec.location}
              </div>
            </div>
            {button("Vyskúšať druhú vetvu", () => go("verification"))}
            <button
              data-track="restart"
              className={s.textButton}
              onClick={restart}
            >
              Prejsť cestu od začiatku
            </button>
          </>
        )}
      </main>
      <footer className={s.footer}>
        <span>FITLINER · Priestor pre tvoj progres.</span>
        <span>Ukážka predajnej cesty</span>
      </footer>
    </div>
  );
}
