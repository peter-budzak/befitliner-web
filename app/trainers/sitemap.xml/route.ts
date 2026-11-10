import {SITE_URL} from '@/lib/seo';
import {trainerLocales,trainerPath} from '../trainer-locale';
export const dynamic='force-dynamic';
async function slugs(after:string):Promise<string[]> {
  const r=await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL+'/rest/v1/rpc/trainer_sitemap_slugs',{
    method:'POST',headers:{'Content-Type':'application/json',apikey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY??''},
    body:JSON.stringify({p_after:after}),next:{revalidate:300}
  });
  if(!r.ok)throw Error('Sitemap unavailable');
  return (await r.json() as {slug:string}[]).map(row=>row.slug);
}
const xml=(body:string)=>new Response('<?xml version="1.0" encoding="UTF-8"?>'+body,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, s-maxage=300'}});
export async function GET(request:Request){
  if(process.env.TRAINER_STOREFRONT_ENABLED!=='true')return new Response(null,{status:404});
  const page=new URL(request.url).searchParams.get('after');
  const root='xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  if(page!==null){
    if(page && !/^[a-z][a-z0-9-]{2,63}$/.test(page))return new Response(null,{status:404});
    const rows=(await slugs(page)).slice(0,100);
    return xml(`<urlset ${root}>${rows.flatMap(s=>trainerLocales.map(l=>`<url><loc>${SITE_URL}${trainerPath(encodeURIComponent(s),l)}</loc></url>`)).join('')}</urlset>`);
  }
  const pages:string[]=[];
  let after='';
  while(true){
    const rows=await slugs(after);
    pages.push(`<sitemap><loc>${SITE_URL}/trainers/sitemap.xml?after=${encodeURIComponent(after)}</loc></sitemap>`);
    if(rows.length<=100)break;
    after=rows[99];
  }
  return xml(`<sitemapindex ${root}>${pages.join('')}</sitemapindex>`);
}
