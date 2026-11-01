import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/login", "/admin", "/admin/", "/api/", "/*/health/success"],
    },
    sitemap: process.env.FITLINER_PUBLIC_PROFILES_ENABLED==='true' ? [`${SITE_URL}/sitemap.xml`,`${SITE_URL}/profiles-sitemap.xml`] : `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
