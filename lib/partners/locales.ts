import { LOCALES, absoluteUrl } from "@/lib/seo";
export const PARTNER_LOCALES = [...LOCALES, "pl", "hu"] as const;
export type PartnerLocale = (typeof PARTNER_LOCALES)[number];
export const isPartnerLocale = (locale: string): locale is PartnerLocale =>
  PARTNER_LOCALES.includes(locale as PartnerLocale);
export const PARTNER_LANGUAGE_NAMES: Record<PartnerLocale, string> = {
  en: "English",
  sk: "Slovenčina",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  "zh-Hans": "简体中文",
  pl: "Polski",
  hu: "Magyar",
};
export const PARTNER_FOOTER_LABELS: Record<PartnerLocale, string> = {
  en: "Country partners",
  sk: "Národní partneri",
  de: "Landespartner",
  es: "Socios nacionales",
  fr: "Partenaires nationaux",
  "zh-Hans": "国家合作伙伴",
  pl: "Partnerzy krajowi",
  hu: "Országos partnerek",
};
export const PARTNER_OG_LOCALES: Record<PartnerLocale, string> = {
  en: "en_US",
  sk: "sk_SK",
  de: "de_DE",
  es: "es_ES",
  fr: "fr_FR",
  "zh-Hans": "zh_CN",
  pl: "pl_PL",
  hu: "hu_HU",
};
export const partnerAlternates = () =>
  Object.fromEntries([
    ...PARTNER_LOCALES.map((locale) => [
      locale,
      absoluteUrl(`/${locale}/partners`),
    ]),
    ["x-default", absoluteUrl("/en/partners")],
  ]);
