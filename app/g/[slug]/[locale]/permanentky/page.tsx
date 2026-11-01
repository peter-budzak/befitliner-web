import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Permanentky | Fitliner' };

export default async function MembershipsPage({ params }: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const sk = locale === 'sk';
  const { data, error } = await supabase.rpc('get_public_gym_by_slug', { input_slug: slug });
  if (error) throw new Error('Gym unavailable');
  const gym = data?.[0];
  if (!gym) notFound();
  return <main style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px', minHeight: '80vh' }}>
    <a href={`https://${gym.slug}.befitliner.com`}>← {gym.name}</a>
    <h1 style={{ fontSize: 40, marginTop: 40 }}>{sk ? 'Kúpiť permanentku' : 'Buy membership'}</h1>
    <p>{sk ? 'Otvor Fitliner a vyber si permanentku tohto gymu. Cenu a nákup potvrdíš v aplikácii.' : 'Open Fitliner and choose a membership for this gym. Confirm the price and purchase in the app.'}</p>
    <a href={`befitliner://memberships/${encodeURIComponent(gym.slug)}`} style={{ display: 'inline-block', padding: '16px 24px', margin: '24px 0', background: '#00e5ff', color: '#111', borderRadius: 12, fontWeight: 700 }}>{sk ? 'Otvoriť permanentky v aplikácii' : 'Open memberships in the app'}</a>
    <p>{sk ? 'Ak sa aplikácia neotvorí, nainštaluj alebo aktualizuj Fitliner a potom sa vráť na túto stránku. Na počítači otvor tento odkaz na telefóne.' : 'If the app does not open, install or update Fitliner, then return to this page. On a computer, open this link on your phone.'}</p>
    <p><a href="https://apps.apple.com/sk/app/fitliner/id6760855966">App Store</a> · <a href="https://play.google.com/store/apps/details?id=com.fitliner.app">Google Play</a></p>
    <p>{sk ? 'Ak gym nemá dostupné permanentky, kontaktuj priamo gym.' : 'If no memberships are available, contact the gym directly.'}</p>
  </main>;
}
