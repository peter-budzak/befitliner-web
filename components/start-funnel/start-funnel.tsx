'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FitlinerWordmark } from '../fitliner-wordmark';
import { useEffect, useRef, useState } from 'react';
import { artwork, benefits, goals, locations, steps, times, workoutPreview, type Goal, type Location, type Minutes, type Step, type Venue } from './content';
import { startPlans, type PlanId } from './offer';
import { ProCheckout } from './pro-checkout';
import styles from './start-funnel.module.css';

const currency = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
const formatPrice = (minor: number) => currency.format(minor / 100);

function Illustration({ step, venue }: { step: Step; venue: Venue }) {
  const image = ((step === 'time' || step === 'preview') && artwork[`${step}-${venue}`]) || artwork[step];
  if (image) return <div className={styles.art}><Image src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 100vw, 47vw" /></div>;

  return <div className={styles.art} data-step={step} data-venue={venue} aria-hidden="true"><div className={styles.track} /><div className={styles.track} /><div className={styles.track} /><div className={styles.track} /></div>;
}

function Choices({ label, choices, onChoose, selected }: {
  label: string;
  choices: ReadonlyArray<{ id: string; title: string; detail: string }>;
  onChoose: (id: string) => void;
  selected?: string;
}) {
  return <div className={styles.choices} role="group" aria-label={label}>
    {choices.map(({ id, title, detail }) => <button key={id} type="button" className={styles.choice} aria-pressed={selected === id} onClick={() => onChoose(id)}>
      <span><strong>{title}</strong><small>{detail}</small></span><span aria-hidden="true">→</span>
    </button>)}
  </div>;
}

export function StartFunnel({ checkoutEnabled, resumePlan, checkoutReturn }: {
  checkoutEnabled: boolean;
  resumePlan?: PlanId;
  checkoutReturn: boolean;
}) {
  const [step, setStep] = useState<Step>(resumePlan || checkoutReturn ? 'offer' : 'intro');
  const [goal, setGoal] = useState<Goal>();
  const [location, setLocation] = useState<Location>();
  const [venue, setVenue] = useState<Venue>('home');
  const [minutes, setMinutes] = useState<Minutes>();
  const [planId, setPlanId] = useState<PlanId>(resumePlan ?? 'annual');
  const plans = startPlans;
  const plan = plans.find((option) => option.id === planId);
  const monthly = plans.find((option) => option.id === 'monthly');
  const annual = plans.find((option) => option.id === 'annual');
  const annualSavings = monthly && annual ? monthly.priceMinor * annual.months - annual.priceMinor : 0;
  const heading = useRef<HTMLHeadingElement>(null);
  const hasNavigated = useRef(false);
  const position = steps.indexOf(step);
  const preview = goal && minutes ? workoutPreview(venue, goal, minutes) : null;
  const venueLabel = venue === 'home' ? 'doma' : 'vo fitku';
  const goalLabel = goals.find((option) => option.id === goal)?.title.toLocaleLowerCase('sk');

  useEffect(() => {
    if (!hasNavigated.current) return;
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  function go(next: Step) {
    hasNavigated.current = true;
    setStep(next);
  }

  function selectLocation(id: string) {
    const choice = locations.find((option) => option.id === id);
    if (!choice) return;
    setLocation(choice.id);
    setVenue(choice.id === 'gym' ? 'gym' : 'home');
    go('time');
  }

  const titles: Record<Step, string> = {
    intro: 'Začni trénovať po svojom.',
    goal: 'Čo chceš dosiahnuť?',
    location: 'Kde chceš začať?',
    time: 'Koľko času máš na tréning?',
    preview: `Tvoj prvý tréning ${venueLabel}.`,
    offer: 'Fitliner PRO',
  };

  return <div className={styles.shell} lang="sk">
    <header className={styles.header}>
      <Link className={styles.logo} href="/sk" aria-label="Fitliner – domov"><FitlinerWordmark /></Link>
      {step !== 'intro' && <div className={styles.progress} aria-label={`Krok ${position} z ${steps.length - 1}`}>
        <span>{position} / {steps.length - 1}</span>
        <progress value={position} max={steps.length - 1} />
      </div>}
    </header>
    <main className={styles.main}>
      <section className={styles.stage} aria-labelledby="start-title" key={step}>
        <div className={styles.copy}>
          {step !== 'intro' && <button type="button" className={styles.back} onClick={() => go(step === 'offer' && !preview ? 'intro' : steps[position - 1])}>← Späť</button>}
          <h1 id="start-title" ref={heading} tabIndex={-1}>{titles[step]}</h1>
          {step === 'intro' && <>
            <p className={styles.lead}>Pozri si prvý tréning podľa svojho cieľa. Doma aj vo fitku, v čase, ktorý máš. Fitliner ti pomôže s plánom, stravou a sledovaním progresu.</p>
            <button className={styles.primary} type="button" onClick={() => go('goal')}>Ukázať môj štart <span aria-hidden="true">↗</span></button>
            <p className={styles.note}>Tri otázky a hneď uvidíš ukážku tréningu.</p>
          </>}
          {step === 'goal' && <Choices label={titles.goal} choices={goals} selected={goal} onChoose={(id) => {
            const choice = goals.find((item) => item.id === id);
            if (choice) { setGoal(choice.id); go('location'); }
          }} />}
          {step === 'location' && <>
            <p className={styles.lead}>Ak chceš {goalLabel}, vyber miesto, kde sa ti najľahšie začne.</p>
            <Choices label={titles.location} choices={locations} selected={location} onChoose={selectLocation} />
          </>}
          {step === 'time' && <>
            <p className={styles.lead}>{location === 'both' ? 'Ukážeme ti dve verzie tréningu. Čas si zvoľ podľa svojho bežného dňa.' : venue === 'home' ? 'Doma môžeš začať cvikmi s vlastnou váhou.' : 'Vo fitku ti ukážeme cviky aj zápis tréningu, aby si nabudúce videl svoj posledný výkon.'}</p>
            <Choices label={titles.time} choices={times.map((time) => ({ id: String(time.minutes), title: `${time.minutes} minút`, detail: time.detail }))} selected={minutes?.toString()} onChoose={(id) => {
              const choice = times.find((time) => String(time.minutes) === id);
              if (choice) { setMinutes(choice.minutes); go('preview'); }
            }} />
          </>}
          {step === 'preview' && preview && <>
            {location === 'both' && <div className={styles.switcher} role="group" aria-label="Miesto ukážkového tréningu">
              <button type="button" aria-pressed={venue === 'home'} onClick={() => setVenue('home')}>Doma</button>
              <button type="button" aria-pressed={venue === 'gym'} onClick={() => setVenue('gym')}>Vo fitku</button>
            </div>}
            <div className={styles.workout} aria-live="polite">
              <p className={styles.workoutTitle}>{preview.minutes} minút · {goalLabel}</p>
              <p className={styles.note}>{preview.warmup} min rozcvička · {preview.main} min hlavná časť · {preview.finish} min záver</p>
              <ul>{preview.exercises.map((exercise) => <li key={exercise}>{exercise}</li>)}</ul>
              <p className={styles.note}>Ukážka podľa tvojich odpovedí.</p>
            </div>
            <p className={styles.lead}>{venue === 'home' ? 'V aplikácii máš ukážky cvikov. Keď budeš mať nabudúce menej času, AI tréner ti pomôže tréning skrátiť.' : 'V aplikácii si zapíšeš série, opakovania a váhy. Pri ďalšom tréningu uvidíš, kde si naposledy skončil.'}</p>
            <button className={styles.primary} type="button" onClick={() => go('offer')}>Pozrieť ponuku <span aria-hidden="true">↗</span></button>
          </>}
          {step === 'offer' && <>
            <p className={styles.lead}>AI tréner, Zdravotná karta a celý prístup k sekciám Tréning a Strava.</p>
            {checkoutReturn && <p className={styles.purchase} role="status">Po potvrdení platby sa PRO aktivuje v aplikácii. Prihlás sa rovnakým účtom.</p>}
            <fieldset className={styles.plans}>
              <legend>Vyber si predplatné</legend>
              {plans.map((option) => <label key={option.id} className={styles.plan}>
                <input type="radio" name="fitliner-pro-plan" value={option.id} checked={planId === option.id} onChange={() => setPlanId(option.id)} />
                <span>
                  <strong>{option.id === 'annual' ? 'Ročný plán' : 'Mesačný plán'}</strong>
                  <small>{option.id === 'annual'
                    ? `${formatPrice(option.priceMinor / option.months)} mesačne v prepočte`
                    : 'Platba každý mesiac'}</small>
                </span>
                <span className={styles.planAmount}>
                  <strong>{formatPrice(option.priceMinor)} / {option.id === 'annual' ? 'rok' : 'mesiac'}</strong>
                  {option.id === 'annual' && annualSavings > 0 && <small>Ušetríš {formatPrice(annualSavings)} za rok</small>}
                </span>
              </label>)}
            </fieldset>
            {plan && <div className={styles.purchase}>
              <p><strong>Dnes zaplatíš {formatPrice(plan.priceMinor)}.</strong></p>
              <p className={styles.note}>
                Predplatné sa automaticky obnovuje {plan.id === 'annual' ? 'každý rok' : 'každý mesiac'} za {formatPrice(plan.priceMinor)}, kým ho nezrušíš.
              </p>
              {checkoutEnabled
                ? <ProCheckout plan={plan.id} />
                : <p className={styles.note} role="status">Online nákup zatiaľ nie je dostupný.</p>}
            </div>}
          </>}
        </div>
        <Illustration step={step} venue={venue} />
      </section>
      {step === 'intro' && <section className={styles.benefits} aria-labelledby="benefits-title">
        <h2 id="benefits-title">Čo získaš vo Fitlineri</h2>
        <dl>{benefits.map(([title, detail]) => <div key={title}><dt>{title}</dt><dd>{detail}</dd></div>)}</dl>
        <button className={styles.primary} type="button" onClick={() => go('goal')}>Ukázať môj štart <span aria-hidden="true">↗</span></button>
      </section>}
    </main>
  </div>;
}
