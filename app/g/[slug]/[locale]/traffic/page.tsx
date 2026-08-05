import type {Metadata} from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {robots: {index: false, follow: true}};

const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;
type Locale = (typeof LOCALES)[number];

type PageProps = {
  params: Promise<{ slug: string; locale: string }> | { slug: string; locale: string };
};

type PublicGym = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  timezone: string;
  currency: string;
};

type PublicGymStats = {
  current_users_count: number;
  reviews_count: number;
  reviews_avg: number;
};

type TrafficRow = {
  hour: number;
  opens_count: number;
};

type Copy = {
  back: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  current: string;
  currentDescription: string;
  busiest: string;
  quietest: string;
  chartTitle: string;
  noData: string;
  opens: string;
  powered: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    back: 'Back to gym',
    eyebrow: 'Gym traffic',
    title: 'Gym traffic',
    subtitle: 'Anonymous traffic overview based on door openings during the last 28 days.',
    current: 'Currently in the gym',
    currentDescription: 'People in the gym right now',
    busiest: 'Busiest time',
    quietest: 'Quietest time',
    chartTitle: 'Traffic by hour',
    noData: 'Traffic data is not available yet.',
    opens: 'opens',
    powered: 'Powered by Fitliner',
  },
  sk: {
    back: 'Späť na fitko',
    eyebrow: 'Vyťaženosť gymu',
    title: 'Vyťaženosť gymu',
    subtitle: 'Anonymný prehľad vyťaženosti podľa otvorení dverí za posledných 28 dní.',
    current: 'Aktuálne vo fitku',
    currentDescription: 'Ľudia vo fitku práve teraz',
    busiest: 'Najrušnejší čas',
    quietest: 'Najpokojnejší čas',
    chartTitle: 'Vyťaženosť podľa hodín',
    noData: 'Dáta o vyťaženosti zatiaľ nie sú dostupné.',
    opens: 'otvorení',
    powered: 'Vytvorené cez Fitliner',
  },
  de: {
    back: 'Zurück zum Gym',
    eyebrow: 'Gym-Auslastung',
    title: 'Gym-Auslastung',
    subtitle: 'Anonyme Übersicht basierend auf Türöffnungen der letzten 28 Tage.',
    current: 'Aktuell im Gym',
    currentDescription: 'Personen, die gerade im Gym sind',
    busiest: 'Stoßzeit',
    quietest: 'Ruhigste Zeit',
    chartTitle: 'Auslastung nach Uhrzeit',
    noData: 'Noch keine Auslastungsdaten verfügbar.',
    opens: 'Öffnungen',
    powered: 'Bereitgestellt von Fitliner',
  },
  es: {
    back: 'Volver al gimnasio',
    eyebrow: 'Ocupación del gimnasio',
    title: 'Ocupación del gimnasio',
    subtitle: 'Resumen anónimo basado en aperturas de puerta durante los últimos 28 días.',
    current: 'Actualmente en el gimnasio',
    currentDescription: 'Personas en el gimnasio ahora mismo',
    busiest: 'Hora más concurrida',
    quietest: 'Hora más tranquila',
    chartTitle: 'Ocupación por hora',
    noData: 'Aún no hay datos de ocupación disponibles.',
    opens: 'aperturas',
    powered: 'Desarrollado por Fitliner',
  },
  fr: {
    back: 'Retour à la salle',
    eyebrow: 'Fréquentation de la salle',
    title: 'Fréquentation de la salle',
    subtitle: 'Vue anonyme basée sur les ouvertures de porte des 28 derniers jours.',
    current: 'Actuellement dans la salle',
    currentDescription: 'Personnes actuellement dans la salle',
    busiest: 'Moment le plus fréquenté',
    quietest: 'Moment le plus calme',
    chartTitle: 'Fréquentation par heure',
    noData: 'Les données de fréquentation ne sont pas encore disponibles.',
    opens: 'ouvertures',
    powered: 'Propulsé par Fitliner',
  },
  'zh-Hans': {
    back: '返回健身房',
    eyebrow: '健身房人流',
    title: '健身房人流',
    subtitle: '基于过去 28 天开门记录的匿名人流概览。',
    current: '当前在健身房内',
    currentDescription: '当前在健身房的人数',
    busiest: '最繁忙时间',
    quietest: '最安静时间',
    chartTitle: '按小时统计的人流',
    noData: '暂无人流数据。',
    opens: '次开门',
    powered: '由 Fitliner 提供支持',
  },
};

function getCopy(locale: string) {
  return COPY[LOCALES.includes(locale as Locale) ? (locale as Locale) : 'en'];
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function fillTrafficRows(rows: TrafficRow[]) {
  const byHour = new Map(rows.map((row) => [row.hour, row.opens_count]));

  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    opens_count: byHour.get(hour) ?? 0,
  }));
}

export default async function PublicGymTrafficPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, locale } = resolvedParams;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const copy = getCopy(locale);

  const [
    { data: gym, error: gymError },
    { data: statsData, error: statsError },
    { data: trafficData, error: trafficError },
  ] = await Promise.all([
    supabase
      .rpc('get_public_gym_by_slug', { input_slug: slug })
      .maybeSingle<PublicGym>(),
    supabase
      .rpc('get_public_gym_stats_by_slug', { input_slug: slug })
      .maybeSingle<PublicGymStats>(),
    supabase
      .rpc('get_public_gym_traffic_by_slug', { input_slug: slug }),
  ]);

  if (gymError || !gym) {
    console.error('Failed to load public gym traffic page:', gymError);
    notFound();
  }

  if (statsError) {
    console.error('Failed to load public gym stats for traffic page:', statsError);
  }

  if (trafficError) {
    console.error('Failed to load public gym traffic:', trafficError);
  }

  const stats = statsData ?? {
    current_users_count: 0,
    reviews_count: 0,
    reviews_avg: 0,
  };

  const rawTraffic = (trafficData ?? []) as TrafficRow[];
  const traffic = fillTrafficRows(rawTraffic);
  const maxOpens = Math.max(...traffic.map((row) => row.opens_count), 0);
  const nonZeroTraffic = traffic.filter((row) => row.opens_count > 0);

  const busiest = nonZeroTraffic.length
    ? nonZeroTraffic.reduce((best, row) => row.opens_count > best.opens_count ? row : best)
    : null;

  const quietest = nonZeroTraffic.length
    ? nonZeroTraffic.reduce((best, row) => row.opens_count < best.opens_count ? row : best)
    : null;

  return (
    <main className="min-h-screen bg-[#0B0B12] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8 sm:px-8">
        <div className="mb-8">
          <Link
            href={`/g/${slug}/${locale}`}
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
          >
            ← {copy.back}
          </Link>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-6 inline-flex rounded-full bg-[#7C4DFF]/15 px-4 py-2 text-sm font-semibold text-[#BBA7FF]">
            {copy.eyebrow}
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {copy.title}
          </h1>

          <p className="mt-3 text-xl font-bold text-white/80">
            {gym.name}
          </p>

          {gym.address ? (
            <p className="mt-2 text-sm leading-6 text-white/50">
              {gym.address}
            </p>
          ) : null}

          <p className="mt-6 text-base leading-7 text-white/70">
            {copy.subtitle}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-semibold text-white/55">{copy.current}</p>
            <p className="mt-3 text-4xl font-black tracking-tight">
              {stats.current_users_count}
            </p>
            <p className="mt-2 text-sm leading-5 text-white/55">
              {copy.currentDescription}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-semibold text-white/55">{copy.busiest}</p>
            <p className="mt-3 text-3xl font-black tracking-tight">
              {busiest ? formatHour(busiest.hour) : '—'}
            </p>
            <p className="mt-2 text-sm leading-5 text-white/55">
              {busiest ? `${busiest.opens_count} ${copy.opens}` : copy.noData}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-semibold text-white/55">{copy.quietest}</p>
            <p className="mt-3 text-3xl font-black tracking-tight">
              {quietest ? formatHour(quietest.hour) : '—'}
            </p>
            <p className="mt-2 text-sm leading-5 text-white/55">
              {quietest ? `${quietest.opens_count} ${copy.opens}` : copy.noData}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold">{copy.chartTitle}</h2>

          {maxOpens === 0 ? (
            <p className="mt-4 text-sm leading-6 text-white/60">
              {copy.noData}
            </p>
          ) : (
            <div className="mt-6">
              <div className="flex h-64 items-end gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 pb-3 pt-5 sm:gap-3 sm:px-5">
                {traffic.map((row) => {
                  const height = maxOpens > 0
                    ? Math.max((row.opens_count / maxOpens) * 100, row.opens_count > 0 ? 10 : 2)
                    : 2;

                  return (
                    <div key={row.hour} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                      <div className="text-[10px] font-semibold leading-none text-white/45">
                        {row.opens_count}
                      </div>
                      <div className="flex h-44 w-full items-end rounded-full bg-white/10">
                        <div
                          className="w-full rounded-full bg-[#7C4DFF]"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <div className="hidden text-[10px] font-semibold leading-none text-white/35 sm:block">
                        {String(row.hour).padStart(2, '0')}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex justify-between text-[10px] font-semibold text-white/35">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-auto pt-10 text-center text-xs text-white/35">
          {copy.powered} · {gym.currency} · {gym.timezone}
        </footer>
      </section>
    </main>
  );
}
