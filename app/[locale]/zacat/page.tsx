import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StartFunnel } from '@/components/start-funnel/start-funnel';

export const metadata: Metadata = {
  title: { absolute: 'Začni trénovať po svojom | Fitliner' },
  description: 'Pozri si svoj prvý tréning doma alebo vo fitku a zisti, ako ti Fitliner pomôže s tréningom, stravou a sledovaním progresu.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function StartPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ pro?: string | string[] }>;
}) {
  if ((await params).locale !== 'sk') notFound();
  const { pro } = await searchParams;
  const checkoutEnabled = process.env.FITLINER_PRO_CHECKOUT_ENABLED === 'true'
    && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const resumePlan = pro === 'monthly' || pro === 'annual' ? pro : undefined;
  return <StartFunnel checkoutEnabled={checkoutEnabled} resumePlan={resumePlan} checkoutReturn={pro === 'returned'} />;
}
