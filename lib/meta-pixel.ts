'use client';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '475851925437843';
export const MARKETING_CONSENT_KEY = 'fitliner_marketing_tracking_consent';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/** Caller controls tracking preferences. Returns true only when initialized here. */
export function ensureMetaPixel() {
  if (!PIXEL_ID || window.fbq) return false;
  const fbq = (...args: unknown[]) => {
    (fbq as unknown as {queue: unknown[][]}).queue.push(args);
  };
  Object.assign(fbq, {queue: [], loaded: true, version: '2.0'});
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
  return true;
}
