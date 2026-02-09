import Link from 'next/link';

export default function Page({
  params
}: {
  params: {locale: string};
}) {
  const locale = params.locale;

  return (
    <main className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link className="text-sm text-white/70 hover:text-white" href={`/${locale}`}>
          ← Back
        </Link>

        <h1 className="mt-6 text-3xl font-bold">For Gyms</h1>
        <p className="mt-3 text-white/70">
          Fitliner helps gyms automate access, keep members engaged and reward them for progress.
        </p>

        <div className="mt-8 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="font-semibold">Smart Access</div>
            <div className="mt-2 text-sm text-white/70">Members open doors from the app.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="font-semibold">Retention & Motivation</div>
            <div className="mt-2 text-sm text-white/70">Diamonds and progress create habit loops.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="font-semibold">Easy Setup</div>
            <div className="mt-2 text-sm text-white/70">We’ll guide you step-by-step. No stress.</div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            className="rounded-2xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold hover:opacity-95"
            href="#"
          >
            Book a demo (coming soon)
          </a>
          <a
            className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10"
            href="mailto:hello@befitliner.com"
          >
            Email us
          </a>
        </div>

        <div className="mt-10 text-xs text-white/45">
          This page is a placeholder. Next step: add a short offer + pricing + Calendly link.
        </div>
      </div>
    </main>
  );
}