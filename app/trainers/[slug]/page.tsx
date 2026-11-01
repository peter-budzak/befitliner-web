import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cache } from 'react';
import TrainerStorefront from './storefront';
export const dynamic = 'force-dynamic';
const trainer = cache(async (slug: string) => {
  if (process.env.TRAINER_STOREFRONT_ENABLED !== 'true' || !/^[a-z][a-z0-9-]{2,63}$/.test(slug)) notFound();
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/trainer-commerce`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' },
    body: JSON.stringify({ action: 'public', slug }), cache: 'no-store',
  });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Trainer page temporarily unavailable');
  return response.json();
});
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug}=await params;
  const {profile}=await trainer(slug);
  const title=`Fitliner tréner ${profile.display_name}`;
  const description=profile.bio || `Objednaj sa na tréning u ${profile.display_name}.`;
  const origin=process.env.TRAINER_PUBLIC_ORIGIN || (process.env.VERCEL_ENV==='preview' && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://befitliner.com');
  const url=`${origin}/${slug}`;
  const images=typeof profile.photo_url==='string' && profile.photo_url.startsWith('https://') ? [{url:profile.photo_url,alt:profile.display_name}] : [];
  return {title:{absolute:title},description,alternates:{canonical:url},openGraph:{type:'profile',title,description,url,siteName:'Fitliner',images},twitter:{card:'summary',title,description,images:images.map(image=>image.url)}};
}
export default async function TrainerPage({ params }: Props) {
  const { slug } = await params;
  const data = await trainer(slug);
  return <TrainerStorefront profile={data.profile} offers={data.offers} appScheme={process.env.TRAINER_APP_RETURN_URL === 'befitliner-staging://' ? 'befitliner-staging' : 'befitliner'} />;
}
