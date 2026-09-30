import sk from '@/messages/gyms/sk.json';
import en from '@/messages/gyms/en.json';
import de from '@/messages/gyms/de.json';
import es from '@/messages/gyms/es.json';
import fr from '@/messages/gyms/fr.json';
import zh from '@/messages/gyms/zh-Hans.json';
import type {SiteLocale} from './seo';

export type GymsCopy = typeof sk;
export const GYMS_COPY: Record<SiteLocale, GymsCopy> = {
  sk,
  en,
  de,
  es,
  fr,
  'zh-Hans': zh,
};
// Verified one-off EUR 297 Payment Link for Globalio LLC, shipping to all 27 EU countries.
// Override only with a verified starter-kit checkout URL. Never infer payment success from a redirect.
export const GYMS_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_GYMS_CHECKOUT_URL ||
  'https://buy.stripe.com/4gM4gyavMcLYaLa7a904800';
// Replace individual locale entries as localized VSL edits become available.
export const GYMS_VIDEO = {
  src: '/videos/gyms/sk.mp4',
  poster: '/images/gyms/sk-poster.jpg',
};
// Future experiments should select copy on the server; no random client assignment.
export const SK_HERO_VARIANTS = [
  sk.title,
  'Automatizujte svoje fitko. Nie svoj život okolo fitka.',
  '24/7 fitko bez toho, aby ste boli 24/7 v práci.',
] as const;

// Set to a real approved package photo in public/ when available.
export const GYMS_PACKAGE_IMAGE: string | undefined = undefined;

// Fill a locale slot when its translated portrait video is approved.
export const GYMS_VIDEOS: Record<SiteLocale, {src: string; language: SiteLocale} | null> = {
  sk: {
    src: 'https://www.veed.io/embed/4aa6517b-23b5-4f35-8463-44844014563e?watermark=0&color=&sharing=0&title=0',
    language: 'sk',
  },
  en: null,
  de: null,
  es: null,
  fr: null,
  'zh-Hans': null,
};

export function getGymVideo(locale: SiteLocale) {
  return GYMS_VIDEOS[locale] ?? GYMS_VIDEOS.sk!;
}
