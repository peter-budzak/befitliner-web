import {publicEntities} from '@/lib/public-profiles/data';
import {entityPath,profileLocales} from '@/lib/public-profiles/model';
import {SITE_URL} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{page:string}>}){
 const {page}=await params;if(!/^(0|[1-9][0-9]{0,5})$/.test(page))return new Response(null,{status:404});
 const rows=await publicEntities(Number(page));
 const urls=rows.flatMap(r=>profileLocales.map(l=>`<url><loc>${SITE_URL}${entityPath(r.kind,r.slug,l,r.scoped)}</loc>${profileLocales.map(a=>`<xhtml:link rel="alternate" hreflang="${a}" href="${SITE_URL}${entityPath(r.kind,r.slug,a,r.scoped)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${entityPath(r.kind,r.slug,'sk',r.scoped)}"/></url>`));
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`,{headers:{'Content-Type':'application/xml','Cache-Control':'private, no-store'}});
}
