'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import handoffCopy from '../handoff-copy.json';
import {supabase} from '@/lib/supabase';
import {trainerCopy,serviceText,type TrainerLocale,type PublicSlot,type PublicOffer} from '../trainer-locale';

function dayLabel(item:PublicSlot,locale:TrainerLocale){
  return new Intl.DateTimeFormat(locale,{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:item.timezone}).format(new Date(item.starts_at));
}

export default function ServiceCard({offer,slots,locale,checkout,slug,showEmpty,appProfile}:{appProfile:string;showEmpty:boolean;offer:PublicOffer;slots:PublicSlot[]|null;locale:TrainerLocale;checkout:boolean;slug:string}) {
  const t=trainerCopy(locale);
  const [selected,setSelected]=useState('');
  const [day,setDay]=useState('');
  const [busy,setBusy]=useState(false);
  const [login,setLogin]=useState(false);
  const [message,setMessage]=useState('');
  const [email,setEmail]=useState('');
  const inFlight=useRef(false);
  const retries=useRef(new Map<string,string>());
  const slot=slots?.find(s=>s.id===selected && s.remaining>0);
  const scheduled=offer.booking_kind==='personal' || offer.booking_kind==='group';
  useEffect(()=>{
    setSelected('');setLogin(false);setMessage('');
    const intent=new URLSearchParams(window.location.hash.slice(1));
    if(!checkout || intent.get('offer')!==offer.id)return;
    const saved=slots?.find(s=>s.id===intent.get('slot') && s.remaining>0);
    if(saved){
      setDay(dayLabel(saved,locale));setSelected(saved.id);
    }
    document.getElementById('service-'+offer.id)?.scrollIntoView({block:'start'});
  },[slots,offer.id,locale,checkout]);
  async function run(task:()=>Promise<void>){
    if(inFlight.current)return;
    inFlight.current=true;setBusy(true);setMessage('');
    try{await task();}catch{setMessage(t.error);}finally{inFlight.current=false;setBusy(false);}
  }
  async function pay(){
    if(!checkout || (scheduled && !slot))return;
    const {data:{session}}=await supabase.auth.getSession();
    if(!session){setLogin(true);return;}

    const key=[session.user.id,offer.id,slot?.id].join('/');
    const requestId=retries.current.get(key) ?? crypto.randomUUID();
    retries.current.set(key,requestId);
    const {data,error}=await supabase.functions.invoke('trainer-commerce',{body:{action:'checkout',offer_id:offer.id,request_id:requestId,...(slot?{slot_id:slot.id}:{})}});
    if(error || !data?.url || (await supabase.auth.getSession()).data.session?.user.id!==session.user.id)throw Error();
    const url=new URL(data.url);
    if(url.protocol!=='https:' || !(url.hostname==='stripe.com'||url.hostname.endsWith('.stripe.com')))throw Error();
    window.location.assign(url.href);
  }
  const date=(s:PublicSlot)=>new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short',timeZone:s.timezone}).format(new Date(s.starts_at));
  const price=new Intl.NumberFormat(locale,{style:'currency',currency:offer.currency||'EUR'}).format(offer.price_minor/100);
  const free=slots?.filter(s=>s.remaining>0);
  const schedule=useMemo(()=>{
    const days=new Map<string,PublicSlot[]>();
    for(const item of slots ?? []){
      if(item.remaining<=0)continue;
      const key=dayLabel(item,locale);
      const entries=days.get(key) ?? [];
      entries.push(item);
      days.set(key,entries);
    }
    return days;
  },[slots,locale]);
  const activeDay=schedule.has(day)?day:schedule.keys().next().value;
  const groups=new Map<string,PublicSlot[]>();
  for(const item of activeDay?schedule.get(activeDay)??[]:[]){
    const key=JSON.stringify([item.location,item.timezone,Math.round((Date.parse(item.ends_at)-Date.parse(item.starts_at))/60000)]);
    const entries=groups.get(key)??[];
    entries.push(item);
    groups.set(key,entries);
  }
  function selectDay(value:string){
    setDay(value);setSelected('');setLogin(false);setMessage('');
  }
  function time(item:PublicSlot){
    return new Intl.DateTimeFormat(locale,{hour:'2-digit',minute:'2-digit',timeZone:item.timezone}).format(new Date(item.starts_at));
  }
  return <article id={'service-'+offer.id} className="service-card">
    <div className="service-line"><h3>{serviceText(offer.name,locale)}</h3><strong>{price}{offer.interval==='month' && <small> / {t.month}</small>}</strong></div>
    {offer.description && <p>{serviceText(offer.description,locale)}</p>}
    {offer.interval==='month' && <p>{t.renewal}</p>}
    {scheduled && (!slots ? <p>{t.unavailable}</p> : !free?.length ? (showEmpty && <div className="service-status"><p>{t.empty}</p><a className="open-profile" href={appProfile}>{t.contact} ↗</a></div>) :
      <section className="schedule-panel" aria-label={t.dates}>
        {schedule.size>1 && <label>{t.dates}<select value={activeDay} disabled={busy} onChange={e=>selectDay(e.target.value)}>
          {Array.from(schedule.keys(),key=><option key={key} value={key}>{key}</option>)}
        </select></label>}
        {schedule.size===1 && <h4>{activeDay}</h4>}
        {Array.from(groups,([key,items])=><div key={key} className="slot-group">
          <p className="slot-place">{items[0].location}</p>
          <small>{Math.round((Date.parse(items[0].ends_at)-Date.parse(items[0].starts_at))/60000)} min · {items[0].timezone}</small>
          <div className="slot-times">{items.map(item=>checkout
            ? <button type="button" key={item.id} disabled={busy} aria-pressed={selected===item.id}
                onClick={()=>{setSelected(item.id);setLogin(false);setMessage('');}}>{time(item)}</button>
            : <time key={item.id} dateTime={item.starts_at}>{time(item)}</time>)}</div>
        </div>)}
      </section>)}
    {checkout && slot && <div className="booking-review" aria-live="polite">
      <strong>{date(slot)} · {price}</strong><p>{t.remaining}: {slot.remaining}</p>
      <details><summary>{t.terms}</summary><p>{t.change.replace('{n}',String(slot.cancellation_hours))} {t.refund}</p></details>
    </div>}
    {checkout && !login && (!scheduled || !!free?.length) && <button className="book-action" disabled={busy || (scheduled && !slot)} onClick={()=>void run(pay)}>
      {scheduled ? (slot ? t.bookPay+' · '+price : t.choose) : t.buy+' · '+price}
    </button>}
    {checkout && scheduled && slots===null && <button className="refresh" disabled={busy} onClick={()=>{setBusy(true);window.location.reload();}}>{t.refresh}</button>}
    {login && <form onSubmit={e=>{e.preventDefault();void run(async()=>{
      try {localStorage.setItem('fitliner.trainer.return',slug);}catch{}
      const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+'/trainers/account'}});
      if(error)throw error;
      try {
        localStorage.setItem('fitliner.booking.resume',JSON.stringify({slug,locale,offer:offer.id,slot:slot?.id??'',email:email.trim().toLowerCase(),until:Date.now()+30*60*1000}));
      } catch { /* Email sign-in also works without storage. */ }
      setMessage(t.sent);
    });}}><label>{handoffCopy[locale].emailTitle}<input type="email" autoComplete="email" placeholder={handoffCopy[locale].emailPlaceholder} aria-describedby={`account-hint-${offer.id}`} value={email} required onChange={e=>setEmail(e.target.value)}/></label><p id={`account-hint-${offer.id}`} className="account-hint">{handoffCopy[locale].accountHint}</p><button disabled={busy}>{handoffCopy[locale].verifyContinue}</button></form>}
    {message && <p role="status">{message}</p>}
  </article>;
}
