import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Aktuálna akcia | Fitliner' };
export default async function PromotionPage({ params }: { params: Promise<{slug:string;locale:string}> }) {
  const {slug,locale}=await params;
  const sk=locale==='sk';
  const [{data:gyms,error:gymError},{data,error}]=await Promise.all([
    supabase.rpc('get_public_gym_by_slug',{input_slug:slug}),
    supabase.rpc('get_public_gym_promotion',{input_slug:slug}),
  ]);
  if(gymError) throw new Error('Gym unavailable');
  const gym=gyms?.[0];
  if(!gym) notFound();
  if(error) throw new Error('Promotion unavailable');
  const promotion=data?.[0];
  const safeLink=promotion?.link_url && /^https:\/\/[A-Za-z0-9][A-Za-z0-9.-]+(:443)?(\/[^\s]*)?$/.test(promotion.link_url);
  const membershipLink = promotion?.link_url === `https://${gym.slug}.befitliner.com/permanentky`;
  const buttonUrl = membershipLink ? `befitliner://memberships/${encodeURIComponent(gym.slug)}` : promotion?.link_url;
  return <main style={{maxWidth:760,margin:'0 auto',padding:'64px 24px',minHeight:'80vh'}}>
    <a href={`https://${gym.slug}.befitliner.com`}>← {gym.name}</a>
    <p style={{marginTop:40}}>{sk?'Aktuálna akcia':'Current promotion'}</p>
    <h1 style={{fontSize:'clamp(32px,6vw,56px)',fontWeight:800}}>{promotion?.title??(sk?'Momentálne nemáme zverejnenú akciu':'No current promotion')}</h1>
    {promotion && <>
      <p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:20,lineHeight:1.7,margin:'28px 0'}}>{promotion.description}</p>
      {safeLink && <a href={buttonUrl} rel="noopener noreferrer" style={{display:'inline-block',padding:'16px 24px',background:'#00e5ff',color:'#111',borderRadius:12,fontWeight:700}}>{promotion.link_label}</a>}
      {membershipLink && <p style={{marginTop:16}}><a href={`https://${gym.slug}.befitliner.com/permanentky`}>{sk ? 'Aplikácia sa neotvorila? Inštalácia a pomoc' : 'App did not open? Installation and help'}</a></p>}
    </>}
  </main>;
}
