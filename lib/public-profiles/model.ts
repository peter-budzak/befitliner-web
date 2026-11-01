import {GYM_LOCALES, type GymLocale} from '@/lib/seo';
export type EntityKind = 'user' | 'trainer' | 'gym';
export type PublicEntity = {id:string; kind:EntityKind; slug:string; name:string; bio:string|null; photo:string|null; photos:string[]; scoped?:boolean; address?:string|null};
export const reserved = new Set('en sk de es fr pl zh-hans admin api app g u t gym gyms health login logout signup support privacy terms pricing blog sitemap robots assets checkout trainers trainer profile-image profile-sitemap _next manifest competition guides zacat delete-account'.split(' '));
export function validSlug(slug:string) {return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length<=100;}
export function entityPath(kind:EntityKind,slug:string,locale:GymLocale='sk',scoped=false) {
 const root=kind==='gym'?`/gym/${slug}`:kind==='trainer'?`/t/${slug}`:(scoped||reserved.has(slug))?`/u/${slug}`:`/${slug}`;
 return locale==='sk' && kind!=='gym'?root:`${root}/${locale}`;
}
export const profileLocales=GYM_LOCALES;
export function safePhoto(value:string|null) {
 if (!value) return null;
 try {const url=new URL(value); const backend=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  return url.protocol==='https:' && !url.username && !url.password && url.origin===backend.origin && url.pathname.startsWith('/storage/v1/object/public/') ? url.href:null;
 } catch {return null;}
}
