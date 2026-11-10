import copy from './trainer-copy.json';
export type TrainerLocale = keyof typeof copy;
export const trainerLocales = Object.keys(copy) as TrainerLocale[];
export const isTrainerLocale = (s:string):s is TrainerLocale => Object.hasOwn(copy,s);
export const trainerCopy = (locale:TrainerLocale) => copy[locale];
export function trainerPath(slug:string, locale:TrainerLocale) {
  return locale === 'sk' ? `/${slug}` : `/trainers/${slug}/${locale}`;
}
export function trainerAlternates(slug:string, origin:string) {
  return Object.fromEntries([...trainerLocales.map(locale=>[locale,origin+trainerPath(slug,locale)]),['x-default',origin+trainerPath(slug,'sk')]]);
}
export function serviceText(value:string,locale:TrainerLocale) {
  const text = value?.trim() || '';
  const t = trainerCopy(locale);
  if (text === 'Tréning') return t.personal;
  if (text === 'Skupinový HIT tréning') return t.group;
  const duration = /^(\d+) min tréning$/i.exec(text);
  return duration ? t.minutes.replace('{n}',duration[1]) : text;
}
export type PublicOffer = {id:string;name:string;description:string;currency:string;price_minor:number;interval:string;booking_kind?:string};
export type PublicSlot = {id:string;starts_at:string;ends_at:string;timezone:string;remaining:number;location:string;cancellation_hours:number};
