import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {pageMetadata} from '@/lib/seo';
import PartnerInteractive from './partner-interactive';
import './partners.css';

export async function generateMetadata({params}: {params: Promise<{locale:string}>}): Promise<Metadata> {
  const {locale}=await params;
  if(!['sk','en'].includes(locale)) return {};
  return pageMetadata({locale,path:'partners',title:locale==='sk'?'Staňte sa národným partnerom Fitliner':'Become a Fitliner Country Partner',description:locale==='sk'?'Budujte sieť fitness centier vo svojej krajine a získajte podiel z výnosov Fitliner.':'Build the Fitliner gym network in your country and participate in its revenue.'});
}
export default async function Partners({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params; if(!['sk','en'].includes(locale)) notFound();
  const sk=locale==='sk';
  return <main className="partner-page">
    <nav className="partner-nav partner-container"><Link className="partner-logo" href={`/${locale}`}>FITLINER<span>®</span></Link><div><Link href="/sk/partners" aria-current={sk?'page':undefined}>SK</Link><Link href="/en/partners" aria-current={!sk?'page':undefined}>EN</Link></div></nav>
    <header className="partner-hero partner-container"><p className="partner-kicker">FITLINER COUNTRY PARTNER PROGRAM</p><h1>{sk?'Vaša krajina.':'Your country.'}<em>{sk?' Váš trh.':' Your market.'}</em></h1><p>{sk?'Hľadáme podnikavých partnerov, ktorí vybudujú sieť Fitliner vo svojej krajine. My dodáme technológiu a platformu. Vy povediete lokálny rast.':'We are looking for ambitious partners to grow Fitliner in their countries. We provide the technology and platform; you drive local growth.'}</p><a className="partner-cta" href="#apply">{sk?'Prihlásiť sa do programu':'Apply to the program'} ↗</a><div className="partner-stats"><span><strong>90</strong>{sk?' dní kvalifikácie':' qualification days'}</span><span><strong>10</strong>{sk?' aktivovaných fitiek':' activated gyms'}</span><span><strong>12</strong>{sk?' mesiacov možnej exkluzivity':' months potential exclusivity'}</span></div></header>
    <section className="partner-container partner-section"><p className="partner-kicker">01 / {sk?'CESTA K PARTNERSTVU':'PARTNERSHIP PATH'}</p><h2>{sk?'Ako získate výhradné zastúpenie':'How to qualify for exclusivity'}</h2><div className="partner-steps">{(sk?['Podajte prihlášku a uzavrite zmluvu','Do 90 dní aktivujte 10 platiacich fitness centier','Po overení výsledkov môžete získať exkluzivitu na 12 mesiacov','Exkluzivita sa obnovuje pri splnení ročného cieľa krajiny']:['Apply and sign a partner agreement','Activate 10 paying gyms in 90 days','Upon verification, you may earn 12 months of exclusivity','Renew exclusivity by meeting your country’s annual target']).map((step,i)=><div key={step}><small>0{i+1}</small><p>{step}</p></div>)}</div></section>
    <PartnerInteractive locale={locale as 'sk'|'en'}/>
    <section className="partner-container partner-section partner-two"><div><p className="partner-kicker">03 / FITLINER</p><h2>{sk?'Čo zabezpečíme my':'What we provide'}</h2><p>{sk?'Produkt, technológiu, aktualizácie, centrálny platobný systém a rozvoj platformy.':'Product, technology, updates, central payment infrastructure and platform development.'}</p></div><div><p className="partner-kicker">04 / {sk?'PARTNER':'PARTNER'}</p><h2>{sk?'Čo zabezpečíte vy':'What you provide'}</h2><p>{sk?'Marketing, predaj a získavanie fitness centier v dohodnutej krajine. Rozsah lokálnej podpory určí zmluva.':'Marketing, sales and gym acquisition in the agreed country. Local support responsibilities are set by contract.'}</p></div></section>
    <footer className="partner-container partner-footer">FITLINER · {sk?'Podmienky podliehajú individuálnej zmluve.':'Terms subject to individual agreement.'}</footer>
  </main>;
}
