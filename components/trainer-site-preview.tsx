"use client";

import Image from "next/image";
import { TrainerCalendar } from "./trainer-value";

export default function TrainerSitePreview({
  name,
  slug,
  bio,
}: {
  name: string;
  slug: string;
  bio: string;
}) {
  return (
    <section aria-label="Živý náhľad tvojej webstránky" className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-bold">Takto môže vyzerať tvoj web</h2>
        <span className="rounded-full bg-[#9f79ff]/10 px-3 py-1 text-xs text-[#c6a8ff]">
          Živý náhľad
        </span>
      </div>
      <div className="overflow-hidden rounded-3xl border border-[#ac87ff]/25 bg-[#19151f] shadow-xl">
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
          <span aria-hidden="true" className="flex shrink-0 gap-1">
            <i className="h-1.5 w-1.5 rounded-full bg-white/30" />
            <i className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <i className="h-1.5 w-1.5 rounded-full bg-white/15" />
          </span>
          <p className="break-all text-xs text-white/55">
            befitliner.com/{slug || "tvojemeno"}
          </p>
        </div>
        <div className="bg-gradient-to-b from-[#332348] to-transparent p-5 sm:p-6">
          <div className="mb-7 font-extrabold tracking-[.24em] text-white">
            FITLINER
            <span className="ml-1 align-super text-[8px] tracking-normal text-white/50">
              TM
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-[#b995ff]/50 shadow-lg">
              <Image
                src="/images/member-funnel/hero.jpg"
                alt="Ilustračná fotografia osobného trénera"
                width={320}
                height={400}
                className="absolute -left-48 top-0 h-[400px] w-80 max-w-none"
              />
            </div>
            <div className="min-w-0">
              <h3 className="break-words text-xl font-extrabold sm:text-2xl">
                {name.trim() || "Tvoje meno a priezvisko"}
              </h3>
              <p className="mt-1 text-sm text-[#b994ff]">Osobný tréner</p>
            </div>
          </div>
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-white/65">
            {bio.trim() ||
              "Tvoj príbeh sa začína tu. Keď napíšeš predstavenie vyššie, ihneď ho uvidíš na svojej stránke."}
          </p>
        </div>
        <div className="border-t border-white/10 p-4 sm:p-6">
          <h3 className="mb-5 text-lg font-bold">Rezervuj si tréning</h3>
          <TrainerCalendar />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/45">
        Fotka je ilustračná. Meno a popis sa menia podľa tvojich údajov. Klikni
        na deň v kalendári a vyskúšaj modelové termíny.
      </p>
    </section>
  );
}
