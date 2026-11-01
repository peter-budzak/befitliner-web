import {publicPageCount} from '@/lib/public-profiles/data';
import {SITE_URL} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function GET(){
 const pages=await publicPageCount();
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Array.from({length:pages},(_,i)=>`<sitemap><loc>${SITE_URL}/profile-sitemap/${i}</loc></sitemap>`).join('')}</sitemapindex>`,{headers:{'Content-Type':'application/xml','Cache-Control':'private, no-store'}});
}
