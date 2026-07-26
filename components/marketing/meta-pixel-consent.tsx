'use client';

import {useEffect, useState} from 'react';

const CONSENT_KEY = 'fitliner_marketing_tracking_consent_v1';
const CONSENT_EVENT = 'fitliner-meta-consent-changed';

type ConsentValue = 'granted' | 'denied';
type MetaParameters = Record<string, string | number | boolean | string[]>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

let pixelInitialized = false;

function currentConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === 'granted' || value === 'denied' ? value : null;
}

function initializePixel() {
  if (typeof window === 'undefined' || pixelInitialized) return;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (!pixelId || currentConsent() !== 'granted') return;

  const fbq = function (...args: unknown[]) {
    const queue = (fbq as typeof fbq & {queue?: unknown[][]}).queue ?? [];
    queue.push(args);
    (fbq as typeof fbq & {queue?: unknown[][]}).queue = queue;
  } as typeof window.fbq & {loaded?: boolean; version?: string; queue?: unknown[][]};
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = window.fbq ?? fbq;
  window._fbq = window._fbq ?? window.fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.dataset.fitlinerMetaPixel = 'true';
  document.head.appendChild(script);

  window.fbq?.('consent', 'grant');
  window.fbq?.('init', pixelId);
  window.fbq?.('track', 'PageView');
  pixelInitialized = true;
}

export function hasMarketingTrackingConsent(): boolean {
  return currentConsent() === 'granted';
}

export function trackMetaEvent(
  eventName: string,
  parameters: MetaParameters = {},
  eventId?: string,
) {
  initializePixel();
  if (!hasMarketingTrackingConsent() || !window.fbq) return;
  const options = eventId ? {eventID: eventId} : undefined;
  window.fbq('track', eventName, parameters, options);
}

export function trackMetaCustomEvent(
  eventName: string,
  parameters: MetaParameters = {},
) {
  initializePixel();
  if (!hasMarketingTrackingConsent() || !window.fbq) return;
  window.fbq('trackCustom', eventName, parameters);
}

const bannerCopy: Record<string, {title: string; body: string; accept: string; reject: string; settings: string}> = {
  sk: {title: 'Súkromie máš pod kontrolou', body: 'S tvojím súhlasom použijeme Meta Pixel na meranie reklám a zlepšovanie Health ponuky. Bez súhlasu sa marketingové meranie nespustí.', accept: 'Povoliť meranie', reject: 'Odmietnuť', settings: 'Cookies'},
  de: {title: 'Du behältst die Kontrolle', body: 'Mit deiner Einwilligung nutzen wir das Meta Pixel zur Anzeigenmessung. Ohne Einwilligung startet kein Marketing-Tracking.', accept: 'Messung erlauben', reject: 'Ablehnen', settings: 'Cookies'},
  es: {title: 'Tú controlas tu privacidad', body: 'Con tu permiso usamos Meta Pixel para medir anuncios. Sin consentimiento no se inicia el seguimiento publicitario.', accept: 'Permitir medición', reject: 'Rechazar', settings: 'Cookies'},
  fr: {title: 'Vous gardez le contrôle', body: 'Avec votre accord, nous utilisons Meta Pixel pour mesurer les publicités. Sans accord, aucun suivi marketing ne démarre.', accept: 'Autoriser la mesure', reject: 'Refuser', settings: 'Cookies'},
  'zh-Hans': {title: '隐私由你掌控', body: '经你同意后，我们会使用 Meta Pixel 衡量广告效果。不同意则不会启动营销追踪。', accept: '允许衡量', reject: '拒绝', settings: 'Cookies'},
  en: {title: 'You control your privacy', body: 'With your consent, we use Meta Pixel to measure ads and improve the Health offer. Marketing tracking stays off without consent.', accept: 'Allow measurement', reject: 'Decline', settings: 'Cookies'},
};

function pageLocale(): string {
  if (typeof window === 'undefined') return 'en';
  const locale = window.location.pathname.split('/').filter(Boolean)[0];
  return bannerCopy[locale] ? locale : 'en';
}

export default function MetaPixelConsent() {
  const [choice, setChoice] = useState<ConsentValue | null>(null);
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const saved = currentConsent();
    if (saved === 'granted') initializePixel();
    const timer = window.setTimeout(() => {
      setChoice(saved);
      setOpen(saved === null);
      setLocale(pageLocale());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const choose = (value: ConsentValue) => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setChoice(value);
    setOpen(false);
    if (value === 'granted') initializePixel();
    if (value === 'denied') window.fbq?.('consent', 'revoke');
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, {detail: value}));
  };

  if (!process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()) return null;
  const t = bannerCopy[locale] ?? bannerCopy.en;

  return <>
    {open && <div className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-white/15 bg-[#121218]/95 p-5 text-white shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <h2 className="text-base font-bold">{t.title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/65">{t.body}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => choose('granted')} className="min-h-12 rounded-xl bg-[#8B5CF6] px-4 py-3 text-sm font-bold">{t.accept}</button>
        <button type="button" onClick={() => choose('denied')} className="min-h-12 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white/80">{t.reject}</button>
      </div>
    </div>}
    {choice !== null && !open && <button type="button" onClick={() => setOpen(true)} className="fixed bottom-3 left-3 z-[90] rounded-full border border-white/12 bg-[#121218]/90 px-3 py-2 text-[11px] font-semibold text-white/55 backdrop-blur-xl">{t.settings}</button>}
  </>;
}
