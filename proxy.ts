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
    locale && LOCALES.has(locale) ? locale : "en",
  );
  return requestHeaders;
}

export function proxy(request: NextRequest) {
  const rawHost = request.headers.get("host")?.toLowerCase() ?? "";

  if (rawHost === "befitliner.com") {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.hostname = "www.befitliner.com";
    canonicalUrl.port = "";
    return NextResponse.redirect(canonicalUrl, 308);
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

  if (!slug) {
    return NextResponse.next({
      request: { headers: localeRequestHeaders(request, pathLocale) },
    });
  }

  const url = request.nextUrl.clone();
  const path = url.pathname;

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
    request: { headers: localeRequestHeaders(request, pathLocale) },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
