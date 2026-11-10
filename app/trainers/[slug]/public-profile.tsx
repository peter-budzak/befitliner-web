import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cache } from 'react';
import JsonLd from '@/components/seo/json-ld';
import {SITE_URL} from '@/lib/seo';
import ServiceCard from './service-card';
import {trainerCopy,trainerAlternates,trainerLocales,trainerPath,serviceText,type TrainerLocale,type PublicOffer,type PublicSlot} from '../trainer-locale';
import './profile.css';

const trainer = cache(async (slug: string) => {
  if (process.env.TRAINER_STOREFRONT_ENABLED !== 'true' || !/^[a-z][a-z0-9-]{2,63}$/.test(slug)) notFound();
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/trainer-commerce`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' },
    body: JSON.stringify({ action: 'public', slug }), cache: 'no-store',
  });
  if (response.status === 404) {
    const calendar = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/trainer_public_calendar`, {
      method: 'POST', headers: {'Content-Type':'application/json', apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''},
      body: JSON.stringify({p_slug:slug}), cache:'no-store',
    });
    if (!calendar.ok) throw new Error('Calendar temporarily unavailable');
    const data = await calendar.json();
    if (!data) notFound();
    return data;
  }
  if (!response.ok) throw new Error('Trainer page temporarily unavailable');
  return response.json();
});

type Profile = {slug:string;display_name:string;owner_id:string;photo_url?:string;bio?:string};
type PublicData = {profile:Profile;offers:PublicOffer[];calendar_slots?:Record<string,PublicSlot[]>};
const getData = (slug:string):Promise<PublicData> => trainer(slug);
const origin=SITE_URL;
function description(data:PublicData,locale:TrainerLocale){
  const names=data.offers.slice(0,3).map(o=>serviceText(o.name,locale)).join(' · ');
  return [data.profile.display_name,trainerCopy(locale).seo,names].filter(Boolean).join(' — ');
}
export async function profileMetadata(slug:string, locale:TrainerLocale):Promise<Metadata> {
  const data=await getData(slug);
  const title=[data.profile.display_name,trainerCopy(locale).services,'Fitliner'].join(' | ');
  const desc=description(data,locale);
  const url=origin+trainerPath(slug,locale);
  const images=data.profile.photo_url?.startsWith('https://')?[{url:data.profile.photo_url,alt:data.profile.display_name}]:[];
  const ogLocales={sk:'sk_SK',en:'en_US',de:'de_DE',es:'es_ES',fr:'fr_FR','zh-Hans':'zh_CN',pl:'pl_PL',hu:'hu_HU',ro:'ro_RO',sl:'sl_SI',hr:'hr_HR',bg:'bg_BG',el:'el_GR',it:'it_IT'};
  return {title:{absolute:title},description:desc,alternates:{canonical:url,languages:trainerAlternates(slug,origin)},
    openGraph:{type:'profile',siteName:'Fitliner',locale:ogLocales[locale],alternateLocale:trainerLocales.filter(l=>l!==locale).map(l=>ogLocales[l]),title,description:desc,url,images},
    twitter:{card:'summary',title,description:desc,images:images.map(i=>i.url)}};
}
async function publicSlots(offer:PublicOffer):Promise<PublicSlot[]|null>{
  if(!['personal','group'].includes(offer.booking_kind??''))return [];
  try{
    const r=await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/trainer-commerce`,{method:'POST',headers:{'Content-Type':'application/json',apikey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY??''},body:JSON.stringify({action:'slots',offer_id:offer.id}),cache:'no-store'});
    if(!r.ok)return null;
    const body=await r.json();
    return Array.isArray(body.slots)?body.slots:null;
  }catch{return null;}
}
export async function PublicProfile({slug,locale}:{slug:string;locale:TrainerLocale}){
  const {profile,offers,calendar_slots}=await getData(slug);
  const slots=calendar_slots ?? Object.fromEntries(await Promise.all(offers.map(async o=>[o.id,await publicSlots(o)] as const)));
  const t=trainerCopy(locale);
  const url=origin+trainerPath(slug,locale);
  const scheduled=offers.filter(o=>o.booking_kind==='personal'||o.booking_kind==='group');
  const noneAvailable=scheduled.length>0 && scheduled.every(o=>Array.isArray(slots[o.id]) && !slots[o.id]?.some((s:PublicSlot)=>s.remaining>0));
  const appProfile=`${process.env.TRAINER_APP_RETURN_URL==='befitliner-staging://'?'befitliner-staging':'befitliner'}://profile/${profile.owner_id}`;
  const person=origin+trainerPath(slug,'sk')+'#trainer';
  const entities=[
    {'@type':'ProfilePage','@id':url+'#profile',url,inLanguage:locale,name:profile.display_name,mainEntity:{'@id':person},isPartOf:{'@id':origin+'/#website'}},
    {'@type':'Person','@id':person,name:profile.display_name,description:profile.bio||undefined,image:profile.photo_url||undefined,url:origin+trainerPath(slug,'sk')},
    ...offers.map(o=>({'@type':'Service',name:serviceText(o.name,locale),description:serviceText(o.description,locale)||undefined,provider:{'@id':person},offers:{'@type':'Offer',price:(o.price_minor/100).toFixed(2),priceCurrency:o.currency,url}}))
  ];
  return <main className="trainer-public" lang={locale}>
    <JsonLd data={{'@context':'https://schema.org','@graph':entities}}/>
    <nav className="trainer-nav"><a className="wordmark" href={['sk','en','de','es','fr','zh-Hans'].includes(locale)?'/'+locale:'/en'}>FITLINER</a>
    <details className="language-menu"><summary>{t.name} ▾</summary><nav aria-label={t.language}>{trainerLocales.map(l=><a key={l} href={trainerPath(slug,l)} lang={l} hrefLang={l} aria-current={l===locale?'page':undefined}>{trainerCopy(l).name}</a>)}</nav></details></nav>
    <header className="trainer-hero">
      {profile.photo_url?.startsWith('https://') && <Image priority unoptimized src={profile.photo_url} width="84" height="84" alt={profile.display_name}/>}
      <div><span>{t.role}</span><h1>{profile.display_name}</h1></div>
    </header>
    {profile.bio?.trim() && <p className="trainer-bio">{profile.bio}</p>}
    {!calendar_slots && <a className="open-profile" href={appProfile}>{t.app} ↗</a>}
    <section className="trainer-services"><h2>{t.services}</h2>
      {calendar_slots && <aside className="booking-status"><p>{t.preview}</p>
        <a href={appProfile}>{t.contact} ↗</a></aside>}
      {(!offers.length || noneAvailable) && <div className="availability-summary"><p>{t.empty}</p>{!calendar_slots && <a className="open-profile" href={appProfile}>{t.contact} ↗</a>}</div>}
      {offers.map(o=><ServiceCard key={o.id} appProfile={appProfile} offer={o} showEmpty={!noneAvailable} slots={slots[o.id]??null} locale={locale} checkout={!calendar_slots} slug={slug}/>)}
    </section>
    <footer><Link href="/trainers/account">{t.account}</Link></footer>
  </main>;
}
