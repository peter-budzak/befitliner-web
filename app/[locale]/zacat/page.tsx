import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MemberFunnel from "@/components/member-funnel/member-funnel";

export const metadata: Metadata = {
  title: "Tvoja cesta k lepšej forme",
  description:
    "Objav tréning, stravu a progres s Fitlinerom. Interaktívna ukážka osobnej cesty.",
  robots: { index: false, follow: false },
};
export default async function StartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "sk") notFound();
  return <MemberFunnel />;
}
