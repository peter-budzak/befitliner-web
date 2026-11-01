'use client';
import Link from 'next/link';
import BookingCalendar from './booking-calendar';
import './storefront.css';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Offer = { id: string; name: string; description: string; price_minor: number; interval: 'once' | 'month'; booking_kind?: 'none'|'personal'|'group' };
type Slot = { id: string; starts_at: string; ends_at: string; timezone: string; location: string; remaining: number; cancellation_hours: number };
type Booking = { id: string; order_id: string; state: string; slot_id: string; slot_snapshot: Slot & {offer_id: string} };
const slotTime = (slot: Slot) => `${new Intl.DateTimeFormat('sk-SK', { dateStyle: 'medium', timeStyle: 'short', timeZone: slot.timezone }).format(new Date(slot.starts_at))} · ${slot.timezone}`;
const bookingState = (state: string) => ({held:'Čaká na platbu',confirmed:'Potvrdená',cancelled:'Zrušená',expired:'Platba vypršala',needs_attention:'Kontaktujte trénera'}[state] ?? 'Spracúva sa');
type Order = { id: string; offer_snapshot: Offer; trainer_commerce_invoices: { id: string; number: string; amount_paid: number }[]; trainer_commerce_refunds?: {id:string;amount:number;status:string}[] };
const money = (value: number) => new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(value / 100);
export default function TrainerStorefront({ profile, offers, accountOnly=false, appScheme="befitliner" }: { profile: { slug: string; display_name: string; bio: string; owner_id?: string; photo_url?: string | null }; appScheme?: string; offers: Offer[]; accountOnly?:boolean }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [returnTrainer,setReturnTrainer]=useState<string|null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [slots, setSlots] = useState<Record<string,Slot[]>>({});
  const [selected, setSelected] = useState<Record<string,string>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [moving, setMoving] = useState<Booking|null>(null);
  const [moveSlot, setMoveSlot] = useState('');
  const requestIds = useRef<Record<string,string>>({});
  const authUser = useRef<string|null>(null);
  const inFlight = useRef(false);
  useEffect(() => {
    let active = true;
    try { const slug=window.localStorage.getItem('fitliner.trainer.return'); if(slug && /^[a-z][a-z0-9-]{2,63}$/.test(slug)) setReturnTrainer(slug); } catch { /* Private browser storage may be unavailable. */ }
    const sessionChanged = (userId: string|null) => {
      if (!active) return;
      setSignedIn(Boolean(userId));
      if(authUser.current!==userId) { setOrders([]); setBookings([]); setMoving(null); requestIds.current={}; authUser.current=userId; }
    };
    void supabase.auth.getSession().then(({ data }) => sessionChanged(data.session?.user.id ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => sessionChanged(session?.user.id ?? null));
    if (new URLSearchParams(window.location.search).get('payment') === 'complete') setMessage('Platbu overujeme. Potvrdenú faktúru nájdete v prehľade platieb a dostanete ju e-mailom.');
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    let active=true;
    const scheduled=offers.filter(o=>o.booking_kind && o.booking_kind!=='none');
    void Promise.all(scheduled.map(async offer=>{
      const {data,error}=await supabase.functions.invoke('trainer-commerce',{body:{action:'slots',offer_id:offer.id}});
      if(active && !error && data?.slots) setSlots(previous=>({...previous,[offer.id]:data.slots}));
      else if(active) setMessage('Dostupnosť sa nepodarilo načítať. Použi tlačidlo Obnoviť dostupnosť.');
    })).catch(()=>{if(active)setMessage('Dostupnosť sa nepodarilo načítať. Skús ju obnoviť.');});
    return ()=>{active=false;};
  },[offers]);
  async function api(action: string, body: Record<string, unknown> = {}) {
    const expectedUser=authUser.current;
    const { data, error } = await supabase.functions.invoke('trainer-commerce', { body: { action, ...body } });
    if(authUser.current!==expectedUser) throw new Error('Prihlásenie sa zmenilo. Načítajte údaje znova.');
    if (error || data?.error) throw new Error('Operáciu sa nepodarilo dokončiť. Skúste to znova.');
    return data;
  }
  async function run(task: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage('');
    try { await task(); } catch (error) { setMessage(error instanceof Error ? error.message : 'Operácia sa nepodarila.'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  function redirect(url: string) {
    const target = new URL(url);
    if (target.protocol !== 'https:' || !(target.hostname === 'stripe.com' || target.hostname.endsWith('.stripe.com'))) throw new Error('Neplatná platobná adresa.');
    window.location.assign(target.href);
  }
  return <main className="trainer-store">
    <Link href="/sk" className="brand">FITLINER</Link>
    <header>
      {!accountOnly && <p style={{ color: "#b8b2c5" }}>OSOBNÝ TRÉNER · ONLINE KOUČING</p>}
      {!accountOnly && profile.owner_id && <a href={`${appScheme === 'befitliner-staging' ? 'befitliner-staging' : 'befitliner'}://profile/${profile.owner_id}`} aria-label={`Profil ${profile.display_name} v aplikácii Fitliner`} className="profile-link">
        {profile.photo_url?.startsWith('https://') && !photoFailed ? <img src={profile.photo_url} alt={profile.display_name} width={96} height={96} style={{borderRadius:'50%',objectFit:'cover'}} onError={()=>setPhotoFailed(true)} /> : <span aria-hidden="true" style={{display:'grid',placeItems:'center',width:96,height:96,borderRadius:'50%',background:'#eee8ff',fontSize:36}}>{profile.display_name.slice(0,1)}</span>}
        <span>Zobraziť profil v aplikácii Fitliner</span>
      </a>}
      <h1 style={{ fontSize: 'clamp(36px, 7vw, 68px)', lineHeight: 1.05 }}>{profile.display_name}</h1>
      <p className="bio">{profile.bio}</p>
    </header>
    {accountOnly && returnTrainer && <p><Link href={`/${returnTrainer}`}>Späť k trénerovi a výberu termínu</Link></p>}
    {!accountOnly && <><Link href="/trainers/account">Moje rezervácie a platby</Link><h2 style={{ marginTop: 40 }}>Vyber si službu a termín</h2></>}
    <div className="offers">
      {offers.map(offer => <article key={offer.id} className="offer">
        <h3 style={{ fontSize: 24, margin: 0 }}>{offer.name}</h3>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, flexGrow: 1 }}>{offer.description}</p>
        <strong className="price">{money(offer.price_minor)}{offer.interval === 'month' && <small style={{ fontSize: 15 }}> / mesiac</small>}</strong>
        {offer.interval === 'month' && <p>Automatická mesačná platba. Ďalšie obdobie môžete zrušiť v správe predplatného.</p>}
        {offer.booking_kind && offer.booking_kind !== 'none' && <>
          <button disabled={busy} onClick={() => void run(async () => {
            const result = await api('slots',{offer_id:offer.id});
            setSlots(previous => ({...previous,[offer.id]:result.slots}));
            setSelected(previous => ({...previous,[offer.id]:''}));
          })}>Obnoviť dostupnosť</button>
          {slots[offer.id] && <BookingCalendar slots={slots[offer.id]} selected={selected[offer.id] ?? ''} busy={busy} onSelect={id=>setSelected(previous=>({...previous,[offer.id]:id}))}/>}
          {slots[offer.id]?.length===0 && <p>Momentálne nie sú vypísané termíny.</p>}
          {slots[offer.id]?.filter(slot=>slot.id===selected[offer.id]).map(slot=><p key={slot.id}>{slot.location} · {Math.round((Date.parse(slot.ends_at)-Date.parse(slot.starts_at))/60000)} minút. Presun alebo storno online najneskôr {slot.cancellation_hours} hodín vopred. Vrátenie platby dohodnite s trénerom; storno ju automaticky nevracia.</p>)}
        </>}
        <button disabled={busy} className="primary" onClick={() => {
          if (!signedIn) { setMessage('Najskôr overte svoj e-mail nižšie. Vďaka tomu budete mať bezpečný prístup k rezerváciám, faktúram a predplatnému.'); document.getElementById('trainer-email')?.focus(); return; }
          void run(async () => {
            const scheduled=offer.booking_kind && offer.booking_kind!=='none';
            const slotId=scheduled ? selected[offer.id] : undefined;
            if(scheduled && !slotId) throw new Error('Najskôr vyberte voľný termín.');
            const key=`${offer.id}:${slotId ?? ''}`;
            const requestId = requestIds.current[key] ??= crypto.randomUUID();
            const result = await api('checkout', { offer_id: offer.id, request_id: requestId, ...(slotId ? {slot_id:slotId} : {}) });
            redirect(result.url);
          });
        }}>{offer.booking_kind && offer.booking_kind!=='none'?'Rezervovať a zaplatiť':'Pokračovať k platbe'}</button>
      </article>)}
    </div>
    <section className="account-panel">
      {!signedIn ? <form onSubmit={event => { event.preventDefault(); void run(async () => {
        if(!accountOnly && /^[a-z][a-z0-9-]{2,63}$/.test(profile.slug)) { try { window.localStorage.setItem('fitliner.trainer.return',profile.slug); } catch { /* Login still works without local storage. */ } }
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/trainers/account` } });
        if (error) throw new Error('Prihlasovací e-mail sa nepodarilo odoslať. Skúste to neskôr.');
        setMessage('Poslali sme vám prihlasovací odkaz. Otvorte ho a vyberte službu.');
      }); }}>
        <h2>Vaše platby na jednom mieste</h2>
        <label htmlFor="trainer-email">E-mail pre platby a faktúry</label><br />
        <input id="trainer-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} style={{ padding: 12, border: '1px solid #9ba6b8', borderRadius: 8, margin: '12px 12px 12px 0', maxWidth: '100%' }} />
        <button disabled={busy} type="submit">Poslať prihlasovací odkaz</button>
      </form> : <>
        <>
          <button disabled={busy} onClick={()=>void run(async()=>{setBookings((await api('bookings')).bookings);})}>Moje rezervácie</button>
          {bookings.map(booking=><article key={booking.id} style={{borderTop:'1px solid #dfe4eb',padding:'16px 0'}}>
            <p>{slotTime(booking.slot_snapshot)} · {booking.slot_snapshot.location}</p>
            <strong>{bookingState(booking.state)}</strong>
            {booking.state==='held' && <p><button disabled={busy} onClick={()=>void run(async()=>{await api('refresh_booking',{order_id:booking.order_id});setBookings((await api('bookings')).bookings);})}>Overiť stav platby</button></p>}
            {booking.state==='held' && <p><button disabled={busy} onClick={()=>void run(async()=>{const result=await api('refresh_booking',{order_id:booking.order_id,resume:true});if(result.url)redirect(result.url);else{setBookings((await api('bookings')).bookings);setMessage('Platobný pokus už nie je otvorený. Skontrolujte stav rezervácie.');}})}>Dokončiť platbu</button></p>}
            {booking.state==='confirmed' && <p>
              <button disabled={busy} onClick={()=>void run(async()=>{
                const result=await api('slots',{offer_id:booking.slot_snapshot.offer_id});
                setSlots(previous=>({...previous,[booking.slot_snapshot.offer_id]:result.slots}));setMoving(booking);setMoveSlot('');
              })}>Presunúť termín</button>{' '}
              <button disabled={busy} onClick={()=>{
                if(!window.confirm('Zrušiť rezerváciu? Platba sa automaticky nevráti. Refundáciu dohodnite s trénerom.')) return;
                void run(async()=>{await api('change_booking',{booking_id:booking.id});setBookings((await api('bookings')).bookings);setMessage('Rezervácia zrušená. Prípadnú refundáciu rieši tréner.');});
              }}>Zrušiť rezerváciu</button>
            </p>}
          </article>)}
          {moving && <section aria-label="Presun rezervácie">
            <label>Nový termín <select value={moveSlot} onChange={event=>setMoveSlot(event.target.value)} style={{maxWidth:'100%'}}>
              <option value="">Vyberte termín</option>
              {(slots[moving.slot_snapshot.offer_id]??[]).filter(s=>s.id!==moving.slot_id && s.remaining>0).map(s=><option key={s.id} value={s.id}>{slotTime(s)}</option>)}
            </select></label>
            <button disabled={busy || !moveSlot} onClick={()=>void run(async()=>{await api('change_booking',{booking_id:moving.id,slot_id:moveSlot});setMoving(null);setBookings((await api('bookings')).bookings);setMessage('Termín bol presunutý. Nevznikla nová platba.');})}>Potvrdiť presun</button>
            <button disabled={busy} onClick={()=>setMoving(null)}>Späť</button>
          </section>}
        </>
        <button disabled={busy} onClick={() => void run(async () => { const data = await api('documents'); setOrders(data.orders); if (!data.orders.length) setMessage('Zatiaľ nemáte potvrdené platby.'); })}>Moje platby, faktúry a predplatné</button>
        {orders.map(order => <div key={order.id} style={{ borderTop: '1px solid #dfe4eb', marginTop: 20, paddingTop: 16 }}>
          <strong>{order.offer_snapshot.name}</strong>
          {order.trainer_commerce_refunds?.map(refund=><p key={refund.id}>Refundácia {money(refund.amount)} · {({succeeded:'Vrátená',pending:'Spracúva sa',requires_action:'Čaká na doplnenie údajov',failed:'Neúspešná',canceled:'Zrušená'} as Record<string,string>)[refund.status] ?? 'Spracúva sa'}</p>)}
          {!order.trainer_commerce_invoices.length && <p>Platba nepotvrdená alebo sa spracúva.</p>}
          {order.trainer_commerce_invoices.map(invoice => <p key={invoice.id}><button disabled={busy} onClick={() => void run(async () => redirect((await api('invoice', { invoice_id: invoice.id })).url))}>Stiahnuť faktúru {invoice.number} · {money(invoice.amount_paid)}</button></p>)}
          <p><button disabled={busy} onClick={() => void run(async () => redirect((await api('portal', { order_id: order.id })).url))}>Spravovať predplatné a faktúry</button></p>
        </div>)}
        <p><button disabled={busy} onClick={() => void run(async () => { await supabase.auth.signOut(); setOrders([]); setBookings([]); setMoving(null); })}>Odhlásiť sa</button></p>
      </>}
      {message && <p role="status" className="notice">{message}</p>}
    </section>
    <footer style={{ marginTop: 48, lineHeight: 1.7 }}>Službu poskytuje a fakturuje tréner. Platbu bezpečne spracuje Stripe. Fitliner zabezpečuje technickú platformu.</footer>
  </main>;
}
