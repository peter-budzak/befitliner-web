'use client';
import {postCopy,type PublicPost} from '@/lib/public-profiles/posts';
import {useRef,useState} from 'react';
import {entityPath,type PublicEntity} from '@/lib/public-profiles/model';
import {profileCopy} from '@/lib/public-profiles/copy';
import type {GymLocale} from '@/lib/seo';
export default function ProfileActions({entity,posts,locale,enabled,embedded}:{entity:PublicEntity;posts:PublicPost[];locale:GymLocale;enabled:boolean;embedded:boolean}){
 const c=profileCopy(locale);const dialog=useRef<HTMLDialogElement>(null);const [opened,setOpened]=useState(false);
 const [shareStatus,setShareStatus]=useState('');
 const shareLabels:Record<GymLocale,readonly [string,string,string]>={
  sk:['Zdieľať profil','Odkaz skopírovaný','Skopíruj odkaz'],
  en:['Share profile','Link copied','Copy link'],
  de:['Profil teilen','Link kopiert','Link kopieren'],
  es:['Compartir perfil','Enlace copiado','Copiar enlace'],
  fr:['Partager le profil','Lien copié','Copier le lien'],
  pl:['Udostępnij profil','Link skopiowany','Kopiuj link'],
  'zh-Hans':['分享资料','链接已复制','复制链接']
 };
 const shareText=shareLabels[locale];
 const pc=postCopy[locale];
 const shareUrl=`https://www.befitliner.com${entityPath(entity.kind,entity.slug,locale,entity.scoped)}`;
 async function share(){
  setShareStatus('');
  try {
   if(navigator.share){await navigator.share({title:entity.name,url:shareUrl});return;}
   await navigator.clipboard.writeText(shareUrl);setShareStatus(shareText[1]);
  }catch(error){
   if(error instanceof DOMException&&error.name==='AbortError')return;
   setShareStatus(shareText[2]);
  }
 }
 function open(){setOpened(true);dialog.current?.showModal();}
 return <>
  <div className="pp-tabs"><button className="selected" onClick={open}>{c.about}</button><button onClick={open}>{c.progress}</button><button onClick={open}>{c.nutrition}</button></div>
  <section className="pp-identity">
   <div className="pp-gallery">
    {(entity.photos.length?entity.photos:entity.photo?[entity.photo]:[null]).map((photo,i)=><button key={i} className="pp-photo" onClick={open} aria-label={`${entity.name} — ${c.login}`}>
     {photo ? <img src={photo} alt={entity.name} referrerPolicy="no-referrer"/>:<span aria-hidden="true">{entity.name.slice(0,1).toUpperCase()}</span>}
    </button>)}
   </div>
   <div className="pp-kind">{c[entity.kind]}</div><h1>{entity.name}</h1><p className="pp-handle">@{entity.slug}</p>
   <button className="pp-primary" onClick={open}>{entity.kind==='user'||entity.kind==='trainer'?c.message:c.open} <span aria-hidden="true">↗</span></button>
   <button className="pp-primary pp-share" onClick={share}>{shareText[0]} <span aria-hidden="true">↗</span></button>
   <p className="pp-share-status" role="status">{shareStatus}</p>
   {shareStatus===shareText[2]&&<input className="pp-share-link" aria-label={shareText[2]} readOnly value={shareUrl} onFocus={e=>e.target.select()}/>}
  </section>
  {entity.bio&&<section className="pp-section"><h2>{c.about}</h2><p dir="auto">{entity.bio}</p></section>}
  {entity.address&&<section className="pp-section"><button onClick={open}>⌖ {entity.address}</button></section>}
  {entity.kind!=='gym'&&<section className="pp-posts" aria-labelledby="profile-posts-title">
   <h2 id="profile-posts-title">{pc[0]}</h2>
   {posts.length===0?<p>{pc[1]}</p>:posts.map(post=><article className="pp-section pp-post" key={post.id}>
    <header><strong>{entity.name}</strong><time dateTime={post.createdAt}>{new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeZone:'UTC'}).format(new Date(post.createdAt))}</time></header>
    <button className="pp-post-image" onClick={open} aria-label={`${pc[2]} — ${c.login}`}><img src={post.image} alt={`${pc[2]} · ${entity.name}`} loading="lazy" decoding="async"/></button>
    <div className="pp-post-actions"><button onClick={open} aria-label={`${pc[3]}: ${post.likes}`}>♡ {post.likes} <span>{pc[3]}</span></button><button onClick={open} aria-label={`${pc[4]}: ${post.comments}`}><svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0Z"/></svg> {post.comments} <span>{pc[4]}</span></button></div>
   </article>)}
  </section>}
  <dialog aria-labelledby="profile-login-title" ref={dialog} className="pp-dialog" onClick={e=>{if(e.target===dialog.current)dialog.current.close();}}>
   <div className="pp-dialog-head"><h2 id="profile-login-title">{c.continue}</h2><button onClick={()=>dialog.current?.close()} aria-label={c.close}>×</button></div>
   <p>{enabled?c.explain:c.unavailable}</p>
   {/* /login is an HTTP redirect handler; use a full navigation for authentication. */}
   {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
   {enabled&&!embedded&&<a className="pp-primary" href="/login">{c.login}</a>}
   {enabled&&embedded&&opened&&<iframe title={c.login} src="/app/index.html" className="pp-login-frame"/>}
  </dialog>
 </>;
}
