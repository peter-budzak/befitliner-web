import {isTrainerLocale} from './app/trainers/trainer-locale';
import {reserved,validSlug} from './lib/public-profiles/model';
import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAINS = new Set([
  "befitliner.com",
  "www.befitliner.com",
  "localhost:3000",
  "localhost",
]);

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "support",
  "mail",
  "email",
  "cdn",
  "static",
]);

const LOCALES = new Set(["en", "sk", "de", "es", "fr", "zh-Hans"]);

function getGymSlugFromHost(hostHeader: string | null) {
  if (!hostHeader) return null;

  const rawHost = hostHeader.toLowerCase();
  const host = rawHost.split(":")[0];

  if (ROOT_DOMAINS.has(rawHost) || ROOT_DOMAINS.has(host)) {
    return null;
  }

  if (!host.endsWith(".befitliner.com")) {
    return null;
  }

  const slug = host.replace(".befitliner.com", "");

  if (!slug || slug.includes(".") || RESERVED_SUBDOMAINS.has(slug)) {
    return null;
  }

  return slug;
}

function localeRequestHeaders(request: NextRequest, locale: string | null) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-fitliner-locale",
    locale && isTrainerLocale(locale) ? locale : "en",
  );
  return requestHeaders;
}

export async function proxy(request: NextRequest) {
  const rawHost = request.headers.get("host")?.toLowerCase() ?? "";

  if (rawHost === "befitliner.com") {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.hostname = "www.befitliner.com";
    canonicalUrl.port = "";
    return NextResponse.redirect(canonicalUrl, 308);
  }

  if (request.nextUrl.pathname === "/app" || request.nextUrl.pathname.startsWith("/app/")) {
    const securityHeaders = {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "frame-ancestors 'self'",
    };
    if (process.env.FITLINER_WEB_APP_ENABLED !== "true") {
      return new NextResponse(null, {status: 404, headers: securityHeaders});
    }
    if (request.nextUrl.pathname === "/app" || request.nextUrl.pathname === "/app/") {
      return NextResponse.redirect(new URL("/app/index.html", request.url), {status: 307, headers: securityHeaders});
    }
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }

  const adminHost = rawHost.split(":")[0] === "admin.befitliner.com";
  if (
    adminHost ||
    request.nextUrl.pathname === "/admin" ||
    request.nextUrl.pathname.startsWith("/admin/")
  ) {
    const url = request.nextUrl.clone();
    if (adminHost && url.pathname === "/") url.pathname = "/admin";
    const options = {
      request: { headers: localeRequestHeaders(request, "sk") },
    };
    const response =
      adminHost && url.pathname !== request.nextUrl.pathname
        ? NextResponse.rewrite(url, options)
        : NextResponse.next(options);
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "same-origin");
    response.headers.set("X-Frame-Options", "DENY");
    return response;
  }

  const slug = getGymSlugFromHost(request.headers.get("host"));
  const pathLocale =
    request.nextUrl.pathname.split("/").filter(Boolean)[0] ?? null;

  const trainerRoute = request.nextUrl.pathname.match(/^\/trainers\/[a-z][a-z0-9-]{2,63}(?:\/([^/]+))?\/?$/);
  if (!slug && trainerRoute) {
    return NextResponse.next({request:{headers:localeRequestHeaders(request, trainerRoute[1] || 'sk')}});
  }
  // Preserve published legacy trainer storefronts at their existing short URLs.
  const shortSlug=request.nextUrl.pathname.match(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)?.[1];
  if (!slug && shortSlug && !reserved.has(shortSlug) && process.env.TRAINER_STOREFRONT_ENABLED==='true') {
    if (process.env.FITLINER_PUBLIC_PROFILES_ENABLED!=='true') {
      const url=request.nextUrl.clone();url.pathname=`/trainers/${shortSlug}`;
      return NextResponse.rewrite(url,{request:{headers:localeRequestHeaders(request,'sk')}});
    }
    try {
      const result=await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/web_public_entity_v1`,{
        method:'POST',headers:{'Content-Type':'application/json',apikey:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY??''},
        body:JSON.stringify({p_kind:'trainer',p_slug:shortSlug}),cache:'no-store',signal:AbortSignal.timeout(4000)
      });
      if(!result.ok)throw new Error('Directory unavailable');
      if(await result.json()) {
        const url=request.nextUrl.clone();url.pathname=`/trainers/${shortSlug}`;
        return NextResponse.rewrite(url,{request:{headers:localeRequestHeaders(request,'sk')}});
      }
    } catch {return new NextResponse('Temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
  }

  if (!slug && process.env.FITLINER_PUBLIC_PROFILES_ENABLED === 'true') {
    const parts=request.nextUrl.pathname.split('/').filter(Boolean);
    if ((parts.length===1 || (parts.length===2 && (LOCALES.has(parts[1]) || parts[1]==='pl'))) &&
        validSlug(parts[0]??'') && !reserved.has(parts[0])) {
      const language=parts[1]??'sk';
      const url=request.nextUrl.clone();url.pathname=`/u/${parts[0]}/${language}`;
      const response=NextResponse.rewrite(url,{request:{headers:localeRequestHeaders(request,language)}});
      response.headers.set('Cache-Control','private, no-store');
      return response;
    }
  }

  if (!slug) {
    return NextResponse.next({
      request: { headers: localeRequestHeaders(request, /^\/(u|t|g|gym)\//.test(request.nextUrl.pathname) ? (request.nextUrl.pathname.split('/')[3] || 'sk') : pathLocale) },
    });
  }

  const url = request.nextUrl.clone();
  const path = url.pathname;

  if (path === '/permanentky' || path === '/permanentky/' || path === '/akcia' || path === '/akcia/') {
    url.pathname=`/g/${slug}/sk/${path.split('/')[1]}`;
    return NextResponse.rewrite(url,{request:{headers:localeRequestHeaders(request,'sk')}});
  }

  if (path === "/") {
    url.pathname = `/g/${slug}/sk`;
    return NextResponse.rewrite(url, {
      request: { headers: localeRequestHeaders(request, "sk") },
    });
  }

  const maybeLocale = path.replace("/", "");

  if (LOCALES.has(maybeLocale)) {
    url.pathname = `/g/${slug}/${maybeLocale}`;
    return NextResponse.rewrite(url, {
      request: { headers: localeRequestHeaders(request, maybeLocale) },
    });
  }

  return NextResponse.next({
    request: { headers: localeRequestHeaders(request, /^\/(u|t|g|gym)\//.test(request.nextUrl.pathname) ? (request.nextUrl.pathname.split('/')[3] || 'sk') : pathLocale) },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
