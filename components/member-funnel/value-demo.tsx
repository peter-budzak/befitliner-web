"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Answers, recommendation } from "./model";
import s from "./value-demo.module.css";

export function EverydayImage() {
  return (
    <figure className={s.photo}>
      <Image
        src="/images/member-funnel/everyday.png"
        alt="Modelová používateľka s telefónom pred tréningom, pri obede a pri večernom prehľade"
        width={1536}
        height={1024}
        sizes="(max-width: 760px) 88vw, 620px"
      />
      <figcaption>
        Modelové situácie · ilustračný obrázok vytvorený pomocou AI
      </figcaption>
    </figure>
  );
}

export function DayPreview() {
  return (
    <>
      <EverydayImage />
      <div className={s.dayGrid}>
        {[
          [
            "18:15",
            "Po práci",
            "Čo mám dnes vlastne cvičiť?",
            "Otvoríš plán a máš východisko pre dnešný tréning.",
          ],
          [
            "12:30",
            "Pri obede",
            "Zase rozpisovať každú živinu?",
            "Jedlo opíšeš slovami a skontroluješ orientačný odhad.",
          ],
          [
            "20:00",
            "Večer",
            "Posúvam sa vôbec?",
            "Pozrieš si zaznamenané tréningy a predchádzajúce výkony.",
          ],
        ].map(([time, label, before, after]) => (
          <article key={time}>
            <small>
              {time} · {label}
            </small>
            <p>{before}</p>
            <strong>{after}</strong>
          </article>
        ))}
      </div>
      <p className={s.note}>
        Príklady použitia overených funkcií. Konkrétne obrazovky aplikácie sa
        môžu líšiť.
      </p>
    </>
  );
}

export function ValueDemo({
  kind,
  answers,
}: {
  kind: "training" | "food" | "progress";
  answers: Answers;
}) {
  const [withApp, setWithApp] = useState(true);
  const [recorded, setRecorded] = useState(false);
  const [restEnd, setRestEnd] = useState<number | null>(null);
  const [rest, setRest] = useState(90);
  useEffect(() => {
    if (restEnd === null) return;
    const tick = () =>
      setRest(Math.max(0, Math.ceil((restEnd - Date.now()) / 1000)));
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [restEnd]);
  const [meal, setMeal] = useState(false);
  const rec = recommendation(answers);
  const [metric, setMetric] = useState<"regularity" | "strength">("regularity");
  const context =
    kind === "training"
      ? "18:15 · ZAČÍNAŠ TRÉNING"
      : kind === "food"
        ? "12:30 · DOJEDOL/DOJEDLA SI OBED"
        : "NEDEĽA · POZERÁŠ SA SPÄŤ";
  const before =
    kind === "training"
      ? [
          "Kde mám posledný tréning?",
          "Koľko kíl som mal/a minule?",
          "Čím dnes začať?",
        ]
      : kind === "food"
        ? [
            "Jedlo je zjedené. Záznam nikde.",
            "Koľko bielkovín v tom asi bolo?",
            "Večer si už porciu nepamätám.",
          ]
        : [
            "Číslo na váhe sa veľmi nezmenilo.",
            "Mám pocit, že sa nikam neposúvam.",
            "Minulé výkony si nepamätám.",
          ];
  return (
    <div className={s.demo}>
      <div className={s.context}>
        {context}
        <span>Interaktívny model</span>
      </div>
      <div
        className={s.toggle}
        role="group"
        aria-label="Porovnať modelové situácie"
      >
        <button
          data-track="before"
          aria-pressed={!withApp}
          onClick={() => setWithApp(false)}
        >
          Bez prehľadu
        </button>
        <button
          data-track="with_app"
          aria-pressed={withApp}
          onClick={() => setWithApp(true)}
        >
          S Fitlinerom
        </button>
      </div>
      <div className={s.stage} key={String(withApp)}>
        {!withApp ? (
          <div className={s.before}>
            <span className={s.largeSymbol}>?</span>
            {before.map((t) => (
              <p key={t}>{t}</p>
            ))}
            <small>Modelová situácia, ak dnes nemáš vlastný systém.</small>
          </div>
        ) : kind === "training" ? (
          <>
            <div className={s.appBar}>
              <b>MÔJ TRÉNING</b>
              <span>
                {rec.minutes} min · {rec.location}
              </span>
            </div>
            <h3>Nemusíš začínať od nuly.</h3>
            <div className={s.previous}>
              <small>PREDCHÁDZAJÚCI ZÁZNAM</small>
              <strong>
                10 opakovaní <span>×</span> 12 kg
              </strong>
              <p>Minulý výkon máš pri dnešnom cviku poruke.</p>
            </div>
            <div className={s.exercise}>
              <span>Séria 1</span>
              <b>10 opakovaní</b>
              <b>12 kg</b>
            </div>
            <button
              className={s.demoAction}
              data-track="log_set"
              onClick={() => {
                setRecorded(!recorded);
                setRest(90);
                setRestEnd(recorded ? null : Date.now() + 90000);
              }}
            >
              {recorded
                ? "✓ Séria označená · vyskúšať znova"
                : "Vyskúšať označenie série"}
            </button>
            {recorded && (
              <div className={s.previous}>
                <small>PRESTÁVKA MEDZI SÉRIAMI</small>
                <strong aria-label="Zostávajúci čas">
                  {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}
                </strong>
                <p>
                  {rest > 0
                    ? "Modelový časovač · 90 sekúnd"
                    : "Prestávka skončila. Ďalšia séria podľa tvojho tempa."}
                </p>
                <button
                  className={s.demoAction}
                  data-track="skip_rest"
                  onClick={() => {
                    setRest(0);
                    setRestEnd(null);
                  }}
                >
                  Preskočiť prestávku
                </button>
              </div>
            )}
            <p role="status" className={s.feedback}>
              {recorded
                ? "Séria je v modelovom zázname. Časovač sleduje prestávku, ty sa sústreď na tréning."
                : "Ťukni a pozri si princíp zápisu."}
            </p>
          </>
        ) : kind === "food" ? (
          <>
            <div className={s.appBar}>
              <b>STRAVOVACÍ DENNÍK</b>
              <span>Obed</span>
            </div>
            <h3>Napíš to tak, ako by si to povedal/a.</h3>
            <div className={s.bubble}>
              Kuracie prsia, ryža a zelenina. Približne 150 g mäsa, 150 g
              varenej ryže a 100 g zeleniny.
            </div>
            <button className={s.demoAction} onClick={() => setMeal((v) => !v)}>
              {meal ? "Ukázať zadanie znova" : "Ukázať modelový odhad"}
            </button>
            {meal ? (
              <div className={s.nutrition} role="status">
                <small>ILUSTRAČNÝ ODHAD, NIE ŽIVÝ VÝPOČET AI</small>
                <div>
                  <strong>
                    480<small>kcal</small>
                  </strong>
                  <strong>
                    50 g<small>bielkoviny</small>
                  </strong>
                  <strong>
                    50 g<small>sacharidy</small>
                  </strong>
                </div>
                <p>
                  Pred uložením skontroluješ porciu aj prípravu. Olej, omáčka a
                  množstvo výsledok menia.
                </p>
              </div>
            ) : (
              <p className={s.feedback}>
                V aplikácii dostaneš odhad energie a živín na kontrolu.
              </p>
            )}
          </>
        ) : (
          <>
            <div className={s.appBar}>
              <b>TVÔJ PROGRES</b>
              <span>Modelové dáta</span>
            </div>
            <h3>Aj keď váha stojí, pozri sa na tréning.</h3>
            <div className={s.metricTabs}>
              <button
                data-track="chart_regularity"
                aria-pressed={metric === "regularity"}
                onClick={() => setMetric("regularity")}
              >
                Pravidelnosť
              </button>
              <button
                data-track="chart_strength"
                aria-pressed={metric === "strength"}
                onClick={() => setMetric("strength")}
              >
                Výkon
              </button>
            </div>
            <div
              className={s.bars}
              key={metric}
              aria-label={
                metric === "regularity"
                  ? "Model: 2, 3, 2 a 3 tréningy za týždeň"
                  : "Model: 8, 9, 9 a 10 opakovaní pri rovnakej váhe"
              }
            >
              {(metric === "regularity" ? [2, 3, 2, 3] : [8, 9, 9, 10]).map(
                (v, i) => (
                  <div key={i}>
                    <span
                      style={{
                        height: `${metric === "regularity" ? v * 30 : v * 10}px`,
                      }}
                    >
                      {v}
                    </span>
                    <small>
                      {i + 1}. {metric === "regularity" ? "týž." : "tréning"}
                    </small>
                  </div>
                ),
              )}
            </div>
            <p className={s.feedback}>
              {metric === "regularity"
                ? "Uvidíš, ako pravidelne si trénoval/a."
                : "Porovnáš opakovania pri rovnakej záťaži."}
            </p>
          </>
        )}
      </div>
      <p className={s.note}>
        {kind === "training"
          ? "Ukážka ovládania. Váha a opakovania sú modelové, nie odporúčanie pre teba."
          : kind === "food"
            ? "Ukážka neposiela údaje do AI ani neukladá jedlo. Nutričné odhady nie sú presné meranie."
            : "Ilustračné historické záznamy, nie sľub ani predpoveď tvojich výsledkov."}
      </p>
    </div>
  );
}

export function CheckoutValue({ answers }: { answers: Answers }) {
  const rec = recommendation(answers);
  return (
    <section className={s.checkoutValue} aria-label="Čo ti Fitliner uľahčí">
      <div className={s.checkoutIntro}>
        <small>TVOJ CIEĽ</small>
        <h2>{rec.goal}</h2>
        <p>
          {rec.days} dni v týždni · približne {rec.minutes} minút ·{" "}
          {rec.location}
        </p>
      </div>
      <div className={s.valueRows}>
        {[
          [
            "01",
            "Pred tréningom",
            "Plán podľa tvojho režimu",
            "V aplikácii zadáš cieľ, čas a vybavenie. AI ti pomôže pripraviť tréningový plán.",
          ],
          [
            "02",
            "Počas tréningu",
            "Záznam namiesto pamätania",
            "Série, opakovania, váhy a predchádzajúce hodnoty máš spolu.",
          ],
          [
            "03",
            "V bežný deň",
            "Jedlo opísané slovami",
            "Orientačný odhad živín skontroluješ podľa skutočnej porcie.",
          ],
          [
            "04",
            "Na konci týždňa",
            "Prehľad namiesto pocitu",
            "História tréningov aj nahratých krvných výsledkov a meraní z váhy má svoje miesto v účte.",
          ],
        ].map(([n, time, title, copy]) => (
          <article key={n}>
            <span>{n}</span>
            <div>
              <small>{time}</small>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          </article>
        ))}
      </div>
      <div className={s.faq}>
        <details>
          <summary data-track="faq_plan">
            Dostanem hotový tréning už po tomto dotazníku?
          </summary>
          <p>
            Tu pripravujeme súhrn tvojich preferencií. Konkrétny plán si
            vytvoríš alebo upravíš v aplikácii. Táto testovacia cesta zatiaľ do
            aplikácie údaje neprenáša.
          </p>
        </details>
        <details>
          <summary data-track="faq_coach">
            Je súčasťou aj osobný tréner?
          </summary>
          <p>
            Ukazujeme pomoc AI. Individuálne služby ľudského trénera nie sú
            automaticky súčasťou programu.
          </p>
        </details>
        <details>
          <summary data-track="faq_member">
            Čo ak mám členstvo v partnerskom fitku?
          </summary>
          <p>
            Počas aktívneho členstva máš celú aplikáciu zdarma. V tejto ukážke
            si túto vetvu môžeš nasimulovať.
          </p>
        </details>
      </div>
    </section>
  );
}
