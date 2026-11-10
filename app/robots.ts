import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/login", "/admin", "/admin/", "/api/", "/*/health/success"],
    },
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      ...(process.env.TRAINER_STOREFRONT_ENABLED==='true'?[`${SITE_URL}/trainers/sitemap.xml`]:[]),
      ...(process.env.FITLINER_PUBLIC_PROFILES_ENABLED==='true'?[`${SITE_URL}/profiles-sitemap.xml`]:[])
    ],
    host: SITE_URL,
  };
}
