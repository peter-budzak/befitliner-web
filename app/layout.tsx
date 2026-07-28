import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import JsonLd from "@/components/seo/json-ld";
import { HOME_SEO, LEGAL_NAME, LOCALES, SITE_NAME, SITE_URL, SUPPORT_EMAIL } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_SEO.en.title,
    template: "%s | Fitliner",
  },
  description: HOME_SEO.en.description,
  applicationName: SITE_NAME,
  category: "fitness",
  creator: LEGAL_NAME,
  publisher: LEGAL_NAME,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png", sizes: "1024x1024" }],
    apple: [{ url: "/icon.png", type: "image/png", sizes: "1024x1024" }],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  itunes: {
    appId: "6760855966",
    appArgument: SITE_URL,
  },
  formatDetection: { telephone: false },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: HOME_SEO.en.title,
    description: HOME_SEO.en.description,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/og/gym-default.png",
        width: 1200,
        height: 630,
        alt: "Fitliner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_SEO.en.title,
    description: HOME_SEO.en.description,
    images: ["/og/gym-default.png"],
  },
};

const HTML_LANGS = new Set(["en", "sk", "de", "es", "fr", "zh-Hans"]);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get("x-fitliner-locale") ?? "en";
  const htmlLang = HTML_LANGS.has(requestedLocale) ? requestedLocale : "en";
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    email: SUPPORT_EMAIL,
    sameAs: [
      "https://apps.apple.com/app/id6760855966",
      "https://www.globaliollc.com",
    ],
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: LOCALES,
  };

  return (
    <html lang={htmlLang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <JsonLd data={[organization, website]} />
        {children}
      </body>
    </html>
  );
}
