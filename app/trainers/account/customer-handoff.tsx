'use client';
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {supabase} from '@/lib/supabase';
import copy from '../handoff-copy.json';
import './handoff.css';

function track(action:string,platform:string) {
  try {
    if(localStorage.getItem('fitliner_marketing_tracking_consent')==='accepted') {
      (window as Window & {fbq?:(...args:unknown[])=>void}).fbq?.('trackCustom','customer_app_handoff',{action,platform});
    }
  } catch { /* Tracking never blocks access to a paid booking. */ }
}

type Locale=keyof typeof copy;
type Booking={id:string;state:string;slot_snapshot:{starts_at:string;ends_at:string;timezone:string;location:string}};
type Purchase={id:string;offer_snapshot:{name:string;price_minor:number;currency:string};trainer_commerce_invoices:{amount_paid:number}[]};
const validId=(id:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export default function CustomerHandoff({orderId,initialLocale}:{orderId:string;initialLocale:string}) {
  const [locale,setLocale]=useState<Locale>(Object.hasOwn(copy,initialLocale)?initialLocale as Locale:'en');
  const t=copy[locale];
  const languageChosen=useRef(false);
  const [identity,setIdentity]=useState<{id:string;email:string}|null>(null);
  const [ready,setReady]=useState(false);
  const [email,setEmail]=useState('');
  const [sent,setSent]=useState(false);
  const [busy,setBusy]=useState(false);
  const [failed,setFailed]=useState(false);
  const [result,setResult]=useState<{order:Purchase;booking:Booking|null}|null>(null);
  const [attempt,setAttempt]=useState(0);
  const currentUser=useRef<string|null>(null);
  useEffect(()=>{
    let active=true;
    function update(user:{id:string;email?:string}|undefined) {
      if(!active)return;
      if(currentUser.current!==user?.id){setResult(null);setFailed(false);}
      currentUser.current=user?.id??null;
      setIdentity(user?{id:user.id,email:user.email??''}:null);setReady(true);
    }
    void supabase.auth.getSession().then(({data})=>update(data.session?.user));
    const {data}=supabase.auth.onAuthStateChange((_event,session)=>update(session?.user));
    return()=>{active=false;data.subscription.unsubscribe();};
  },[]);
  useEffect(()=>{
    if(!identity || Object.hasOwn(copy,initialLocale))return;
    let active=true;
    const uid=identity.id;
    // An explicit checkout language wins; profile is only a fallback.
    void supabase.from('profiles').select('language').eq('id',uid).maybeSingle().then(({data})=>{
      if(active && !languageChosen.current && currentUser.current===uid && data?.language && Object.hasOwn(copy,data.language))setLocale(data.language as Locale);
    });
    return()=>{active=false;};
  },[identity?.id,initialLocale]);
  useEffect(()=>{
    if(!identity)return;
    let active=true;
    let timer:ReturnType<typeof setTimeout>|undefined;
    const uid=identity.id;
    setResult(null);setFailed(false);
    async function check(round:number) {
      try {
        if(!validId(orderId))throw Error();
        const [documents,bookings]=await Promise.all([
          supabase.functions.invoke('trainer-commerce',{body:{action:'documents',order_id:orderId}}),
          supabase.functions.invoke('trainer-commerce',{body:{action:'bookings',order_id:orderId}}),
        ]);
        if(!active || currentUser.current!==uid)return;
        if(documents.error || bookings.error || documents.data?.error || bookings.data?.error)throw Error();
        const order=documents.data?.orders?.find((o:Purchase)=>o.id===orderId) as Purchase|undefined;
        if(!order)throw Error();
        const booking=(bookings.data?.bookings??[])[0] as Booking|undefined;
        // A redirect or session ID is never proof of payment. These are owned,
        // server-settled records; cancelled/expired bookings cannot show success.
        if(order.trainer_commerce_invoices?.length && (!booking || booking.state==='confirmed')) {
          setResult({order,booking:booking??null});return;
        }
        if(booking && ['cancelled','expired','needs_attention'].includes(booking.state))throw Error();
        if(round<11)timer=setTimeout(()=>void check(round+1),3000);
        else setFailed(true);
      } catch {if(active && currentUser.current===uid)setFailed(true);}
    }
    void check(0);
    return()=>{active=false;if(timer)clearTimeout(timer);};
  },[identity?.id,orderId,attempt]);
  async function login(event:React.FormEvent) {
    event.preventDefault();if(busy)return;
    setBusy(true);setFailed(false);
    try {
      try { localStorage.setItem('fitliner.purchase.resume',JSON.stringify({order:orderId,locale,email:email.trim().toLowerCase(),until:Date.now()+30*60*1000})); } catch {}
      const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:new URL('/trainers/account',location.origin).href,shouldCreateUser:false}});
      if(error)throw error;
      setSent(true);
    } catch {setFailed(true);} finally{setBusy(false);}
  }
  const slot=result?.booking?.slot_snapshot;
  return <main className="customer-handoff" lang={locale}>
    <header><a href={`/${locale}`}>FITLINER</a><select aria-label="Language" value={locale} onChange={e=>{languageChosen.current=true;setLocale(e.target.value as Locale);}}>{Object.keys(copy).map(lang=><option key={lang} value={lang}>{new Intl.DisplayNames([lang],{type:'language'}).of(lang)}</option>)}</select></header>
    {!ready?<p role="status">{t.pending}</p>:!identity?<section>
      <h1>{t.sameEmail}</h1><p>{t.error}</p>
      <form onSubmit={login}><label htmlFor="handoff-email">E-mail</label><input id="handoff-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/><button disabled={busy}>{t.verify}</button></form>
      {sent&&<p role="status">{t.sent}</p>}{failed&&<p role="alert">{t.error}</p>}
    </section>:!result?<section aria-live="polite"><h1>{failed?t.error:t.pending}</h1><p>{t.pendingHint}</p>{failed&&<button onClick={()=>setAttempt(n=>n+1)}>{t.retry}</button>}<p><a href="/trainers/account">{t.web}</a></p><button className="secondary" onClick={()=>void supabase.auth.signOut()}>{t.signout}</button></section>:<>
      <section className="booking-confirmed"><span className="confirmation-mark" aria-hidden="true">✓</span><h1>{result.booking?t.confirmed:t.purchase}</h1><h2>{result.order.offer_snapshot.name}</h2>
        {slot&&<><p>{new Intl.DateTimeFormat(locale,{dateStyle:'full',timeStyle:'short',timeZone:slot.timezone}).format(new Date(slot.starts_at))}</p><p>{slot.location}</p><small>{slot.timezone}</small></>}
        <p className="purchase-price">{new Intl.NumberFormat(locale,{style:'currency',currency:result.order.offer_snapshot.currency||'EUR'}).format(result.order.offer_snapshot.price_minor/100)}</p>
      </section>
      <section className="app-invitation"><h2>{t.title}</h2><p>{t.intro}</p><div className="download-links"><a onClick={()=>track("download_click","ios")} href="https://apps.apple.com/app/id6760855966"><Image src="/badge/appstore.png" alt="" width={36} height={40} loading="eager" unoptimized/><span><small>{t.download}</small><strong>App Store</strong></span></a><a onClick={()=>track("download_click","android")} href="https://play.google.com/store/apps/details?id=com.fitliner.app"><Image src="/badge/googleplay.png" alt="" width={36} height={40} loading="eager" unoptimized/><span><small>{t.download}</small><strong>Google Play</strong></span></a></div>
        <p><a className="open-app" onClick={()=>track("open_click","app")} href={`befitliner://bookings/${encodeURIComponent(orderId)}`}>{t.open} ↗</a></p>
        <p className="same-account">{t.sameEmail}<br/><strong>{identity.email}</strong></p>
        <h3>{t.benefits}</h3><ul className="benefit-grid">{[
          [t.bookingLabel,t.bookingBenefit,'M4 6h16v14H4z M8 3v6 M16 3v6 M4 11h16'],
          [t.planLabel,t.planBenefit,'M5 4h14v17H5z M8 8h8 M8 12h8 M8 16h5'],
          [t.progressLabel,t.progressBenefit,'M4 4v16h17 M7 15l4-5 4 2 5-7'],
          [t.gymLabel,t.gymBenefit,'M4 5h16v12H9l-5 4z M8 9h8 M8 13h5'],
        ].map(([label,description,path])=><li key={label}><span className="benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={path}/></svg></span><div><h4>{label}</h4><p>{description}</p></div></li>)}</ul><small className="free-note">{t.freeNote}</small>
      </section><p><a href="/trainers/account">{t.web} →</a></p>
    </>}
  </main>;
}
