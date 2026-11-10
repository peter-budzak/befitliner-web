'use client';
import {useState} from 'react';
export type CalendarSlot = {id:string; starts_at:string; ends_at:string; timezone:string; location:string; remaining:number; cancellation_hours:number};
const dayKey=(date:Date, zone:string)=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export default function BookingCalendar({slots,selected,onSelect,busy}:{slots:CalendarSlot[];selected:string;onSelect:(id:string)=>void;busy:boolean}) {
  const zone=slots[0]?.timezone || 'Europe/Bratislava';
  const first=slots.find(s=>s.remaining>0) ?? slots[0];
  const initial=first ? dayKey(new Date(first.starts_at),zone) : dayKey(new Date(),zone);
  const [day,setDay]=useState(initial);
  const [month,setMonth]=useState(initial.slice(0,7));
  const [year,number]=month.split('-').map(Number);
  const start=new Date(Date.UTC(year,number-1,1));
  const count=new Date(Date.UTC(year,number,0)).getUTCDate();
  const offset=(start.getUTCDay()+6)%7;
  const key=(d:number)=>`${month}-${String(d).padStart(2,'0')}`;
  const inventory=new Map<string,{free:number;totalSlots:number;fullSlots:number}>();
  for(const slot of slots){const date=dayKey(new Date(slot.starts_at),slot.timezone);const item=inventory.get(date)??{free:0,totalSlots:0,fullSlots:0};item.free+=Math.max(0,slot.remaining);item.totalSlots++;if(slot.remaining<=0)item.fullSlots++;inventory.set(date,item);}
  const times=slots.filter(s=>dayKey(new Date(s.starts_at),s.timezone)===day);
  function chooseDay(date:string) {
    if (date !== day) onSelect('');
    setDay(date);
  }
  function move(delta:number){const next=new Date(Date.UTC(year,number-1+delta,1));setMonth(next.toISOString().slice(0,7));chooseDay(next.toISOString().slice(0,10));}
  return <section className="booking-calendar" aria-label="Kalendár dostupnosti">
    <div className="calendar-heading"><button type="button" disabled={busy} aria-label="Predchádzajúci mesiac" onClick={()=>move(-1)}>‹</button><strong>{new Intl.DateTimeFormat('sk-SK',{month:'long',year:'numeric',timeZone:'UTC'}).format(start)}</strong><button type="button" disabled={busy} aria-label="Nasledujúci mesiac" onClick={()=>move(1)}>›</button></div>
    <div className="calendar-grid">{['Po','Ut','St','Št','Pi','So','Ne'].map(d=><span className="weekday" key={d}>{d}</span>)}{Array.from({length:offset},(_,i)=><span key={`blank${i}`}/>)}{Array.from({length:count},(_,i)=>{const date=key(i+1);const item=inventory.get(date);const state=!item?'empty':item.free===0?'full':item.fullSlots>0?'partial':'free';const label=!item?'Bez termínov':item.free===0?'Obsadené':`${item.free} voľných miest`;return <button type="button" key={date} disabled={busy} aria-label={`${date} · ${label}`} aria-pressed={day===date} className={`${day===date?'selected':''} availability-${state}`} onClick={()=>chooseDay(date)}><span className="day-number">{i+1}</span><span className="day-capacity" aria-hidden="true">{item?item.free:'–'}</span></button>;})}</div>
    <p className="calendar-hint">Číslo znamená počet voľných miest. Zelená: dostupné termíny · žltá: niektoré termíny plné · červená: obsadené · sivá: bez termínov. Časy: {zone}.</p>
    <h4>{new Intl.DateTimeFormat('sk-SK',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`))}</h4>
    <div className="time-grid">{times.map(s=><button type="button" key={s.id} disabled={busy||s.remaining<=0} aria-pressed={selected===s.id} className={selected===s.id?'selected':''} onClick={()=>onSelect(s.id)}><strong>{new Intl.DateTimeFormat('sk-SK',{hour:'2-digit',minute:'2-digit',timeZone:s.timezone}).format(new Date(s.starts_at))}</strong><small>{s.remaining>0?`${s.remaining} voľné ${s.remaining===1?'miesto':'miesta'}`:'Obsadené'}</small></button>)}</div>
    {!times.length&&<p className="calendar-hint">Na tento deň nie sú vypísané termíny. Vyber deň s voľnými miestami.</p>}
  </section>;
}
