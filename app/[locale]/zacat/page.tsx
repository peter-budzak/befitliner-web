import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StartFunnel } from '@/components/start-funnel/start-funnel';

export const metadata: Metadata = {
  title: { absolute: 'Začni trénovať po svojom | Fitliner' },
  description: 'Pozri si svoj prvý tréning doma alebo vo fitku a zisti, ako ti Fitliner pomôže s tréningom, stravou a sledovaním progresu.',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function StartPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pro?: string | string[]; flow?: string | string[]; offer?: string | string[] }>;
}) {
  if ((await params).locale !== 'sk') notFound();
  const { pro, flow, offer } = await searchParams;
  const checkoutEnabled = process.env.FITLINER_PRO_CHECKOUT_ENABLED === 'true'
    && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const resumePlan = pro === 'monthly' || pro === 'annual' ? pro : undefined;
  const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
  const resumeFlow = typeof flow === 'string' && uuid.test(flow) ? flow : undefined;
  const offerToken = typeof offer === 'string' && uuid.test(offer) ? offer : undefined;
  return <StartFunnel checkoutEnabled={checkoutEnabled} resumePlan={resumePlan}
    checkoutReturn={pro === 'returned'} resumeFlow={resumeFlow} offerToken={offerToken} verify={pro === 'verify'} />;
}
