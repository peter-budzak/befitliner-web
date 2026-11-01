import en from "@/messages/features/en.json";
import sk from "@/messages/features/sk.json";
import de from "@/messages/features/de.json";
import es from "@/messages/features/es.json";
import fr from "@/messages/features/fr.json";
import zh from "@/messages/features/zh-Hans.json";
import pl from "@/messages/features/pl.json";
import hu from "@/messages/features/hu.json";
import { LOCALES, absoluteUrl } from "@/lib/seo";
export const FEATURE_LOCALES = [...LOCALES, "pl", "hu"] as const;
export type FeatureLocale = (typeof FEATURE_LOCALES)[number];
export const isFeatureLocale = (locale: string): locale is FeatureLocale =>
  FEATURE_LOCALES.includes(locale as FeatureLocale);
const copies: Record<FeatureLocale, typeof en> = {
  en,
  sk,
  de,
  es,
  fr,
  "zh-Hans": zh,
  pl,
  hu,
};
export const featureCopy = (locale: string) =>
  copies[isFeatureLocale(locale) ? locale : "en"];
export const featureAlternates = () =>
  Object.fromEntries([
    ...FEATURE_LOCALES.map((locale) => [
      locale,
      absoluteUrl(`/${locale}/features`),
    ]),
    ["x-default", absoluteUrl("/en/features")],
  ]);
