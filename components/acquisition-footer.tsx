import Link from 'next/link';
import {joinCopy} from '@/lib/trainer-join-copy';

type Props = {
  locale: string;
  labels: {links_title:string;privacy:string;terms:string;for_gyms:string;app_title:string;download_ios:string;download_android:string;rights:string};
  supportLabel: string;
  iosUrl: string;
  androidUrl: string;
  androidComingSoon: boolean;
  androidSoonLabel: string;
};
const copy:Record<string,[string,string,string]> = {
  sk:['Tréning, ľudia a fitká. Na jednom mieste.','Zdravotná karta','Návody'],
  en:['Training, people and gyms. All in one place.','Health Card','Guides'],
  de:['Training, Menschen und Studios. Alles an einem Ort.','Gesundheitskarte','Ratgeber'],
  es:['Entrenamiento, personas y gimnasios. Todo en un lugar.','Tarjeta de Salud','Guías'],
  fr:['Entraînement, communauté et salles. Au même endroit.','Carte Santé','Guides'],
  'zh-Hans':['训练、伙伴与健身房，尽在一处。','健康档案','指南'],
};
export default function AcquisitionFooter({locale,labels,supportLabel,iosUrl,androidUrl,androidComingSoon,androidSoonLabel}:Props){
 const [claim,health,guides]=copy[locale]??copy.en;
 const audiences=joinCopy(locale);
 const linkStyle='w-fit rounded-sm py-1 text-sm leading-6 text-white/60 transition-colors hover:text-[#c5b2ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b69aff]';
 return <footer className="mt-8 border-t border-white/10 pt-12 pb-4 sm:mt-12 sm:pt-14">
  <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
   <div>
    <Link href={`/${locale}`} aria-label="Fitliner" className="inline-flex items-start rounded-sm font-extrabold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b69aff]">
     <span className="text-xl tracking-[.3em]">FITLINER</span><span className="ml-1 mt-1 text-[8px] text-white/45">TM</span>
    </Link>
    <p className="mt-4 max-w-xs text-sm leading-7 text-white/50">{claim}</p>
    <div aria-hidden="true" className="mt-6 h-0.5 w-10 rounded-full bg-[#8b5cf6]"/>
   </div>
   <nav aria-label={labels.links_title}>
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-[.15em] text-white/80">{labels.links_title}</h2>
    <div className="flex flex-col gap-1">
     <Link className={linkStyle} href={`/${locale}/trainers`}>{audiences.trainer}</Link>
     <Link className={linkStyle} href={`/${locale}/gyms`}>{labels.for_gyms}</Link>
     <Link className={linkStyle} href={`/${locale}/health`}>{health}</Link>
     {(locale==='sk'||locale==='en')&&<Link className={linkStyle} href={`/${locale}/guides`}>{guides}</Link>}
    </div>
   </nav>
   <div className="sm:col-span-2 lg:col-span-1">
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-[.15em] text-white/80">{labels.app_title}</h2>
    <a href={iosUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-6 rounded-xl border border-white/15 bg-white/[.035] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#ac85ff]/60 hover:bg-[#7947ff]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b69aff]">{labels.download_ios}<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 19 19 5M6 5h13v13"/></svg></a>
    <div className="mt-3 text-xs leading-6 text-white/40">{androidComingSoon?androidSoonLabel:<a href={androidUrl} target="_blank" rel="noreferrer" className={linkStyle}>{labels.download_android}</a>}</div>
   </div>
  </div>
  <div className="mt-10 flex flex-col gap-5 border-t border-white/[.07] pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
   <p className="text-xs leading-6 text-white/40">© {new Date().getFullYear()} Fitliner. {labels.rights}</p>
   <div className="flex flex-wrap gap-x-6 gap-y-1">
    <Link className={linkStyle} href={`/${locale}/privacy`}>{labels.privacy}</Link>
    <Link className={linkStyle} href={`/${locale}/terms`}>{labels.terms}</Link>
    <Link className={linkStyle} href={`/${locale}/support`}>{supportLabel}</Link>
   </div>
  </div>
 </footer>;
}
