import Image from "next/image";

export default function TrainerAppHandoff({
  email,
  verified = false,
  pendingSave = false,
}: {
  email: string;
  verified?: boolean;
  pendingSave?: boolean;
}) {
  return (
    <div>
      {!pendingSave && <div className="mb-5 text-4xl text-[#62dfc8]">✓</div>}
      <p role="status" className="mb-3 text-[#62dfc8]">
        {pendingSave
          ? "Po dokončení registrácie pokračuj v aplikácii."
          : verified
            ? "Trénerský profil je uložený."
            : "Overovací odkaz sme ti poslali e-mailom."}
      </p>
      <h1 className="text-3xl font-extrabold sm:text-4xl">
        Stiahni si aplikáciu Fitliner
      </h1>
      {!verified && !pendingSave && (
        <div className="my-6 rounded-2xl border border-[#a98aff]/30 bg-[#7c4dff]/10 p-5 text-sm leading-7">
          Najprv otvor odkaz v e-maile{" "}
          <strong className="break-all">{email}</strong> — po overení sa profil
          automaticky uloží. Aplikáciu na overenie nepotrebuješ.
        </div>
      )}
      <p className="my-6 leading-7 text-white/65">
        V aplikácii sa prihlás rovnakým e-mailom:{" "}
        <strong className="break-all text-white">{email}</strong>.
      </p>
      <div className="my-7 flex flex-wrap gap-4">
        <a
          href="https://apps.apple.com/app/id6760855966"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl border border-white/20 bg-black px-4 py-3 hover:border-[#bfaaff]"
          aria-label="Stiahnuť Fitliner z App Store"
        >
          <Image
            src="/badge/appstore.png"
            alt="Stiahnuť v App Store"
            width={160}
            height={54}
            className="h-8 w-auto"
          />
          <span>
            <span className="block text-xs text-white/60">
              Stiahnuť aplikáciu
            </span>
            <strong>App Store</strong>
          </span>
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=com.fitliner.app"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl border border-white/20 bg-black px-4 py-3 hover:border-[#bfaaff]"
          aria-label="Stiahnuť Fitliner z Google Play"
        >
          <Image
            src="/badge/googleplay.png"
            alt="Stiahnuť v Google Play"
            width={180}
            height={54}
            className="h-8 w-auto"
          />
          <span>
            <span className="block text-xs text-white/60">
              Stiahnuť aplikáciu
            </span>
            <strong>Google Play</strong>
          </span>
        </a>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="mb-5 text-xl font-bold">
          Dokonči svoj trénerský profil
        </h2>
        <ol className="space-y-4 text-sm leading-6 text-white/75">
          <li>
            1. Otvor Fitliner a prejdi do svojho{" "}
            <strong className="text-white">Profilu</strong>.
          </li>
          <li>
            2. Otvor menu <strong className="text-white">vpravo hore</strong>.
          </li>
          <li>
            3. Vyber{" "}
            <strong className="text-[#bfaaff]">Môj trénerský profil</strong>.
          </li>
          <li>4. Dokonči nastavenie a prepoj online platby cez Stripe.</li>
        </ol>
        <div
          aria-hidden="true"
          className="mt-6 rounded-2xl border border-[#a98aff]/30 bg-[#211a31] p-4"
        >
          <div className="mb-3 flex justify-between text-sm text-white/50">
            <span>Profil</span>
            <span>•••</span>
          </div>
          <div className="rounded-xl bg-[#7c4dff]/20 p-4 font-semibold text-[#c9b4ff]">
            ▣ &nbsp; Môj trénerský profil →
          </div>
        </div>
      </div>
    </div>
  );
}
