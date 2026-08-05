'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

type Goal = 'lab_results' | 'body_composition' | 'both' | 'prevention';
type Barrier = 'scattered' | 'understanding' | 'trends' | 'routine';
type DataRecency = 'recent' | 'older' | 'none';
type FunnelStep = 1 | 2 | 3 | 4 | 5;
type Attribution = Record<string, string>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '475851925437843';
const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
] as const;

const goalOptions: Array<{ value: Goal; title: string; description: string }> = [
  {
    value: 'lab_results',
    title: 'Krvné výsledky',
    description: 'Chcem mať biomarkery uložené a zoradené v čase.',
  },
  {
    value: 'body_composition',
    title: 'Zloženie tela',
    description: 'Chcem sledovať vývoj meraní z diagnostickej váhy.',
  },
  {
    value: 'both',
    title: 'Oboje na jednom mieste',
    description: 'Chcem spojiť laboratórne výsledky aj zloženie tela.',
  },
  {
    value: 'prevention',
    title: 'Dlhodobý prehľad',
    description: 'Chcem si postupne budovať históriu svojich meraní.',
  },
];

const barrierOptions: Array<{ value: Barrier; title: string; description: string }> = [
  {
    value: 'scattered',
    title: 'Výsledky mám rozhádzané',
    description: 'PDF, e-maily a papiere nemám v jednom systéme.',
  },
  {
    value: 'understanding',
    title: 'Chýba mi jasný prehľad',
    description: 'Potrebujem mať jednotlivé hodnoty lepšie usporiadané.',
  },
  {
    value: 'trends',
    title: 'Nevidím vývoj v čase',
    description: 'Jednotlivé merania sa mi ťažko porovnávajú.',
  },
  {
    value: 'routine',
    title: 'Chýba mi pravidelnosť',
    description: 'Na ďalšie meranie alebo test si často nespomeniem.',
  },
];

function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const attribution: Attribution = {};

  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key)?.trim();
    if (value) attribution[key] = value.slice(0, key === 'fbclid' ? 250 : 200);
  }

  return attribution;
}

function getSourceUrl(allowMarketingIdentifiers: boolean) {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  if (!allowMarketingIdentifiers) url.searchParams.delete('fbclid');
  return url.toString();
}

function ensureMetaPixel() {
  if (!PIXEL_ID || typeof window === 'undefined' || window.fbq) return;

  const fbq = (...args: unknown[]) => {
    (fbq as unknown as { queue: unknown[][] }).queue.push(args);
  };
  (fbq as unknown as { queue: unknown[][] }).queue = [];
  (fbq as unknown as { loaded: boolean }).loaded = true;
  (fbq as unknown as { version: string }).version = '2.0';
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
  window.fbq('trackCustom', 'HealthLandingView');
}

function trackMeta(event: string, parameters?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('trackCustom', event, parameters ?? {});
}

function trackMetaStandard(
  event: string,
  parameters?: Record<string, string | number | boolean>,
  eventId?: string
) {
  if (typeof window === 'undefined' || !window.fbq) return;
  window.fbq('track', event, parameters ?? {}, eventId ? { eventID: eventId } : undefined);
}

function getCookieValue(name: string) {
  if (typeof document === 'undefined') return '';
  const prefix = `${name}=`;
  const entry = document.cookie.split(';').map((value) => value.trim()).find((value) => value.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : '';
}

async function sendServerRegistrationEvent({
  eventId,
  requestId,
  email,
}: {
  eventId: string;
  requestId: string;
  email: string;
}) {
  const response = await fetch('/api/meta/conversions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: 'CompleteRegistration',
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: getSourceUrl(true),
      email,
      external_id: requestId,
      fbp: getCookieValue('_fbp'),
      fbc: getCookieValue('_fbc'),
    }),
  });

  if (!response.ok) throw new Error('Server conversion event failed.');
}

function OptionCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-violet-400 bg-violet-500/15 shadow-[0_0_0_1px_rgba(167,139,250,0.2)]'
          : 'border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.06]'
      }`}
    >
      <span className="flex items-start gap-3">
        <span
          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
            selected ? 'border-violet-300 bg-violet-400 text-[#08070c]' : 'border-white/25'
          }`}
        >
          {selected ? '✓' : ''}
        </span>
        <span>
          <span className="block font-semibold text-white">{title}</span>
          <span className="mt-1 block text-sm leading-5 text-white/55">{description}</span>
        </span>
      </span>
    </button>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute inset-8 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#121018] p-5 shadow-2xl shadow-violet-950/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
              Health Card
            </p>
            <p className="mt-1 text-sm text-white/45">Dlhodobý zdravotný prehľad</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/15 text-xl">
            ✦
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-white/40">Health Score</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight">82</p>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              aktualizované
            </span>
          </div>
          <div className="mt-5 flex h-20 items-end gap-2" aria-hidden="true">
            {[35, 48, 43, 62, 58, 75, 82].map((height, index) => (
              <div key={index} className="flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-violet-700 to-violet-300"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs text-white/40">Krvné výsledky</p>
            <p className="mt-2 font-semibold">História hodnôt</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs text-white/40">Zloženie tela</p>
            <p className="mt-2 font-semibold">Vývoj meraní</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HealthFunnel({ locale }: { locale: string }) {
  const [step, setStep] = useState<FunnelStep>(1);
  const [goal, setGoal] = useState<Goal | ''>('');
  const [barrier, setBarrier] = useState<Barrier | ''>('');
  const [dataRecency, setDataRecency] = useState<DataRecency | ''>('');
  const [email, setEmail] = useState('');
  const [healthConsent, setHealthConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [trackingConsent, setTrackingConsent] = useState(false);
  const [trackingChoice, setTrackingChoice] = useState<'accepted' | 'rejected' | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const [leadSaved, setLeadSaved] = useState(false);
  const [requestId, setRequestId] = useState('');
  const funnelRef = useRef<HTMLDivElement>(null);

  const attribution = useMemo(() => getAttribution(), []);

  useEffect(() => {
    const storageKey = 'fitliner_health_request_id';
    const existingId = window.localStorage.getItem(storageKey);
    const id = existingId || crypto.randomUUID();
    if (!existingId) window.localStorage.setItem(storageKey, id);
    setRequestId(id);

    const choice = window.localStorage.getItem('fitliner_marketing_tracking_consent');
    if (choice === 'accepted') {
      setTrackingChoice('accepted');
      setTrackingConsent(true);
      ensureMetaPixel();
    } else if (choice === 'rejected') {
      setTrackingChoice('rejected');
    }
  }, []);

  const answers = useMemo(
    () => ({ goal, barrier, data_recency: dataRecency }),
    [barrier, dataRecency, goal]
  );

  const scrollToFunnel = () => {
    funnelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    trackMeta('HealthQuizStart');
  };

  const acceptTracking = () => {
    window.localStorage.setItem('fitliner_marketing_tracking_consent', 'accepted');
    setTrackingChoice('accepted');
    setTrackingConsent(true);
    ensureMetaPixel();
  };

  const rejectTracking = () => {
    window.localStorage.setItem('fitliner_marketing_tracking_consent', 'rejected');
    setTrackingChoice('rejected');
    setTrackingConsent(false);
  };

  const saveLead = async () => {
    if (!requestId || !goal || !barrier || !dataRecency) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Zadajte platnú e-mailovú adresu.');
      return;
    }
    if (!healthConsent || !privacyConsent) {
      setError('Na vytvorenie prehľadu potrebujeme povinné súhlasy.');
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Registrácia momentálne nie je dostupná. Skúste to neskôr.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      const response = await fetch(`${supabaseUrl}/functions/v1/health-save-web-lead`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          email: email.trim().toLowerCase(),
          locale,
          answers,
          source_url: getSourceUrl(trackingConsent),
          attribution,
          health_data_consent: true,
          privacy_consent: true,
          marketing_consent: marketingConsent,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Registráciu sa nepodarilo uložiť.');

      setLeadSaved(true);
      setStep(5);
      const registrationEventId = crypto.randomUUID();
      trackMeta('HealthRegistrationCompleted');
      trackMetaStandard(
        'CompleteRegistration',
        { content_name: 'Fitliner Health' },
        registrationEventId
      );
      if (trackingConsent) {
        void sendServerRegistrationEvent({
          eventId: registrationEventId,
          requestId,
          email: email.trim().toLowerCase(),
        }).catch((conversionError) => {
          console.error('Meta server registration event failed', conversionError);
        });
      }
    } catch (leadError) {
      setError(leadError instanceof Error ? leadError.message : 'Registráciu sa nepodarilo uložiť.');
    } finally {
      setIsSaving(false);
    }
  };

  const openCheckout = async () => {
    if (!leadSaved || !termsAccepted) {
      setError('Pred pokračovaním potvrďte obchodné podmienky.');
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Platba momentálne nie je dostupná. Skúste to neskôr.');
      return;
    }

    try {
      setIsCheckoutLoading(true);
      setError('');
      trackMetaStandard('InitiateCheckout', { value: 34.8, currency: 'EUR' });

      const response = await fetch(
        `${supabaseUrl}/functions/v1/stripe-create-health-web-checkout`,
        {
          method: 'POST',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            request_id: requestId,
            email: email.trim().toLowerCase(),
            locale,
            answers,
            source_url: getSourceUrl(trackingConsent),
            attribution,
            health_data_consent: true,
            privacy_consent: true,
            terms_accepted: true,
            marketing_consent: marketingConsent,
            marketing_tracking_consent: trackingConsent,
          }),
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.checkout_url) {
        throw new Error(payload?.error || 'Platbu sa nepodarilo otvoriť.');
      }

      window.location.assign(payload.checkout_url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Platbu sa nepodarilo otvoriť.');
      setIsCheckoutLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#08070c] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,0.16),transparent_32%),radial-gradient(circle_at_85%_35%,rgba(14,165,233,0.08),transparent_28%)]" />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-6 md:px-8">
        <header className="flex items-center justify-between">
          <Link href="/sk" className="text-lg font-black tracking-[-0.03em]">
            FITLINER<span className="text-violet-400">™</span>
          </Link>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/60">
            Health
          </span>
        </header>

        <section className="grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1.06fr_0.94fr] lg:pb-28 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
              Zdravotné výsledky v jednom prehľade
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl md:text-6xl">
              Jedno meranie ukáže moment. Fitliner ukáže vývoj.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg md:leading-8">
              Nahrajte výsledky krvných testov a diagnostickej váhy. Fitliner Health ich
              usporiada do Health Card, kde môžete sledovať trendy a dlhodobý Health Score.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-white/75 sm:grid-cols-3">
              {['PDF alebo fotografia', 'Trendy v čase', 'Pripomienky meraní'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-emerald-300">✓</span>
                  {item}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={scrollToFunnel}
              className="mt-9 inline-flex w-full items-center justify-center rounded-2xl bg-violet-600 px-7 py-4 font-semibold shadow-lg shadow-violet-950/40 transition hover:bg-violet-500 sm:w-auto"
            >
              Vytvoriť môj zdravotný prehľad
            </button>
            <p className="mt-3 text-xs text-white/40">34,80 € ročne · približne 2,90 € mesačne</p>
          </div>

          <ProductPreview />
        </section>

        <section className="grid gap-4 border-y border-white/10 py-10 md:grid-cols-3">
          {[
            ['01', 'Nahrajte výsledky', 'Pridajte PDF, fotografiu alebo údaje z diagnostickej váhy.'],
            ['02', 'Skontrolujte hodnoty', 'Pred uložením vždy potvrdíte rozpoznané údaje.'],
            ['03', 'Sledujte vývoj', 'Každá hodnota zostáva vo vlastnej časovej histórii.'],
          ].map(([number, title, description]) => (
            <article key={number} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <span className="text-xs font-black tracking-[0.2em] text-violet-300">{number}</span>
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">{description}</p>
            </article>
          ))}
        </section>

        <section ref={funnelRef} className="scroll-mt-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">
                Váš Health plán
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Začnite krátkym nastavením
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Odpovede používame iba na prispôsobenie vášho prehľadu. Neposielame ich do Meta.
              </p>
            </div>

            <div className="mt-9 rounded-[2rem] border border-white/10 bg-[#111016]/95 p-5 shadow-2xl shadow-black/30 md:p-8">
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>Krok {step} z 5</span>
                <span>{Math.round((step / 5) * 100)} %</span>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-300 transition-all duration-300"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>

              {step === 1 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold tracking-tight">Čo chcete sledovať?</h3>
                  <p className="mt-2 text-sm text-white/55">Vyberte jednu hlavnú oblasť.</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {goalOptions.map((option) => (
                      <OptionCard
                        key={option.value}
                        selected={goal === option.value}
                        title={option.title}
                        description={option.description}
                        onClick={() => setGoal(option.value)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!goal}
                    onClick={() => {
                      setStep(2);
                      trackMeta('HealthQuizProgress', { step: 1 });
                    }}
                    className="mt-6 w-full rounded-2xl bg-violet-600 px-5 py-4 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Pokračovať
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold tracking-tight">Čo vám dnes najviac chýba?</h3>
                  <p className="mt-2 text-sm text-white/55">Vyberte najbližšiu možnosť.</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {barrierOptions.map((option) => (
                      <OptionCard
                        key={option.value}
                        selected={barrier === option.value}
                        title={option.title}
                        description={option.description}
                        onClick={() => setBarrier(option.value)}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-2xl border border-white/10 px-5 py-4 font-semibold text-white/70"
                    >
                      Späť
                    </button>
                    <button
                      type="button"
                      disabled={!barrier}
                      onClick={() => {
                        setStep(3);
                        trackMeta('HealthQuizProgress', { step: 2 });
                      }}
                      className="flex-1 rounded-2xl bg-violet-600 px-5 py-4 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Pokračovať
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold tracking-tight">Máte výsledky, ktoré chcete pridať?</h3>
                  <p className="mt-2 text-sm text-white/55">Nevadí, ak začínate úplne od začiatku.</p>
                  <div className="mt-6 grid gap-3">
                    {[
                      ['recent', 'Áno, mám aktuálne výsledky', 'Môžem ich pridať po aktivácii.'],
                      ['older', 'Mám iba staršie výsledky', 'Začnem vytvorením svojej histórie.'],
                      ['none', 'Zatiaľ žiadne výsledky nemám', 'Fitliner mi pomôže nastaviť pravidelnosť.'],
                    ].map(([value, title, description]) => (
                      <OptionCard
                        key={value}
                        selected={dataRecency === value}
                        title={title}
                        description={description}
                        onClick={() => setDataRecency(value as DataRecency)}
                      />
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-2xl border border-white/10 px-5 py-4 font-semibold text-white/70"
                    >
                      Späť
                    </button>
                    <button
                      type="button"
                      disabled={!dataRecency}
                      onClick={() => {
                        setStep(4);
                        trackMeta('HealthQuizProgress', { step: 3 });
                      }}
                      className="flex-1 rounded-2xl bg-violet-600 px-5 py-4 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Zobraziť môj plán
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="mt-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Plán pripravený</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">Kam vám ho môžeme uložiť?</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    E-mail použijeme na uloženie rozpracovaného plánu a prípravu vášho účtu pri aktivácii.
                  </p>

                  <label className="mt-6 block text-sm font-medium text-white/75" htmlFor="health-email">
                    E-mail
                  </label>
                  <input
                    id="health-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="vas@email.sk"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-violet-400"
                  />

                  <div className="mt-6 space-y-3 text-xs leading-5 text-white/55">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={healthConsent}
                        onChange={(event) => setHealthConsent(event.target.checked)}
                        className="mt-1 accent-violet-500"
                      />
                      <span>Súhlasím so spracovaním odpovedí potrebných na vytvorenie Health prehľadu. *</span>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={privacyConsent}
                        onChange={(event) => setPrivacyConsent(event.target.checked)}
                        className="mt-1 accent-violet-500"
                      />
                      <span>
                        Súhlasím so spracovaním údajov podľa{' '}
                        <Link href="/sk/privacy" target="_blank" className="text-violet-300 underline">
                          zásad ochrany súkromia
                        </Link>
                        . *
                      </span>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(event) => setMarketingConsent(event.target.checked)}
                        className="mt-1 accent-violet-500"
                      />
                      <span>Chcem dostať užitočné tipy a pripomenutie rozpracovaného plánu. Voliteľné.</span>
                    </label>
                  </div>

                  {error && <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-2xl border border-white/10 px-5 py-4 font-semibold text-white/70"
                    >
                      Späť
                    </button>
                    <button
                      type="button"
                      onClick={saveLead}
                      disabled={isSaving || !requestId}
                      className="flex-1 rounded-2xl bg-violet-600 px-5 py-4 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? 'Ukladám…' : 'Vytvoriť môj plán'}
                    </button>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="mt-8">
                  <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Registrácia dokončená</p>
                    <h3 className="mt-2 text-2xl font-semibold">Váš Health plán je pripravený</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      Začnite ukladať výsledky, sledujte ich vývoj a vytvárajte si dlhodobú Health Card.
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/50">Fitliner Health ročný plán</p>
                        <p className="mt-1 text-3xl font-semibold">34,80 €</p>
                      </div>
                      <p className="text-right text-xs leading-5 text-white/40">2,90 € / mesiac<br />účtované ročne</p>
                    </div>
                  </div>

                  <label className="mt-5 flex items-start gap-3 text-xs leading-5 text-white/55">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      className="mt-1 accent-violet-500"
                    />
                    <span>
                      Súhlasím s{' '}
                      <Link href="/sk/terms" target="_blank" className="text-violet-300 underline">
                        obchodnými podmienkami
                      </Link>{' '}
                      a ročným automaticky obnovovaným predplatným. *
                    </span>
                  </label>

                  {error && <p className="mt-4 rounded-xl bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

                  <button
                    type="button"
                    onClick={openCheckout}
                    disabled={isCheckoutLoading}
                    className="mt-6 w-full rounded-2xl bg-violet-600 px-5 py-4 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCheckoutLoading ? 'Otváram bezpečnú platbu…' : 'Aktivovať Fitliner Health'}
                  </button>
                  <p className="mt-3 text-center text-xs text-white/35">Bezpečná platba cez Stripe</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl border-t border-white/10 py-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Prehľad pre rozhovor s odborníkom, nie diagnóza</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/55">
            Fitliner vám pomáha usporiadať a sledovať zadané údaje. Nenahrádza lekára,
            neposkytuje diagnózu a jeho informácie nemajú byť jediným podkladom pre zdravotné rozhodnutia.
          </p>
        </section>

        <footer className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Fitliner</p>
          <div className="flex gap-5">
            <Link href="/sk/privacy" className="hover:text-white">Súkromie</Link>
            <Link href="/sk/terms" className="hover:text-white">Podmienky</Link>
            <Link href="/sk/support" className="hover:text-white">Podpora</Link>
          </div>
        </footer>
      </div>

      {!trackingChoice && (
        <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#17141e]/95 p-4 shadow-2xl backdrop-blur-xl md:flex md:items-center md:gap-5">
          <p className="text-xs leading-5 text-white/65">
            Voliteľné marketingové meranie nám pomáha zistiť, ktoré reklamy fungujú. Zdravotné odpovede ani výsledky do Meta neposielame.
          </p>
          <div className="mt-3 flex shrink-0 gap-2 md:mt-0">
            <button type="button" onClick={rejectTracking} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/65">
              Odmietnuť
            </button>
            <button type="button" onClick={acceptTracking} className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold">
              Povoliť meranie
            </button>
          </div>
        </aside>
      )}
    </main>
  );
}
