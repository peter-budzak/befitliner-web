import {isTrainerLocale,trainerPath,type TrainerLocale} from './trainer-locale';
export type BookingIntent={slug:string;offer:string;slot:string;locale:TrainerLocale};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseBookingIntent(raw:string|null,locale:string|null):BookingIntent|null {
  if(!raw || raw.length>600 || !locale || !isTrainerLocale(locale))return null;
  try {
    const value=JSON.parse(raw);
    if(!value || typeof value.slug!=='string' || !/^[a-z][a-z0-9-]{2,63}$/.test(value.slug) ||
      ['account','setup','join','sitemap'].includes(value.slug) || typeof value.offer!=='string' || !uuid.test(value.offer) ||
      typeof value.slot!=='string' || (value.slot!==''&&!uuid.test(value.slot)))return null;
    return {slug:value.slug,offer:value.offer,slot:value.slot,locale};
  }catch{return null;}
}
export function bookingCallback(origin:string,intent:BookingIntent) {
  // Selection only, never credentials, email, price or payment authority.
  const query=new URLSearchParams({lang:intent.locale,booking:JSON.stringify({slug:intent.slug,offer:intent.offer,slot:intent.slot})});
  return `${origin}/trainers/account?${query}`;
}
export function bookingDestination(intent:BookingIntent) {
  return trainerPath(intent.slug,intent.locale)+'#'+new URLSearchParams({offer:intent.offer,slot:intent.slot,verified:'1'});
}
