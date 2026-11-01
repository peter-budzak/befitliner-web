import JsonLd from "@/components/seo/json-ld";
import { discoveryMetadata, discoverySchema } from "@/lib/page-discovery";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { isSiteLocale } from "@/lib/seo";
import { getPartnerCopy } from "@/lib/partners/copy";
import {
  isPartnerLocale,
  PARTNER_LOCALES,
  PARTNER_LANGUAGE_NAMES,
} from "@/lib/partners/locales";
import PartnerInteractive from "./partner-interactive";
import { PartnerIntro, PartnerQuestions } from "./partner-story";
import PartnerMotion from "./partner-motion";
import "./partners.css";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isPartnerLocale(locale)) return {};
  return discoveryMetadata("partners", locale);
}

export default async function Partners({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isPartnerLocale(locale)) notFound();
  const copy = getPartnerCopy(locale);
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
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const countries = (countrySettings || [])
    .map((c) => ({ ...c, name: names.of(c.code) || c.name }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
  return (
    <main className="partner-page">
      <JsonLd data={discoverySchema("partners", locale)} />
      <nav className="partner-nav partner-container">
        <Link
          className="partner-logo"
          href={`/${isSiteLocale(locale) ? locale : "en"}`}
          title={!isSiteLocale(locale) ? copy["In English"] : undefined}
        >
          FITLINER<span>®</span>
        </Link>
        <details className="partner-language-menu">
          <summary>
            {copy.Language}: {PARTNER_LANGUAGE_NAMES[locale]}{" "}
            <span aria-hidden="true">⌄</span>
          </summary>
          <div>
            {PARTNER_LOCALES.map((l) => (
              <Link
                key={l}
                href={`/${l}/partners`}
                hrefLang={l}
                lang={l}
                aria-current={locale === l ? "page" : undefined}
              >
                {PARTNER_LANGUAGE_NAMES[l]}
              </Link>
            ))}
          </div>
        </details>
      </nav>
      <PartnerMotion />
      <PartnerIntro locale={locale} copy={copy} />
      <PartnerInteractive
        locale={locale}
        countrySettings={countries}
        copy={copy}
      >
        <PartnerQuestions copy={copy} />
      </PartnerInteractive>
      <section className="partner-container partner-terms">
        <p>
          {
            copy[
              "Commissions and exclusivity are not automatically lifelong. Duration and renewal depend on the agreement and meeting targets."
            ]
          }
        </p>
      </section>
      <footer className="partner-container partner-footer">
        FITLINER · {copy["Terms subject to individual agreement."]}
      </footer>
    </main>
  );
}
