import Link from 'next/link';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HealthSuccessPage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== 'sk') notFound();

  return (
    <main className="min-h-screen bg-[#08070c] px-5 py-16 text-white">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-violet-950/20 md:p-12">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-400/15 text-2xl text-emerald-300">
          ✓
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-violet-300">
          Fitliner Health
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Vaša Health Card je pripravená
        </h1>
        <p className="mt-4 leading-7 text-white/65">
          Platba prebehla úspešne. Skontrolujte si e-mail a otvorte aplikáciu Fitliner,
          kde môžete začať pridávať svoje výsledky.
        </p>
        <Link
          href="/sk"
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500"
        >
          Pokračovať do Fitliner
        </Link>
        <p className="mt-6 text-xs leading-5 text-white/40">
          Fitliner neposkytuje diagnózu ani nenahrádza odbornú zdravotnú starostlivosť.
        </p>
      </section>
    </main>
  );
}
