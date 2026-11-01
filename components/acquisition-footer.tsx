import Link from "next/link";
import Image from "next/image";
import { featureCopy } from "@/lib/features";
import { isPartnerLocale, PARTNER_FOOTER_LABELS } from "@/lib/partners/locales";
import { joinCopy } from "@/lib/trainer-join-copy";

type Props = {
  locale: string;
  labels: {
    links_title: string;
    privacy: string;
    terms: string;
    for_gyms: string;
    app_title: string;
    download_ios: string;
    download_android: string;
    rights: string;
  };
  supportLabel: string;
  iosUrl: string;
  androidUrl: string;
};
const storeCopy: Record<string, [string, string]> = {
  en: ["Download on the", "Get it on"],
  sk: ["Stiahnuť v", "Stiahnuť z"],
  de: ["Laden im", "Jetzt bei"],
  es: ["Descárgalo en el", "Disponible en"],
  fr: ["Télécharger dans l’", "Disponible sur"],
  "zh-Hans": ["下载于", "立即下载"],
};
const copy: Record<string, [string, string, string]> = {
  sk: [
    "Tréning, ľudia a fitká. Na jednom mieste.",
    "Zdravotná karta",
    "Návody",
  ],
  en: ["Training, people and gyms. All in one place.", "Health Card", "Guides"],
  de: [
    "Training, Menschen und Studios. Alles an einem Ort.",
    "Gesundheitskarte",
    "Ratgeber",
  ],
  es: [
    "Entrenamiento, personas y gimnasios. Todo en un lugar.",
    "Tarjeta de Salud",
    "Guías",
  ],
  fr: [
    "Entraînement, communauté et salles. Au même endroit.",
    "Carte Santé",
    "Guides",
  ],
  "zh-Hans": ["训练、伙伴与健身房，尽在一处。", "健康档案", "指南"],
};
export default function AcquisitionFooter({
  locale,
  labels,
  supportLabel,
  iosUrl,
  androidUrl,
}: Props) {
  const [claim, health, guides] = copy[locale] ?? copy.en;
  const audiences = joinCopy(locale);
  const storeLabels = storeCopy[locale] ?? storeCopy.en;
  const linkStyle =
    "w-fit rounded-sm py-1 text-sm leading-6 text-white/60 transition-colors hover:text-[#c5b2ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b69aff]";
  return (
    <footer className="mt-8 border-t border-white/10 pt-10 pb-4 sm:mt-12 sm:pt-12">
      <div className="grid items-start gap-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr] lg:gap-12">
        <div>
          <Link
            href={`/${locale}`}
            aria-label="Fitliner"
            className="inline-flex items-start rounded-sm font-extrabold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b69aff]"
          >
            <span className="text-xl tracking-[.3em]">FITLINER</span>
            <span className="ml-1 mt-1 text-[8px] text-white/45">TM</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-7 text-white/60">
            {claim}
          </p>
          <div
            aria-hidden="true"
            className="mt-6 h-0.5 w-10 rounded-full bg-[#8b5cf6]"
          />
        </div>
        <nav aria-label={labels.links_title}>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[.15em] text-white/80">
            {labels.links_title}
          </h2>
          <div className="flex flex-col gap-1">
            <Link className={linkStyle} href={`/${locale}/features`}>
              {featureCopy(locale).all}
            </Link>
            <Link className={linkStyle} href={`/${locale}/trainers`}>
              {audiences.trainer}
            </Link>
            <Link className={linkStyle} href={`/${locale}/gyms`}>
              {labels.for_gyms}
            </Link>
            <Link className={linkStyle} href={`/${locale}/health`}>
              {health}
            </Link>
            <Link
              className={linkStyle}
              href={`/${isPartnerLocale(locale) ? locale : "en"}/partners`}
            >
              {PARTNER_FOOTER_LABELS[isPartnerLocale(locale) ? locale : "en"]}
            </Link>
            {(locale === "sk" || locale === "en") && (
              <Link className={linkStyle} href={`/${locale}/guides`}>
                {guides}
              </Link>
            )}
          </div>
        </nav>
        <div className="sm:col-span-2 lg:col-span-1">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-[.15em] text-white/80">
            {labels.app_title}
          </h2>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-start">
            {[
              {
                name: "App Store",
                href: iosUrl,
                icon: "/badge/appstore.png",
                label: labels.download_ios,
                prefix: storeLabels[0],
              },
              {
                name: "Google Play",
                href: androidUrl,
                icon: "/badge/googleplay.png",
                label: labels.download_android,
                prefix: storeLabels[1],
              },
            ].map((store) => (
              <a
                key={store.name}
                href={store.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${store.label} — ${store.name}`}
                className="group inline-flex min-h-14 w-[196px] max-w-full items-center gap-3 rounded-lg border border-white/35 bg-black px-4 py-2 text-white transition-colors hover:border-[#b69aff] hover:bg-[#101013] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b69aff]"
              >
                <Image
                  src={store.icon}
                  alt=""
                  width={32}
                  height={36}
                  className="h-8 w-8 shrink-0 object-contain"
                />
                <span className="min-w-0">
                  <span className="block text-[10px] leading-4 text-white/90">
                    {store.prefix}
                  </span>
                  <span className="block whitespace-nowrap text-[21px] font-medium leading-6 tracking-tight">
                    {store.name}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col gap-5 border-t border-white/[.07] pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-white/40">
          © {new Date().getFullYear()} Fitliner. {labels.rights}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <Link className={linkStyle} href={`/${locale}/privacy`}>
            {labels.privacy}
          </Link>
          <Link className={linkStyle} href={`/${locale}/terms`}>
            {labels.terms}
          </Link>
          <Link className={linkStyle} href={`/${locale}/support`}>
            {supportLabel}
          </Link>
        </div>
      </div>
    </footer>
  );
}
