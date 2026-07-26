import Link from 'next/link';

const copy: Record<string, {eyebrow: string; title: string; body: string; cta: string; note: string}> = {
  sk: {eyebrow: 'Platba prebehla úspešne', title: 'Tvoja Zdravotná karta je pripravená.', body: 'Otvor aplikáciu Fitliner a prihlás sa rovnakým e-mailom, ktorý si použil pri platbe. Health sa aktivuje automaticky.', cta: 'Stiahnuť Fitliner', note: 'Ak už aplikáciu máš, stačí ju otvoriť a obnoviť Zdravotnú kartu.'},
  en: {eyebrow: 'Payment successful', title: 'Your Health Card is ready.', body: 'Open Fitliner and sign in with the same email you used at checkout. Health activates automatically.', cta: 'Download Fitliner', note: 'Already have the app? Open it and refresh your Health Card.'},
  de: {eyebrow: 'Zahlung erfolgreich', title: 'Deine Gesundheitskarte ist bereit.', body: 'Öffne Fitliner und melde dich mit derselben E-Mail-Adresse an, die du bei der Zahlung verwendet hast.', cta: 'Fitliner laden', note: 'Du hast die App bereits? Öffne sie und aktualisiere deine Gesundheitskarte.'},
};

export default async function HealthSuccessPage({params}: {params: Promise<{locale: string}> | {locale: string}}) {
  const resolved = params instanceof Promise ? await params : params;
  const t = copy[resolved.locale] ?? copy.en;
  const appStore = process.env.NEXT_PUBLIC_APPSTORE_URL || 'https://apps.apple.com/app/id6760855966';
  return <main className="min-h-screen bg-[#070709] px-5 py-10 text-white"><div className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center text-center"><div className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-5xl text-emerald-300">✓</div><p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{t.eyebrow}</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{t.title}</h1><p className="mt-5 text-base leading-7 text-white/65">{t.body}</p><a href={appStore} className="mt-8 min-h-14 w-full rounded-2xl bg-[#8B5CF6] px-6 py-4 font-bold">{t.cta}</a><p className="mt-4 text-sm text-white/45">{t.note}</p><Link href={`/${resolved.locale}`} className="mt-8 text-sm text-[#B9A1FF]">Fitliner home</Link></div></main>;
}
