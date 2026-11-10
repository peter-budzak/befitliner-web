"use client";

import { useRef, useState } from "react";
import { trainerIntroCopy } from "@/lib/trainer-intro-copy";
import { locales } from "@/lib/trainer-join-copy";

const cta =
  "mt-7 w-full rounded-2xl bg-[#7947ff] p-5 font-bold text-white transition hover:bg-[#956eff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";
const card =
  "rounded-3xl border border-white/10 bg-gradient-to-br from-[#292137] to-[#19151f] p-6";

const benefitIcons = [
  "M8 3v4m8-4v4M4 10h16m-9 5 2 2 3-4M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z",
  "M20 7v4h-4M4 17v-4h4M5 9a7.5 7.5 0 0 1 12-3l3 5M4 13l3 5a7.5 7.5 0 0 0 12-3",
  "M6 3h9l3 3v15H6V3Zm8 0v4h4M9 11h6m-6 4h6m-6 3h3",
  "M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14M6 9h3m6 0h3M6 13h3m6 0h3",
];

export function TrainerIntro({ locale, onNext }: { locale: string; onNext: () => void }) {
  const copy = trainerIntroCopy[locales.find((item) => item === locale) ?? "en"];

  function startProfile() {
    onNext();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  const startButton = (
    <button
      type="button"
      className={`${cta} flex items-center justify-between gap-3 text-left shadow-[0_8px_40px_-12px_#7947ff]`}
      onClick={startProfile}
    >
      {copy.start}
      <span aria-hidden="true">↗</span>
    </button>
  );

  return (
    <div className="relative isolate">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 right-0 -z-10 h-64 w-64 rounded-full bg-[#7947ff]/15 blur-3xl"
      />
      <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ad86ff]/25 bg-[#7947ff]/10 px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-[#c8adff]">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#b58cff]" />
        {copy.audience}
      </p>
      <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl">
        {copy.headline}{" "}
        <span className="bg-gradient-to-r from-[#c5aaff] to-[#a487ff] bg-clip-text text-transparent">
          {copy.highlight}
        </span>
      </h1>
      <p className="mt-5 text-base leading-7 text-[#e3d6ff] sm:text-lg">
        {copy.description}
      </p>
      {startButton}
      <a
        href="#ako-to-funguje"
        className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#c8adff] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        {copy.seeHow} <span aria-hidden="true">↓</span>
      </a>

      <section
        id="ako-to-funguje"
        aria-labelledby="ako-to-funguje-nadpis"
        className="mt-8 scroll-mt-6"
      >
        <h2 id="ako-to-funguje-nadpis" className="text-2xl font-bold">
          {copy.how}
        </h2>
        <div className="mt-4 flex aspect-video flex-col items-center justify-center gap-3 rounded-3xl border border-[#ac83ff]/25 bg-gradient-to-br from-[#33244d] via-[#211a30] to-[#16131d] p-5 text-center">
          <span
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-2xl bg-[#9568ff]/20 text-[#c8adff]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m10 9 5 3-5 3z" />
            </svg>
          </span>
          <p className="font-bold">{copy.videoPlaceholder}</p>
        </div>
        <ol className="mt-4 grid gap-2 sm:grid-cols-3">
          {copy.bookingSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
              <span aria-hidden="true" className="font-bold text-[#c8adff]">
                {index + 1}.
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="trainer-benefits" className="mt-9">
        <h2 id="trainer-benefits" className="text-2xl font-bold">
          {copy.benefitsTitle}
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {copy.benefits.map(({ title, description }, index) => (
            <li
              key={title}
              className="rounded-2xl border border-[#ac83ff]/20 bg-[#9568ff]/5 p-4"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-[#9568ff]/15 text-[#c8adff]">
                <svg
                  aria-hidden="true"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={benefitIcons[index]} />
                </svg>
              </span>
              <h3 className="mt-3 font-semibold text-[#e3d6ff]">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-white/75">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {startButton}
    </div>
  );
}

const calendarCounts = [
  0, 2, 5, 3, 0, 1, 0, 4, 5, 2, 0, 3, 0, 1, 5, 4, 2, 0, 3, 5, 0, 2, 1, 5, 4, 0,
  3, 2, 0, 5,
];
const calendarTimes = ["08:00", "10:00", "14:00", "16:00", "17:00"];
const bookedOrder = [3, 0, 2, 1, 4];
function PersonIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
    </svg>
  );
}
export function TrainerCalendar() {
  const [day, setDay] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const count = calendarCounts[day - 1];
  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <p className="text-lg font-bold">Jún 2026</p>
          <p className="mt-1 text-xs text-white/50">
            Vzorový mesiac · 5 termínov denne
          </p>
        </div>
        <span className="rounded-full bg-[#a67aff]/10 px-3 py-1 text-xs text-[#c6a8ff]">
          30 dní
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {["Po", "Ut", "St", "Št", "Pi", "So", "Ne"].map((label) => (
          <span key={label} className="pb-2 text-center text-xs text-white/50">
            {label}
          </span>
        ))}
        {calendarCounts.map((booked, index) => (
          <button
            key={index}
            type="button"
            aria-label={`${index + 1}. jún, ${booked} z 5 termínov obsadených`}
            aria-haspopup="dialog"
            onClick={() => {
              setDay(index + 1);
              dialog.current?.showModal();
            }}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border py-2 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transform-none ${booked === 0 ? "border-emerald-400/25 bg-emerald-400/15 text-emerald-200" : booked === 5 ? "border-red-400/30 bg-red-400/15 text-red-200" : "border-amber-300/30 bg-amber-300/15 text-amber-200"}`}
          >
            <span className="text-[11px] opacity-70">{index + 1}</span>
            <span className="flex items-center gap-1 text-sm font-bold">
              {booked > 0 && <PersonIcon />}
              {booked}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/65">
        {[
          ["bg-emerald-300", "Voľný deň"],
          ["bg-amber-300", "Čiastočne obsadený"],
          ["bg-red-300", "Plne obsadený"],
        ].map(([color, label]) => (
          <span key={label} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm text-white/50">
        Klikni na deň a pozri si voľné aj obsadené časy. Číslo pri ikone
        označuje počet obsadených termínov.
      </p>
      <dialog
        ref={dialog}
        aria-labelledby="trainer-day-title"
        className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-3xl border border-white/15 bg-[#211a2d] p-6 text-white shadow-2xl backdrop:bg-black/75"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              dialog.current?.close();
          }
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 id="trainer-day-title" className="text-xl font-bold">
              {day}. jún 2026
            </h3>
            <p className="mt-1 text-sm text-white/55">
              {count} obsadených · {5 - count} voľných
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Zavrieť termíny"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl"
          >
            ×
          </button>
        </div>
        <div className="space-y-2">
          {calendarTimes.map((time, index) => {
            const booked = bookedOrder.slice(0, count).includes(index);
            return (
              <div
                key={time}
                className="flex items-center justify-between rounded-xl bg-white/5 p-4"
              >
                <strong>{time}</strong>
                <span
                  className={`flex items-center gap-2 text-sm ${booked ? "text-amber-200" : "text-emerald-200"}`}
                >
                  {booked && <PersonIcon />}
                  {booked ? "Obsadené" : "Voľné"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-xs leading-5 text-white/45">
          Modelové termíny. Táto ukážka nevytvára rezerváciu.
        </p>
      </dialog>
    </>
  );
}

export function TrainerValue({
  kind,
  onNext,
}: {
  kind: "booking" | "clients" | "messages";
  onNext: () => void;
}) {
  const [selected, setSelected] = useState("");

  const content = {
    booking: [
      "Menej dohadovania. Viac tréningu.",
      "„Môžeš v utorok? A o hodinu neskôr?“ Ukáž klientovi dostupný termín a maj rezervácie prehľadne v kalendári.",
      "Smart kalendár",
    ],
    clients: [
      "Požiadaj klienta o správu jeho stravy a tréningu.",
      "Komunikuj s klientmi priamo cez messenger v aplikácii.",
      "Ty a tvoj klient. V jednom spojení.",
    ],
    messages: [
      "Messenger priamo v aplikácii.",
      "Komunikuj so svojimi klientmi priamo vo Fitliner a buduj si s nimi dokonalý vzťah.",
      "Vyskúšaj odpoveď klientovi",
    ],
  }[kind];
  return (
    <div key={kind}>
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#bda1ff]">
        Takto vyzerá jednoduchší deň
      </p>
      <h1 className="text-4xl font-extrabold leading-tight">{content[0]}</h1>
      <p className="my-6 text-lg leading-8 text-white/65">{content[1]}</p>
      <div className={card}>
        <p className="mb-5 text-xs uppercase tracking-widest text-white/45">
          Interaktívna modelová ukážka
        </p>
        <h2 className="mb-5 font-bold">{content[2]}</h2>
        {kind === "booking" ? (
          <TrainerCalendar />
        ) : kind === "clients" ? (
          <>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151219]">
              <div className="flex items-center gap-3 border-b border-white/10 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9467ff]/25 font-bold text-[#ceb5ff]">
                  A
                </span>
                <div>
                  <p className="font-semibold">Anna</p>
                  <p className="text-xs text-white/45">
                    Messenger · modelová konverzácia
                  </p>
                </div>
              </div>
              <div className="space-y-4 p-4 text-sm leading-6">
                <div className="ml-5 rounded-2xl rounded-br-sm bg-[#7947ff]/75 p-4">
                  <p className="mb-1 text-xs font-semibold text-white/65">
                    Peter · tréner
                  </p>
                  <p>
                    Ahoj Anna, skontroloval som, čo si včera jedla. Vyzerá to
                    super! A nastavil som ti tréningový program na zajtra.
                    Vidíme sa vo fitku.
                  </p>
                </div>
                <div className="mr-5 rounded-2xl rounded-bl-sm bg-white/10 p-4">
                  <p className="mb-1 text-xs font-semibold text-[#c4a8ff]">
                    Anna
                  </p>
                  <p>
                    Ďakujem, Peter, za tvoju dokonalú prácu. Vidíme sa zajtra.
                  </p>
                </div>
              </div>
            </div>
            <p className="mb-4 mt-7 text-xs font-semibold uppercase tracking-widest text-[#c1a3ff]">
              Ukážky z Anninho profilu
            </p>
            <div className="space-y-4">
              <section
                aria-label="Ukážka stravy klienta"
                className="rounded-2xl border border-white/10 bg-[#1c1922] p-4 sm:p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Strava</h3>
                  <span className="text-xs text-white/45">Včerajší záznam</span>
                </div>
                <p className="text-sm text-white/55">Denný príjem</p>
                <p className="mt-2 text-3xl font-bold">
                  1 850{" "}
                  <span className="text-base font-normal text-[#c5a5ff]">
                    z 2 100 kcal
                  </span>
                </p>
                <div className="my-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[88%] rounded-full bg-[#c3a4ff]" />
                </div>
                <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                  {[
                    ["Bielkoviny", "120 / 130 g", "bg-[#bea4ff]", "92%"],
                    ["Sacharidy", "230 / 250 g", "bg-[#e1a1ec]", "92%"],
                    ["Tuky", "50 / 60 g", "bg-[#9760f7]", "83%"],
                  ].map(([label, value, color, width]) => (
                    <div key={label}>
                      <p className="text-[11px] text-white/65 sm:text-xs">
                        {label}
                      </p>
                      <div className="my-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width }}
                        />
                      </div>
                      <p className="text-[11px] text-white/65 sm:text-xs">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                <details className="mt-5 rounded-xl bg-white/5 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-[#d4c0ff]">
                    Pozrieť zapísané jedlá
                  </summary>
                  <ul className="mt-3 space-y-2 text-sm text-white/65">
                    <li>Raňajky · ovsená kaša s jogurtom</li>
                    <li>Obed · kuracie mäso s ryžou</li>
                    <li>Olovrant · ovocie a tvaroh</li>
                    <li>Večera · šalát s vajíčkami a pečivom</li>
                  </ul>
                </details>
              </section>
              <section
                aria-label="Ukážka tréningu klienta"
                className="rounded-2xl border border-white/10 bg-[#1c1922] p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Tréning</h3>
                  <span className="rounded-full bg-[#7d51e7]/20 px-3 py-1 text-xs text-[#c8aaff]">
                    Na zajtra
                  </span>
                </div>
                <p className="text-sm text-[#ac80ff]">
                  Tréningový plán od Petra
                </p>
                <p className="mt-1 text-xl font-semibold">
                  Celé telo · sila a technika
                </p>
                <div className="my-4 grid grid-cols-3 gap-2 rounded-xl bg-white/5 p-3 text-center">
                  {[
                    ["45 min", "trvanie"],
                    ["3", "cviky"],
                    ["9", "sérií"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <p className="font-bold">{value}</p>
                      <p className="mt-1 text-xs text-white/45">{label}</p>
                    </div>
                  ))}
                </div>
                <details className="rounded-xl bg-white/5 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-[#d4c0ff]">
                    Pozrieť tréningový plán
                  </summary>
                  <ul className="mt-3 space-y-3 text-sm text-white/65">
                    <li>
                      Drep s činkou{" "}
                      <span className="block text-xs text-white/40">
                        3 série × 10 opakovaní
                      </span>
                    </li>
                    <li>
                      Príťahy na kladke{" "}
                      <span className="block text-xs text-white/40">
                        3 série × 12 opakovaní
                      </span>
                    </li>
                    <li>
                      Tlaky s jednoručkami{" "}
                      <span className="block text-xs text-white/40">
                        3 série × 10 opakovaní
                      </span>
                    </li>
                  </ul>
                </details>
              </section>
            </div>
            <p className="mt-4 text-xs leading-5 text-white/40">
              Modelová konverzácia a ilustračné údaje. Správa klientovej stravy
              a tréningu vyžaduje jeho súhlas. Žiadna správa sa z tejto ukážky
              neodosiela.
            </p>
          </>
        ) : (
          <>
            <div className="mr-8 rounded-2xl rounded-bl-sm bg-white/10 p-4 text-sm leading-6">
              Ahoj, dnešný tréning mám hotový. Nabudúce môžeme prejsť techniku
              drepu?
            </div>
            {selected && (
              <div
                aria-live="polite"
                className="ml-8 mt-4 rounded-2xl rounded-br-sm bg-[#7947ff]/50 p-4 text-sm leading-6"
              >
                Jasné, na ďalšom tréningu sa na ňu pozrieme.
              </div>
            )}
            <button
              disabled={Boolean(selected)}
              className="mt-5 w-full rounded-xl border border-[#aa87ff]/50 p-3 text-sm disabled:opacity-50"
              onClick={() => setSelected("reply")}
            >
              {selected
                ? "✓ Modelová odpoveď zobrazená"
                : "Ukázať odpoveď trénera"}
            </button>
            <p className="mt-3 text-xs text-white/45">
              Žiadna správa sa neodosiela.
            </p>
          </>
        )}
      </div>
      <button className={cta} onClick={onNext}>
        {kind === "booking"
          ? "Vytvoriť môj trénerský profil"
          : kind === "clients"
            ? "Pokračovať k údajom profilu"
            : "Dokončiť registráciu"}{" "}
        →
      </button>
    </div>
  );
}
