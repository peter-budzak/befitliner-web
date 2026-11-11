'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { proFunnelClient, recordProStep } from './pro-funnel-client';
import styles from './start-funnel.module.css';

export function ProProfile({ flowId, onSaved }: {
  flowId: () => string;
  onSaved: (email: string, verify: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    const email = String(form.get('email')).trim().toLowerCase();
    const consent = form.get('marketing') === 'on';
    const client = proFunnelClient();
    if (!client || name.length < 2) {
      setMessage(name.length < 2 ? 'Zadaj meno s aspoň dvoma znakmi.' : 'Skús to znova o chvíľu.');
      return;
    }
    const id = flowId();
    setBusy(true);
    setMessage('');
    try {
      if (!await recordProStep(id, 7, { name, email, consent })) throw new Error();
      const { data } = await client.auth.getUser();
      if (data.user?.email?.toLowerCase() === email && data.user.email_confirmed_at) {
        const bound = await client.rpc('bind_fitliner_pro_funnel', { p_id: id });
        if (bound.error || bound.data !== true) throw new Error();
        onSaved(email, false);
        return;
      }
      const redirect = new URL('/sk/zacat', window.location.origin);
      redirect.searchParams.set('pro', 'verify');
      redirect.searchParams.set('flow', id);
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect.href },
      });
      if (error) throw error;
      onSaved(email, true);
    } catch {
      setMessage('Profil sa nepodarilo pripraviť. Skontroluj údaje a skús to znova.');
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className={styles.checkoutForm}>
    <label>Meno<input name="name" autoComplete="given-name" required minLength={2} maxLength={100} /></label>
    <label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
    <label className={styles.consent}>
      <input name="marketing" type="checkbox" />
      <span>Chcem dostať e-mailovú pripomienku a ponuky na dokončenie nákupu Fitliner PRO. Odhlásiť sa môžem v každom e-maile.</span>
    </label>
    <p className={styles.note}>E-mail použijeme na overenie profilu a platbu. <Link href="/sk/privacy">Ochrana súkromia</Link></p>
    {message && <p role="alert" className={styles.note}>{message}</p>}
    <div className={styles.actionBar}><button type="submit" className={styles.primary} disabled={busy}>Pokračovať</button></div>
  </form>;
}

export function ResumeProProfile({ flowId, offerToken }: { flowId: string; offerToken?: string }) {
  const [state, setState] = useState<'ready' | 'sending' | 'sent' | 'failed'>('ready');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email')).trim().toLowerCase();
    const client = proFunnelClient();
    if (!client || state === 'sending') return;
    setState('sending');
    try {
      const redirect = new URL('/sk/zacat?pro=verify', window.location.origin);
      redirect.searchParams.set('flow', flowId);
      if (offerToken) redirect.searchParams.set('offer', offerToken);
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect.href, shouldCreateUser: false },
      });
      setState(error ? 'failed' : 'sent');
    } catch {
      setState('failed');
    }
  }

  return <form onSubmit={submit} className={styles.checkoutForm}>
    <label>E-mail použitý pri vytvorení profilu<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
    {state === 'sent' && <p role="status" className={styles.note}>Skontroluj schránku a otvor overovací odkaz.</p>}
    {state === 'failed' && <p role="status" className={styles.note}>Odkaz sa nepodarilo poslať. Skontroluj e-mail a skús to znova.</p>}
    <div className={styles.actionBar}>
      <button className={styles.primary} type="submit" disabled={state === 'sending'}>Poslať overovací odkaz</button>
    </div>
  </form>;
}
