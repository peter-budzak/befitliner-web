'use client';

import { useEffect, useState } from 'react';
import { adminClient } from '@/lib/admin/client';

const steps = ['Úvod', 'Výhody', 'Cieľ', 'Miesto', 'Čas', 'Ukážka tréningu', 'Profil', 'Ponuka', 'Stripe', 'Zaplatené'];
const emails = ['Pripomienka', '20 % zľava', '30 % zľava'];
const mailStatus: Record<string, string> = { sending: 'spracúva sa', sent: 'odoslané', failed: 'chyba', skipped: 'preskočené' };
type Report = {
  steps: Record<string, number>;
  leads: Array<{
    id: string; name: string; email: string; step: number; submitted_at: string; verified_at: string | null;
    consent_at: string | null; unsubscribed_at: string | null;
    mail: Array<{ sequence: number; status: string }>;
  }>;
};

export default function ProFunnelPanel() {
  const [report, setReport] = useState<Report>();
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let mounted = true;
    void adminClient().rpc('admin_fitliner_pro_funnel').then(({ data, error }) => {
      if (!mounted) return;
      if (error) setError(true);
      else setReport(data as Report);
    });
    return () => { mounted = false; };
  }, [refresh]);

  function reload() {
    setError(false);
    setReport(undefined);
    setRefresh(value => value + 1);
  }
  if (error) return <p role="alert">Prehľad sa nepodarilo načítať. <button className="ad-button" onClick={reload}>Skúsiť znova</button></p>;
  if (!report) return <p role="status">Načítavam prehľad…</p>;
  return <section className="ad-panel">
    <button className="ad-button" onClick={reload}>Obnoviť prehľad</button>
    <h3>Posledný dosiahnutý krok za 30 dní</h3>
    <table>
      <thead><tr><th scope="col">Krok</th><th scope="col">Návštevy</th></tr></thead>
      <tbody>{steps.map((step, index) => <tr key={step}><th scope="row">{step}</th><td>{report.steps[index + 1] ?? 0}</td></tr>)}</tbody>
    </table>
    <h3>Posledné odoslané profily</h3>
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead><tr><th scope="col">Profil</th><th scope="col">Odoslaný</th><th scope="col">Krok</th><th scope="col">E-mail</th><th scope="col">Pripomienky</th></tr></thead>
        <tbody>{report.leads.map(lead => <tr key={lead.id}>
          <th scope="row">{lead.name}<br />{lead.email}</th>
          <td>{new Date(lead.submitted_at).toLocaleString('sk-SK')}</td>
          <td>{steps[lead.step - 1]}</td>
          <td>{lead.verified_at ? 'Overený' : 'Neoverený'}</td>
          <td>{lead.unsubscribed_at ? 'Odhlásené' : lead.consent_at ? 'Súhlas' : 'Bez súhlasu'}
            {lead.mail.map(item => <div key={item.sequence}>{emails[item.sequence - 1]} · {mailStatus[item.status]}</div>)}
          </td>
        </tr>)}</tbody>
      </table>
    </div>
    {report.leads.length === 0 && <p>Zatiaľ nemáme žiadne odoslané profily.</p>}
  </section>;
}
