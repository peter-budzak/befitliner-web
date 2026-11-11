'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FitlinerWordmark } from '../fitliner-wordmark';
import { useEffect, useRef, useState } from 'react';
import { artwork, benefits, goals, locations, steps, times, workoutPreview, type Goal, type Location, type Minutes, type Step, type Venue } from './content';
import { startPlans, type PlanId } from './offer';
import { ProCheckout } from './pro-checkout';
import { ProProfile, ResumeProProfile } from './pro-profile';
import { proFunnelClient, recordProStep } from './pro-funnel-client';
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
      <span><strong>{title}</strong><small>{detail}</small></span><span className={styles.choiceIndicator} aria-hidden="true" />
    </button>)}
  </div>;
}

function BenefitCards() {
  return <dl className={styles.benefitCards}>
    {benefits.map(([title, detail]) => <div key={title}>
      <dt>{title}</dt>
      <dd>{detail}</dd>
    </div>)}
  </dl>;
}

function ContinueButton({ label = 'Pokračovať', onClick, disabled }: {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return <div className={styles.actionBar}>
    <button className={styles.primary} type="button" onClick={onClick} disabled={disabled}>{label}</button>
  </div>;
}

export function StartFunnel({ checkoutEnabled, resumePlan, checkoutReturn, resumeFlow, offerToken, verify }: {
  checkoutEnabled: boolean;
  resumePlan?: PlanId;
  checkoutReturn: boolean;
  resumeFlow?: string;
  offerToken?: string;
  verify: boolean;
}) {
  const [step, setStep] = useState<Step>(resumeFlow || checkoutReturn ? 'offer' : resumePlan ? 'profile' : 'intro');
  const flowRef = useRef<string | undefined>(resumeFlow);
  const [email, setEmail] = useState('');
  const [verificationPending, setVerificationPending] = useState(verify);
  const [boundFlow, setBoundFlow] = useState<string>();
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<'waiting' | 'paid'>('waiting');

  function flowId() {
    return flowRef.current ??= crypto.randomUUID();
  }
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

  useEffect(() => {
    if (checkoutReturn) return;
    void recordProStep(flowId(), steps.indexOf(step) + 1);
  }, [step, checkoutReturn]);

  useEffect(() => {
    if (step !== 'offer' || verificationPending && !verify) return;
    const client = proFunnelClient();
    if (!client) return;
    let stopped = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    async function load() {
      if (!client) return;
      const { data } = await client.auth.getUser();
      if (stopped || !data.user?.email_confirmed_at) return;
      const id = flowRef.current;
      if (id && !checkoutReturn) {
        const bound = await client.rpc('bind_fitliner_pro_funnel', { p_id: id });
        if (stopped || bound.data !== true) return;
        setVerificationPending(false);
      }
      if (stopped) return;
      const { data: status, error } = await client.rpc('get_fitliner_pro_funnel_status', {
        p_id: id ?? null,
        p_offer: offerToken ?? null,
      });
      if (stopped) return;
      if (!error && status) {
        setEmail(data.user.email ?? '');
        setDiscount(status.discount ?? 0);
        if (id && !checkoutReturn) setBoundFlow(id);
      }
      if (checkoutReturn) {
        if (status?.purchased) setPayment('paid');
        else retry = setTimeout(load, 4000);
      }
    }
    void load();
    return () => { stopped = true; clearTimeout(retry); };
  }, [step, verify, verificationPending, checkoutReturn, offerToken]);

  function go(next: Step) {
    hasNavigated.current = true;
    setStep(next);
  }

  function selectLocation(id: string) {
    const choice = locations.find((option) => option.id === id);
    if (!choice) return;
    setLocation(choice.id);
    setVenue(choice.id === 'gym' ? 'gym' : 'home');
  }

  const titles: Record<Exclude<Step, 'intro'>, string> = {
    benefits: 'Čo získaš vo Fitlineri',
    goal: 'Čo chceš dosiahnuť?',
    location: 'Kde chceš začať?',
    time: 'Koľko času máš na tréning?',
    preview: `Tvoj prvý tréning ${venueLabel}.`,
    profile: 'Vytvor si profil',
    offer: checkoutReturn ? 'Tvoj Fitliner PRO' : 'Fitliner PRO',
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
      <section className={step === 'benefits' ? `${styles.stage} ${styles.benefitsStage}` : styles.stage} aria-labelledby="start-title" key={step}>
        <div className={styles.copy}>
          {step !== 'intro' && !checkoutReturn && <button type="button" className={styles.back} onClick={() => go(step === 'offer' && !preview ? 'profile' : step === 'profile' && !preview ? 'intro' : steps[position - 1])}>← Späť</button>}
          <h1 id="start-title" ref={heading} tabIndex={-1}>{step === 'intro' ? <>Dostaň sa do formy <span className={styles.headlineHighlight}>3x rýchlejšie</span></> : titles[step]}</h1>
          {step === 'intro' && <>
            <p className={styles.lead}>bez nakladov na 3 rôzne aplikácie!</p>
            <ContinueButton label="ZAČAŤ" onClick={() => go('benefits')} />
          </>}
          {step === 'benefits' && <>
            <BenefitCards />
            <ContinueButton onClick={() => go('goal')} />
          </>}
          {step === 'goal' && <>
            <Choices label={titles.goal} choices={goals} selected={goal} onChoose={(id) => {
              const choice = goals.find((item) => item.id === id);
              if (choice) setGoal(choice.id);
            }} />
            <ContinueButton disabled={!goal} onClick={() => go('location')} />
          </>}
          {step === 'location' && <>
            <p className={styles.lead}>Ak chceš {goalLabel}, vyber miesto, kde sa ti najľahšie začne.</p>
            <Choices label={titles.location} choices={locations} selected={location} onChoose={selectLocation} />
            <ContinueButton disabled={!location} onClick={() => go('time')} />
          </>}
          {step === 'time' && <>
            <p className={styles.lead}>{location === 'both' ? 'Ukážeme ti dve verzie tréningu. Čas si zvoľ podľa svojho bežného dňa.' : venue === 'home' ? 'Doma môžeš začať cvikmi s vlastnou váhou.' : 'Vo fitku ti ukážeme cviky aj zápis tréningu, aby si nabudúce videl svoj posledný výkon.'}</p>
            <Choices label={titles.time} choices={times.map((time) => ({ id: String(time.minutes), title: `${time.minutes} minút`, detail: time.detail }))} selected={minutes?.toString()} onChoose={(id) => {
              const choice = times.find((time) => String(time.minutes) === id);
              if (choice) setMinutes(choice.minutes);
            }} />
            <ContinueButton disabled={!minutes} onClick={() => go('preview')} />
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
            <ContinueButton label="Vytvoriť profil" onClick={() => go('profile')} />
          </>}
          {step === 'profile' && <ProProfile flowId={flowId} onSaved={(address, pending) => {
            setEmail(address);
            setVerificationPending(pending);
            setBoundFlow(pending ? undefined : flowRef.current);
            go('offer');
          }} />}
          {checkoutReturn && <div className={styles.purchase} role="status">
            {payment === 'paid' ? <p><strong>Platba je potvrdená.</strong></p> : <p>Čakáme na potvrdenie platby.</p>}
            <p>V aplikácii Fitliner sa prihlás {email ? <>e-mailom <strong>{email}</strong></> : 'rovnakým e-mailom, aký si použil pri platbe'}.</p>
            <div className={styles.actionBar}><a className={styles.primary} href="befitliner://">Otvoriť Fitliner</a></div>
          </div>}
          {step === 'offer' && !checkoutReturn && <>
            <p className={styles.lead}>AI tréner, Zdravotná karta a celý prístup k sekciám Tréning a Strava.</p>
            {verificationPending && <p className={styles.purchase} role="status">Otvor overovací odkaz, ktorý sme poslali {email ? <>na <strong>{email}</strong></> : 'na tvoj e-mail'}. Potom môžeš pokračovať k platbe.</p>}
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
              <p><strong>Dnes zaplatíš {formatPrice(Math.round(plan.priceMinor * (100 - discount) / 100))}.</strong></p>
              {discount > 0 && <p className={styles.note}>{discount} % zľava na prvú platbu.</p>}
              {boundFlow && offerToken && discount === 0 && <p className={styles.note}>Táto zľava už nie je dostupná. Zobrazuje sa bežná cena.</p>}
              <p className={styles.note}>
                Predplatné sa automaticky obnovuje {plan.id === 'annual' ? 'každý rok' : 'každý mesiac'} za {formatPrice(plan.priceMinor)}, kým ho nezrušíš.
              </p>
              {checkoutEnabled && !boundFlow && resumeFlow
                ? <ResumeProProfile flowId={resumeFlow} offerToken={offerToken} />
                : checkoutEnabled && boundFlow
                ? <ProCheckout plan={plan.id} flowId={boundFlow} offerToken={discount > 0 ? offerToken : undefined} />
                : <>
                  {!checkoutEnabled && <p className={styles.note} role="status">Online nákup zatiaľ nie je dostupný.</p>}
                  {checkoutEnabled && !verificationPending && <p className={styles.note}>Pred platbou si priprav profil a over e-mail.</p>}
                  <ContinueButton label="Pokračovať k platbe" disabled />
                </>}
            </div>}
          </>}
        </div>
        <Illustration step={step} venue={venue} />
      </section>
    </main>
  </div>;
}
