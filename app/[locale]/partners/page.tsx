import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import PartnerInteractive from "./partner-interactive";
import { PartnerIntro, PartnerQuestions } from "./partner-story";
import PartnerMotion from "./partner-motion";
import "./partners.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!["sk", "en"].includes(locale)) return {};
  const metadata = pageMetadata({
    languages: {
      sk: "https://www.befitliner.com/sk/partners",
      en: "https://www.befitliner.com/en/partners",
      "x-default": "https://www.befitliner.com/en/partners",
    },
    locale: locale as "sk" | "en",
    path: "partners",
    title:
      locale === "sk"
        ? "Staňte sa národným partnerom Fitliner"
        : "Become a Fitliner Country Partner",
    description:
      locale === "sk"
        ? "Budujte sieť fitness centier vo svojej krajine a získajte podiel z výnosov Fitliner."
        : "Build the Fitliner gym network in your country and participate in its revenue.",
  });
  if (metadata.openGraph)
    metadata.openGraph.alternateLocale = [locale === "sk" ? "en_US" : "sk_SK"];
  return metadata;
}
export default async function Partners({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!["sk", "en"].includes(locale)) notFound();
  const sk = locale === "sk";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { data: countrySettings } =
    url && key
      ? await createClient(url, key)
          .from("partner_countries")
          .select(
            "code,name,public_status,annual_new_gyms_target,target_approved",
          )
          .order("name")
      : { data: [] };
  return (
    <main className="partner-page">
      <nav className="partner-nav partner-container">
        <Link className="partner-logo" href={`/${locale}`}>
          FITLINER<span>®</span>
        </Link>
        <div>
          <Link href="/sk/partners" aria-current={sk ? "page" : undefined}>
            SK
          </Link>
          <Link href="/en/partners" aria-current={!sk ? "page" : undefined}>
            EN
          </Link>
        </div>
      </nav>
      <PartnerMotion />
      <PartnerIntro sk={sk} locale={locale} />
      <PartnerInteractive
        locale={locale as "sk" | "en"}
        countrySettings={countrySettings || []}
      >
        <PartnerQuestions sk={sk} />
      </PartnerInteractive>
      <section className="partner-container partner-terms">
        <p>
          {sk
            ? "Provízie a exkluzivita nie sú automaticky doživotné. Trvanie a obnovenie určuje zmluva a plnenie cieľov."
            : "Commissions and exclusivity are not automatically lifelong. Duration and renewal depend on the agreement and meeting targets."}
        </p>
      </section>
      <footer className="partner-container partner-footer">
        FITLINER ·{" "}
        {sk
          ? "Podmienky podliehajú individuálnej zmluve."
          : "Terms subject to individual agreement."}
      </footer>
    </main>
  );
}
