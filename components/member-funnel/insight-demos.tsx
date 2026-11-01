"use client";
import { useState } from "react";
import { Answers, recommendation, questions } from "./model";
import s from "./value-demo.module.css";

export function CoachDemo({ answers }: { answers: Answers }) {
  const [food, setFood] = useState(false);
  const rec = recommendation(answers);
  const equipment = questions
    .find((q) => q.id === "equipment")
    ?.options.find((o) => o.value === answers.equipment)?.title;
  return (
    <div className={s.demo}>
      <div className={s.toggle} role="group" aria-label="Ukážka AI trénera">
        <button
          data-track="coach_training"
          aria-pressed={!food}
          onClick={() => setFood(false)}
        >
          Dnes mám menej času
        </button>
        <button
          data-track="coach_food"
          aria-pressed={food}
          onClick={() => setFood(true)}
        >
          Čo si dať na večeru?
        </button>
      </div>
      <div className={s.stage} key={String(food)}>
        <div className={s.appBar}>
          <b>OSOBNÝ AI TRÉNER</b>
          <span>Model rozhovoru</span>
        </div>
        <h3>Tvoj profil je už súčasťou rozhovoru.</h3>
        <div className={s.chips}>
          <span>{rec.goal}</span>
          <span>{rec.location}</span>
          <span>{equipment}</span>
          <span>{rec.days}× týždenne</span>
        </div>
        <div className={s.bubble}>
          {food
            ? "Čo si môžem dať na večeru podľa toho, čo som dnes jedol/a?"
            : "Dnes mám iba 20 minút. Pomôžeš mi upraviť tréning?"}
        </div>
        <div className={s.previous}>
          <small>AKO TI FITLINER POMÔŽE</small>
          <p>
            {food
              ? "Pri otázke o jedle vie AI využiť dnešné zapísané jedlá a nastavené výživové ciele. Nemusíš ich prepisovať do ďalšieho chatu. Porciu a návrh si skontroluješ."
              : `AI má tvoje preferencie aj dostupný kontext tréningového denníka. Môže ti pomôcť upraviť plán pre cvičenie ${rec.location} a vybavenie, ktoré máš. Návrh si pred použitím skontroluješ.`}
          </p>
        </div>
        <details className={s.explain}>
          <summary data-track="coach_explain">
            Prečo nestačí otvoriť obyčajný AI chat?
          </summary>
          <p>
            Aj všeobecný AI chat dokáže poradiť. Výhoda Fitlinera je prepojenie
            s profilom, tréningovým denníkom a stravou v jednej aplikácii.
            Kontext nemusíš ručne prenášať medzi aplikáciami. Dostupnosť
            konkrétnych údajov závisí od toho, čo máš v účte vyplnené a uložené.
          </p>
        </details>
      </div>
      <p className={s.note}>
        Ilustračný rozhovor. Táto stránka nevolá AI ani nečíta tvoj účet.
      </p>
    </div>
  );
}

export function HealthDemo() {
  const [stage, setStage] = useState(0);
  const [scale, setScale] = useState(false);
  return (
    <div className={s.demo}>
      <div className={s.stage}>
        <div className={s.appBar}>
          <b>TVOJA ZDRAVOTNÁ HISTÓRIA</b>
          <span>Fiktívne záznamy</span>
        </div>
        <h3>Výsledok spred rokov nájdeš vedľa dnešného.</h3>
        <div
          className={s.toggle}
          role="group"
          aria-label="Druh modelového výsledku"
        >
          <button
            data-track="blood"
            aria-pressed={!scale}
            onClick={() => setScale(false)}
          >
            Krvné výsledky
          </button>
          <button
            data-track="scale"
            aria-pressed={scale}
            onClick={() => setScale(true)}
          >
            Diagnostická váha
          </button>
        </div>
        <div className={s.pipeline} aria-label="Postup importu">
          {["Fotka alebo PDF", "Kontrola údajov", "História a graf"].map(
            (v, i) => (
              <button
                key={v}
                data-track={`health_${i}`}
                aria-pressed={stage === i}
                onClick={() => setStage(i)}
              >
                <span>{i + 1}</span>
                {v}
              </button>
            ),
          )}
        </div>
        <div className={s.healthPanel} key={`${stage}-${scale}`}>
          {stage === 0 ? (
            <>
              <div className={s.paper}>
                ▤
                <strong>
                  {scale
                    ? "Meranie z diagnostickej váhy"
                    : "Laboratórny výsledok"}
                </strong>
                <span>Starší dokument · dátum merania 12. 6. 2024</span>
                <i />
                <i />
                <i />
              </div>
              <p>
                Odfotíš papier alebo vyberieš PDF. Aj starší výsledok môžeš
                pridať do svojho účtu.
              </p>
            </>
          ) : stage === 1 ? (
            <>
              <div className={s.previous}>
                <small>SKONTROLUJ ROZPOZNANÉ ÚDAJE</small>
                <strong>
                  {scale
                    ? "Telesná hmotnosť · 78 kg"
                    : "Cholesterol · 5,3 mmol/l"}
                </strong>
                <p>
                  Dátum merania: 12. 6. 2024
                  <br />
                  Hodnotu, jednotku aj dátum pred uložením potvrdíš alebo
                  opravíš.
                </p>
              </div>
              <p>
                Do histórie patrí dátum vyšetrenia, nie dnešný dátum nahratia.
              </p>
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 360 140"
                role="img"
                aria-label={
                  scale
                    ? "Fiktívne merania hmotnosti: 78, 79 a 77 kilogramov v rokoch 2024 až 2026"
                    : "Fiktívne výsledky cholesterolu: 5,3, 5,6 a 5,2 mmol/l v rokoch 2024 až 2026"
                }
                className={s.historyChart}
              >
                <path
                  d="M30 112 H335 M30 20 V112"
                  fill="none"
                  stroke="#655475"
                />
                <path
                  d="M45 65 L180 38 L315 76"
                  fill="none"
                  stroke="#c496ff"
                  strokeWidth="3"
                />
                {[
                  [45, 65, scale ? "78" : "5,3"],
                  [180, 38, scale ? "79" : "5,6"],
                  [315, 76, scale ? "77" : "5,2"],
                ].map(([x, y, v], i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="#c496ff" />
                    <text
                      x={x}
                      y={Number(y) - 14}
                      textAnchor="middle"
                      fill="#eee"
                    >
                      {v}
                    </text>
                    <text x={x} y="134" textAnchor="middle" fill="#b9a9ca">
                      {2024 + i}
                    </text>
                  </g>
                ))}
              </svg>
              <p>
                {scale
                  ? "Vlastné merania z váhy spolu v čase."
                  : "Porovnáš staré a nové krvné výsledky na jednom mieste."}{" "}
                Modelové hodnoty ukazujú princíp histórie, nie očakávaný
                výsledok používania.
              </p>
            </>
          )}
        </div>
        {stage < 2 && (
          <button
            data-track="health_next"
            className={s.demoAction}
            onClick={() => setStage(stage + 1)}
          >
            {stage === 0
              ? "Ukázať kontrolu údajov"
              : "Zaradiť modelový výsledok do grafu"}
          </button>
        )}
        <details className={s.explain}>
          <summary data-track="health_details">
            Čo ešte zdravotná karta uchováva?
          </summary>
          <p>
            Výsledky krvi, podporované ďalšie merania a záznamy z diagnostických
            váh. Môžeš doplniť aj staré dokumenty vrátane detstva, ak ich máš.
            Hodnoty mimo referenčného intervalu uvedeného na výsledku sú
            označené na pozornosť a konzultáciu s lekárom; nejde o diagnózu.
            Rozpoznané údaje treba skontrolovať.
          </p>
        </details>
      </div>
      <p className={s.note}>
        Dlhodobá história vo vlastnom účte. V ukážke sa žiadny zdravotný
        dokument nenahráva.
      </p>
    </div>
  );
}

const alternatives = [
  {
    name: "Fitbod",
    feature: "Plánovanie a záznam tréningov",
    month: 15.99,
    year: 95.99,
    url: "https://fitbod.me/faqs/",
  },
  {
    name: "MacroFactor Nutrition",
    feature: "Výživový denník a prispôsobovanie cieľov",
    month: 11.99,
    year: 71.99,
    url: "https://macrofactor.com/workouts/price/",
  },
  {
    name: "Guava Premium",
    feature: "Automatické získavanie laboratórnych hodnôt a prémiové prehľady",
    month: 8,
    year: 78,
    url: "https://guavahealth.com/plans",
  },
];
export function PriceComparison() {
  const [yearly, setYearly] = useState(false);
  const dollar = (n: number) =>
    new Intl.NumberFormat("sk-SK", {
      style: "currency",
      currency: "USD",
    }).format(n);
  return (
    <details className={s.comparison}>
      <summary data-track="compare">
        Čo stoja vybrané samostatné aplikácie?
      </summary>
      <p>
        Tri príklady platených služieb pre podobné oblasti. Funkcie ani rozsah
        nie sú totožné s Fitlinerom.
      </p>
      <div className={s.toggle} role="group" aria-label="Fakturácia alternatív">
        <button
          data-track="compare_month"
          aria-pressed={!yearly}
          onClick={() => setYearly(false)}
        >
          Mesačne
        </button>
        <button
          data-track="compare_year"
          aria-pressed={yearly}
          onClick={() => setYearly(true)}
        >
          Ročne
        </button>
      </div>
      {alternatives.map((a) => (
        <div className={s.comparisonRow} key={a.name}>
          <div>
            <a
              data-track={
                a.name === "Fitbod"
                  ? "source_fitbod"
                  : a.name === "Guava Premium"
                    ? "source_guava"
                    : "source_macro"
              }
              href={a.url}
              target="_blank"
              rel="noreferrer"
            >
              {a.name} ↗
            </a>
            <small>{a.feature}</small>
          </div>
          <strong>
            {dollar(yearly ? a.year : a.month)}
            <small>/{yearly ? "rok" : "mesiac"}</small>
          </strong>
        </div>
      ))}
      <div className={s.comparisonRow}>
        <b>Súčet týchto troch služieb</b>
        <strong>
          {dollar(yearly ? 245.98 : 35.98)}
          <small>/{yearly ? "rok" : "mesiac"}</small>
        </strong>
      </div>
      <p>
        {yearly
          ? "Ročné platby spolu zodpovedajú približne 20,50 USD mesačne, platia sa však na rok vopred."
          : "Mesačný súčet nepoužíva zľavy pri ročnej platbe."}{" "}
        Existujú aj lacnejšie kombinácie: MacroFactor Nutrition + Workouts má
        balík za 89,99 USD/rok; s Guava Premium je to 167,99 USD/rok.
      </p>
      <p>
        Guava ponúka základnú históriu a dokumenty aj zdarma. Porovnávame jej
        platenú automatizáciu. Fitliner spája tréning, stravu a zdravotnú
        históriu v jednom účte.
      </p>
      <p className={s.note}>
        Oficiálne webové ceny overené 19. 10. 2026. USD, nie EUR. Miestne ceny,
        dane a akcie sa môžu líšiť. Fitliner nižšie uvádza testovacie ceny v EUR
        za 7/28/84 dní. Z týchto rozdielnych mien a období nepočítame percento
        úspory.
      </p>
    </details>
  );
}
