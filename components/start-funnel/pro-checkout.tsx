'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { PlanId } from './offer';
import styles from './start-funnel.module.css';

export function ProCheckout({ plan }: { plan: PlanId }) {
  const client = useRef<SupabaseClient | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    const instance = client.current ??= createClient(url, key);
    const { data } = instance.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!client.current || busy) return;
    setBusy(true);
    setMessage('');
    try {
      if (!signedIn) {
        const redirect = new URL('/sk/zacat', window.location.origin);
        redirect.searchParams.set('pro', plan);
        const { error } = await client.current.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: redirect.href },
        });
        if (error) throw error;
        setMessage('Skontroluj e-mail a otvor prihlasovací odkaz. Vráti ťa k vybranému plánu.');
        return;
      }
      const { data, error } = await client.current.functions.invoke('stripe-create-pro-checkout', { body: { plan } });
      if (error) {
        if ('context' in error && error.context instanceof Response && error.context.status === 409) {
          setMessage('Už máš otvorený checkout. Dokonči ho alebo počkaj, kým vyprší.');
          return;
        }
        throw error;
      }
      if (data?.already_active === true) {
        setMessage('Fitliner PRO už máš aktívny. Otvor aplikáciu s týmto účtom.');
        return;
      }
      const url = new URL(data?.checkout_url ?? '');
      if (url.origin !== 'https://checkout.stripe.com') throw new Error('Invalid checkout URL');
      window.location.assign(url.href);
    } catch {
      setMessage('Teraz sa nedá pokračovať. Skús to znova o chvíľu.');
    } finally {
      setBusy(false);
    }
  }

  if (signedIn === null) return <p className={styles.note} role="status">Pripravujeme prihlásenie…</p>;
  return <form onSubmit={submit} className={styles.checkoutForm}>
    {!signedIn && <label>
      E-mail k účtu Fitliner
      <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
    </label>}
    <button className={styles.primary} type="submit" disabled={busy}>
      {signedIn ? 'Pokračovať k platbe' : 'Poslať prihlasovací odkaz'}
    </button>
    {message && <p className={styles.note} role="status">{message}</p>}
  </form>;
}
