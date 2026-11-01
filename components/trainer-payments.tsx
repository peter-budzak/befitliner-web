"use client";

import Image from "next/image";
import { useState } from "react";

export default function TrainerPayments({ onNext }: { onNext: () => void }) {
  const [price, setPrice] = useState(20);
  const money = (amount: number) =>
    new Intl.NumberFormat("sk-SK", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#bb9aff]">
        Platby bez dohadovania
      </p>
      <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
        Online platby kartou, Apple Pay a Google Pay s automatickou fakturáciou.
      </h1>
      <p className="mt-6 text-lg leading-8 text-white/65">
        Ako tréner môžeš využívať všetky funkcie celkom zadarmo bez obmedzení. Z
        online platieb si necháme 5 % poplatok na fungovanie.
      </p>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-white/40">
        Možnosti platieb cez Stripe
      </p>
      <div className="mb-4 mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          ["Visa", "visa"],
          ["Mastercard", "mastercard"],
          ["Apple Pay", "applepay"],
          ["Google Pay", "googlepay"],
          ["Revolut Pay", "revolut"],
        ].map(([label, icon]) => (
          <span
            key={icon}
            className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3"
          >
            <Image
              src={`/images/payments/${icon}.svg`}
              width={34}
              height={24}
              alt=""
              className="h-6 w-8 shrink-0 object-contain"
            />
            <span className="text-xs font-semibold sm:text-sm">{label}</span>
          </span>
        ))}
      </div>
      <p className="mb-7 text-sm leading-6 text-white/55">
        Platby zabezpečuje platobná brána{" "}
        <a
          href="https://stripe.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 align-middle text-[#bfaaff] underline underline-offset-4"
        >
          <Image
            src="/images/payments/stripe.svg"
            alt="Stripe"
            width={48}
            height={22}
            className="h-5 w-12 object-contain"
          />
          <span aria-hidden="true">↗</span>
        </a>
      </p>
      <section
        aria-label="Kalkulačka poplatku Fitliner"
        className="rounded-3xl border border-[#ae85ff]/25 bg-gradient-to-br from-[#312344] to-[#1b1622] p-6 sm:p-8"
      >
        <h2 className="text-xl font-bold leading-7">
          Zisti, koľko si nechá Fitliner z online platieb
        </h2>
        <div className="mb-4 mt-8 flex items-center justify-between gap-3">
          <label htmlFor="training-price" className="text-sm text-white/65">
            Cena tréningu
          </label>
          <output htmlFor="training-price" className="text-xl font-bold">
            {money(price)}
          </output>
        </div>
        <input
          id="training-price"
          type="range"
          min={5}
          max={200}
          step={1}
          value={price}
          aria-valuetext={money(price)}
          onChange={(event) => setPrice(Number(event.target.value))}
          className="h-2 w-full cursor-pointer accent-[#b392ff]"
        />
        <div className="mt-2 flex justify-between text-xs text-white/40">
          <span>5 €</span>
          <span>200 €</span>
        </div>
        <div className="mt-7 border-t border-white/10 pt-7 text-center">
          <p className="text-sm text-[#c3a4ff]">Fitliner si nechá 5 %</p>
          <output
            htmlFor="training-price"
            aria-live="polite"
            className="mt-3 block text-5xl font-extrabold tracking-tight text-white sm:text-6xl"
          >
            {money(Math.round(price * 5) / 100)}
          </output>
          <p className="mt-3 text-xs text-white/45">z jednej online platby</p>
        </div>
      </section>

      <button
        type="button"
        onClick={onNext}
        className="mt-7 w-full rounded-2xl bg-[#7947ff] p-5 font-bold text-white transition hover:bg-[#956eff]"
      >
        Pokračovať k registrácii →
      </button>
    </div>
  );
}
