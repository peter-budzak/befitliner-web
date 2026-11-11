'use client';

import { useState, type FormEvent } from 'react';
import type { PlanId } from './offer';
import { proFunnelClient } from './pro-funnel-client';
import styles from './start-funnel.module.css';

export function ProCheckout({ plan, flowId, offerToken }: {
  plan: PlanId;
  flowId: string;
  offerToken?: string;
}) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const client = proFunnelClient();
    if (!client || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const { data, error } = await client.functions.invoke('stripe-create-pro-checkout', {
        body: { plan, flow_id: flowId, offer_token: offerToken },
      });
      if (error) {
        if ('context' in error && error.context instanceof Response && error.context.status === 409) {
          setMessage('Otvorenú platbu dokonči alebo počkaj, kým vyprší. Ak platnosť zľavy vypršala, otvor ponuku znova.');
          return;
        }
        throw error;
      }
      if (data?.already_active) {
        setMessage('Fitliner PRO už máš aktívny. Otvor aplikáciu s týmto účtom.');
        return;
      }
      const url = new URL(data?.checkout_url ?? '');
      if (url.origin !== 'https://checkout.stripe.com') throw new Error();
      window.location.assign(url.href);
    } catch {
      setMessage('Teraz sa nedá pokračovať. Skús to znova o chvíľu.');
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className={styles.checkoutForm}>
    {message && <p className={styles.note} role="status">{message}</p>}
    <div className={styles.actionBar}>
      <button className={styles.primary} type="submit" disabled={busy}>Pokračovať k platbe</button>
    </div>
  </form>;
}
