import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/json-ld';
import {getPublicEntity,getPublicPosts} from '@/lib/public-profiles/data';
import {entityPath,profileLocales,type EntityKind} from '@/lib/public-profiles/model';
import {profileCopy} from '@/lib/public-profiles/copy';
import {isGymLocale,SITE_URL,OPEN_GRAPH_LOCALES} from '@/lib/seo';
import {webAppEnabled} from '@/lib/web-app';
import ProfileActions from './actions';
import './profiles.css';
export async function publicMetadata(kind:EntityKind,slug:string,language:string):Promise<Metadata>{
 if(!isGymLocale(language))return {robots:{index:false,follow:false}};
 const p=await getPublicEntity(kind,slug);if(!p)return {robots:{index:false,follow:false}};
 const c=profileCopy(language);const title=`${p.name} — ${c[kind]}`;
 const description=(p.bio||`${c.description}: ${p.name}${p.address?` · ${p.address}`:''}.`).slice(0,180);
 const url=SITE_URL+entityPath(kind,p.slug,language,p.scoped);
 const image=`${SITE_URL}/profile-image/${kind}/${p.slug}/${language}`;
 return {title,description,alternates:{canonical:url,languages:Object.fromEntries([...profileLocales.map(l=>[l,SITE_URL+entityPath(kind,p.slug,l,p.scoped)]),['x-default',SITE_URL+entityPath(kind,p.slug,'sk',p.scoped)]])},
 robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large'}},
 openGraph:{type:kind==='gym'?'website':'profile',title,description,url,siteName:'Fitliner',locale:OPEN_GRAPH_LOCALES[language],images:[{url:image,width:1200,height:630,alt:title}]},
 twitter:{card:'summary_large_image',title,description,images:[image]}};
}
export default async function PublicProfilePage({kind,slug,language}:{kind:EntityKind;slug:string;language:string}){
 if(!isGymLocale(language))notFound();
 const p=await getPublicEntity(kind,slug);if(!p)notFound();
 const c=profileCopy(language);const url=SITE_URL+entityPath(kind,p.slug,language,p.scoped);
 const subject={'@type':kind==='gym'?'ExerciseGym':'Person','@id':url+'#entity',name:p.name,url,identifier:p.slug,...(p.bio?{description:p.bio}:{}),...(p.photo?{image:p.photo}:{}),...(p.address?{address:p.address}:{}),...(kind==='trainer'?{jobTitle:c.trainer}:{})};
 return <main className="pp" lang={language}>
  <JsonLd data={{'@context':'https://schema.org','@type':'ProfilePage','@id':url,url,inLanguage:language,name:`${p.name} — ${c[kind]}`,mainEntity:subject}}/>
  <header className="pp-header"><Link href={`/${language}`}>FITLINER<span>™</span></Link><span>{c[kind]}</span></header>
  <ProfileActions entity={p} posts={await getPublicPosts(kind,slug)} locale={language} enabled={webAppEnabled()} embedded={process.env.FITLINER_EMBEDDED_LOGIN_ENABLED==='true'}/>
  <footer className="pp-footer"><nav aria-label="Language">{profileLocales.map(l=><Link key={l} href={entityPath(kind,p.slug,l,p.scoped)} hrefLang={l} aria-current={l===language?'page':undefined}>{l==='zh-Hans'?'中文':l.toUpperCase()}</Link>)}</nav><p>{c.description} · Fitliner</p></footer>
 </main>;
}
