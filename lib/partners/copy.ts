import en from "@/messages/partners/en.json";
import sk from "@/messages/partners/sk.json";
import de from "@/messages/partners/de.json";
import es from "@/messages/partners/es.json";
import fr from "@/messages/partners/fr.json";
import zh from "@/messages/partners/zh-Hans.json";
import pl from "@/messages/partners/pl.json";
import hu from "@/messages/partners/hu.json";
import type { PartnerLocale } from "./locales";
export type PartnerCopy = typeof en;
const copies: Record<PartnerLocale, PartnerCopy> = {
  en,
  sk,
  de,
  es,
  fr,
  "zh-Hans": zh,
  pl,
  hu,
};
export const getPartnerCopy = (locale: PartnerLocale) => copies[locale];
