import type { Metadata } from "next";
import seoCopy from "@/messages/page-seo.json";
import { absoluteUrl, isSiteLocale, SITE_URL } from "@/lib/seo";
import {
  FEATURE_LOCALES,
  featureCopy,
  type FeatureLocale,
} from "@/lib/features";
import { getPartnerCopy } from "@/lib/partners/copy";
import { getPartnerFaq } from "@/lib/partners/faq";
import { PARTNER_OG_LOCALES } from "@/lib/partners/locales";
export type DiscoveryPage = "features" | "partners";
export const socialImage = (page: DiscoveryPage, locale: FeatureLocale) =>
  absoluteUrl(`/og/pages/${page}-${locale}-v1.jpg`);
export function discoveryMetadata(
  page: DiscoveryPage,
  locale: FeatureLocale,
): Metadata {
  const { title, description } = seoCopy[locale][page];
  const url = absoluteUrl(`/${locale}/${page}`);
  const image = {
    url: socialImage(page, locale),
    secureUrl: socialImage(page, locale),
    type: "image/jpeg",
    width: 1200,
    height: 630,
    alt: title,
  };
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries([
        ...FEATURE_LOCALES.map((l) => [l, absoluteUrl(`/${l}/${page}`)]),
        ["x-default", absoluteUrl(`/en/${page}`)],
      ]),
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: "Fitliner",
      title,
      description,
      locale: PARTNER_OG_LOCALES[locale],
      alternateLocale: FEATURE_LOCALES.filter((l) => l !== locale).map(
        (l) => PARTNER_OG_LOCALES[l],
      ),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.url, alt: title }],
    },
  };
}
export function discoverySchema(page: DiscoveryPage, locale: FeatureLocale) {
  const { title, description } = seoCopy[locale][page];
  const url = absoluteUrl(`/${locale}/${page}`);
  const feature = featureCopy(locale);
  const homeLocale = isSiteLocale(locale) ? locale : "en";
  const image = {
    "@type": "ImageObject",
    "@id": `${url}#image`,
    url: socialImage(page, locale),
    contentUrl: socialImage(page, locale),
    width: 1200,
    height: 630,
    caption: title,
    inLanguage: locale,
  };
  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: feature.home,
        item: absoluteUrl(`/${homeLocale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name:
          page === "features"
            ? feature.title
            : getPartnerCopy(locale)["Become a Fitliner Country Partner"],
        item: url,
      },
    ],
  };
  const webPage = {
    "@type": page === "features" ? "CollectionPage" : "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    primaryImageOfPage: { "@id": image["@id"] },
    breadcrumb: { "@id": breadcrumb["@id"] },
  };
  if (page === "features") {
    const app = {
      "@type": "MobileApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Fitliner",
      url: absoluteUrl(`/${homeLocale}`),
      applicationCategory: "HealthApplication",
      operatingSystem: "iOS, Android",
      publisher: { "@id": `${SITE_URL}/#organization` },
      featureList: feature.sections.map(
        (s) => `${s.title}: ${s.items.join(" ")}`,
      ),
      description: feature.intro,
      installUrl: [
        process.env.NEXT_PUBLIC_APPSTORE_URL ||
          "https://apps.apple.com/app/id6760855966",
        process.env.NEXT_PUBLIC_PLAYSTORE_URL ||
          "https://play.google.com/store/apps/details?id=com.fitliner.app",
      ],
    };
    const list = {
      "@type": "ItemList",
      "@id": `${url}#feature-list`,
      name: feature.all,
      numberOfItems: feature.sections.length,
      itemListElement: feature.sections.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "WebPageElement",
          "@id": `${url}#feature-${s.id}`,
          url: `${url}#feature-${s.id}`,
          name: s.title,
          description: `${s.summary} ${s.items.join(" ")}`,
          inLanguage: locale,
        },
      })),
    };
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          ...webPage,
          about: { "@id": app["@id"] },
          mainEntity: { "@id": list["@id"] },
          hasPart: {
            "@type": "WebPageElement",
            "@id": `${url}#availability`,
            name: feature.availabilityTitle,
            description: `${feature.availability} ${feature.rollout}`,
          },
        },
        image,
        breadcrumb,
        app,
        list,
      ],
    };
  }
  const copy = getPartnerCopy(locale);
  const faq = {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    url: `${url}#faq`,
    inLanguage: locale,
    mainEntity: getPartnerFaq(copy).map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...webPage,
        about: {
          "@type": "Thing",
          name: copy["COUNTRY PARTNER PROGRAM"],
          description:
            copy[
              "Build the Fitliner gym network in your country and participate in its revenue."
            ],
        },
        hasPart: { "@id": faq["@id"] },
      },
      image,
      breadcrumb,
      faq,
    ],
  };
}
