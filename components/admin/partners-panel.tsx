'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminClient } from '@/lib/admin/client';
type Application = { id: string; country_code: string; contact_name: string; company: string | null; email: string; phone: string; experience: string; message: string | null; status: string; created_at: string; notification_status: string; notification_error: string | null };
const statuses = { new: 'Nová', reviewing: 'Posudzovanie', contacted: 'Kontaktovaný', accepted: 'Prijatá', rejected: 'Zamietnutá' };
export default function PartnersPanel() {
  const [rows, setRows] = useState<Application[]>([]), [error, setError] = useState(''), [busy, setBusy] = useState(false), [page, setPage] = useState(0);
  const load = useCallback(async () => {
    setError(''); setBusy(true);
    try {
      const { data, error } = await adminClient().from('partner_applications').select('id,country_code,contact_name,company,email,phone,experience,message,status,created_at,notification_status,notification_error').order('created_at', { ascending: false }).range(page * 50, page * 50 + 49);
      if (error) throw Error(); setRows(data || []);
    } catch { setError('Prihlášky sa nepodarilo načítať. Skontrolujte prihlásenie a skúste to znova.'); }
    finally { setBusy(false); }
  }, [page]);
  useEffect(() => { void load(); }, [load]);
  async function change(id: string, action: string, status?: string) {
    setBusy(true); setError('');
    try {
      const { data } = await adminClient().auth.getSession();
      const r = await fetch('/api/admin/partners', { method: 'POST', headers: { Authorization: `Bearer ${data.session?.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action, status }) });
      if (!r.ok) throw Error(); await load();
    } catch { setError('Zmenu sa nepodarilo dokončiť. Prihláška zostáva uložená.'); }
    finally { setBusy(false); }
  }
  return <section className="ad-panel">
    <h2>Partners — prijaté prihlášky</h2>
    <p>Prijatie prihlášky samo osebe neudeľuje exkluzivitu ani nevytvára zmluvu.</p>
    <button className="ad-button" onClick={load} disabled={busy}>Obnoviť prihlášky</button>
    {error && <p role="alert">{error}</p>}
    {!busy && !error && rows.length === 0 && <p>Žiadne prihlášky na tejto strane.</p>}
    {rows.map(row => <article key={row.id} style={{ padding: '24px 0', borderBottom: '1px solid #333', overflowWrap: 'anywhere' }}>
      <h3>{row.country_code} · {row.contact_name}</h3>
      <p>{row.company || 'Bez spoločnosti'} · {new Date(row.created_at).toLocaleString('sk-SK')}</p>
      <p><a href={`mailto:${row.email}`}>{row.email}</a> · {row.phone}</p>
      <p style={{ whiteSpace: 'pre-wrap' }}>{row.experience}</p><p style={{ whiteSpace: 'pre-wrap' }}>{row.message}</p>
      <label>Stav prihlášky <select value={row.status} disabled={busy} onChange={e => void change(row.id, 'status', e.target.value)}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <p>E-mail: {row.notification_status}{row.notification_error ? ` (${row.notification_error})` : ''}</p>
      {['pending', 'failed'].includes(row.notification_status) && <button className="ad-button" disabled={busy} onClick={() => void change(row.id, 'notify')}>Odoslať upozornenie</button>}
      {row.notification_status === 'accepted' && <button className="ad-button" disabled={busy} onClick={() => void change(row.id, 'check')}>Overiť doručenie</button>}
      {['sending','unknown'].includes(row.notification_status) && <p>Pred opakovaním overte správu v MailerSend podľa ID prihlášky. Automatické opakovanie je pozastavené, aby nevznikla duplicita.</p>}
      <small>ID: {row.id}</small>
    </article>)}
    <div style={{ display: 'flex', gap: 16, marginTop: 20 }}><button className="ad-button" disabled={busy || page === 0} onClick={() => setPage(page - 1)}>Predchádzajúce</button><span>Strana {page + 1}</span><button className="ad-button" disabled={busy || rows.length < 50} onClick={() => setPage(page + 1)}>Ďalšie</button></div>
  </section>;
}
