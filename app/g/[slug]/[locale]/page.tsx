import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;
const LOCALE_LABELS: Record<(typeof LOCALES)[number], string> = {
  en: 'EN',
  sk: 'SK',
  de: 'DE',
  es: 'ES',
  fr: 'FR',
  'zh-Hans': '中文',
};
type Locale = (typeof LOCALES)[number];

type PageProps = {
  params: Promise<{ slug: string; locale: string }> | { slug: string; locale: string };
};

type PublicGym = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  timezone: string;
  currency: string;
  rules_text: string | null;
  public_video_url: string | null;
};

type PublicGymStats = {
  current_users_count: number;
  reviews_count: number;
  reviews_avg: number;
};

type Copy = {
  badge: string;
  addressCta: string;
  titleBody: string;
  benefits: string;
  ios: string;
  android: string;
  iosBadgeTop: string;
  googleBadgeTop: string;
  note: string;
  publicPage: string;
  liveStatus: string;
  currentInGym: string;
  currentInGymDescription: string;
  reviews: string;
  reviewsSummary: string;
  address: string;
  addressMissing: string;
  navigate: string;
  contact: string;
  phone: string;
  email: string;
  contactMissing: string;
  links: string;
  website: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  rules: string;
  rulesDescription: string;
  rulesCta: string;
  powered: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    badge: 'Smart fitness center',
    addressCta: 'Navigate',
    titleBody: 'Download Fitliner, pay in the app, and open the door with one tap.',
    benefits: 'You also get free fitness guidance, community, trainers, and extra bonuses.',
    ios: 'Download for iPhone',
    android: 'Download for Android',
    iosBadgeTop: 'Download on the',
    googleBadgeTop: 'Get it on',
    note: 'iOS & Android · Free to start',
    publicPage: 'Public gym page',
    liveStatus: 'Live gym status',
    currentInGym: 'Currently in the gym',
    currentInGymDescription: 'People in the gym right now',
    reviews: 'Reviews',
    reviewsSummary: '{count} reviews · {avg} / 5',
    address: 'Address',
    addressMissing: 'Address is not available yet.',
    navigate: 'Navigate',
    contact: 'Contact',
    phone: 'Phone',
    email: 'Email',
    contactMissing: 'Contact details are not available yet.',
    links: 'Links',
    website: 'Website',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    rules: 'Gym rules',
    rulesDescription: 'Read the rules before entering the gym.',
    rulesCta: 'Open rules',
    powered: 'Powered by Fitliner',
  },
  sk: {
    badge: 'Smart fitnesscentrum',
    addressCta: 'Navigovať',
    titleBody: 'Stiahni si Fitliner, zaplať v appke a otvor si dvere jedným klikom.',
    benefits: 'Bezplatne získaš fit poradenstvo, komunitu, trénerov a ďalšie bonusy.',
    ios: 'Stiahnuť pre iPhone',
    android: 'Stiahnuť pre Android',
    iosBadgeTop: 'Stiahnuť z',
    googleBadgeTop: 'Stiahnuť z',
    note: 'iOS & Android · Začni zadarmo',
    publicPage: 'Verejná stránka fitka',
    liveStatus: 'Aktuálne vo fitku',
    currentInGym: 'Aktuálne v gyme',
    currentInGymDescription: 'Ľudia vo fitku práve teraz',
    reviews: 'Recenzie',
    reviewsSummary: '{count} hodnotení · {avg} / 5',
    address: 'Adresa',
    addressMissing: 'Adresa zatiaľ nie je dostupná.',
    navigate: 'Navigovať',
    contact: 'Kontakt',
    phone: 'Telefón',
    email: 'Email',
    contactMissing: 'Kontaktné údaje zatiaľ nie sú dostupné.',
    links: 'Odkazy',
    website: 'Web',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    rules: 'Pravidlá fitka',
    rulesDescription: 'Prečítaj si pravidlá pred vstupom do fitka.',
    rulesCta: 'Otvoriť pravidlá',
    powered: 'Vytvorené cez Fitliner',
  },
  de: {
    badge: 'Smartes Fitnessstudio',
    addressCta: 'Navigieren',
    titleBody: 'Lade Fitliner herunter, bezahle in der App und öffne die Tür mit einem Tipp.',
    benefits: 'Du erhältst außerdem kostenlose Fitnessberatung, Community, Trainer und weitere Boni.',
    ios: 'Für iPhone laden',
    android: 'Für Android laden',
    iosBadgeTop: 'Laden im',
    googleBadgeTop: 'Jetzt bei',
    note: 'iOS & Android · Kostenlos starten',
    publicPage: 'Öffentliche Gym-Seite',
    liveStatus: 'Live-Status des Gyms',
    currentInGym: 'Aktuell im Fitnessstudio',
    currentInGymDescription: 'Personen, die gerade im Gym sind',
    reviews: 'Bewertungen',
    reviewsSummary: '{count} Bewertungen · {avg} / 5',
    address: 'Adresse',
    addressMissing: 'Adresse ist noch nicht verfügbar.',
    navigate: 'Navigieren',
    contact: 'Kontakt',
    phone: 'Telefon',
    email: 'E-Mail',
    contactMissing: 'Kontaktdaten sind noch nicht verfügbar.',
    links: 'Links',
    website: 'Website',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    rules: 'Gym-Regeln',
    rulesDescription: 'Lies die Regeln, bevor du das Gym betrittst.',
    rulesCta: 'Regeln öffnen',
    powered: 'Bereitgestellt von Fitliner',
  },
  es: {
    badge: 'Gimnasio inteligente',
    addressCta: 'Navegar',
    titleBody: 'Descarga Fitliner, paga en la app y abre la puerta con un toque.',
    benefits: 'También obtienes asesoramiento fitness gratis, comunidad, entrenadores y beneficios adicionales.',
    ios: 'Descargar para iPhone',
    android: 'Descargar para Android',
    iosBadgeTop: 'Descargar en',
    googleBadgeTop: 'Consíguelo en',
    note: 'iOS y Android · Empieza gratis',
    publicPage: 'Página pública del gimnasio',
    liveStatus: 'Estado actual del gimnasio',
    currentInGym: 'Actualmente en el gimnasio',
    currentInGymDescription: 'Personas en el gimnasio ahora mismo',
    reviews: 'Reseñas',
    reviewsSummary: '{count} reseñas · {avg} / 5',
    address: 'Dirección',
    addressMissing: 'La dirección aún no está disponible.',
    navigate: 'Navegar',
    contact: 'Contacto',
    phone: 'Teléfono',
    email: 'Email',
    contactMissing: 'Los datos de contacto aún no están disponibles.',
    links: 'Enlaces',
    website: 'Sitio web',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    rules: 'Reglas del gimnasio',
    rulesDescription: 'Lee las reglas antes de entrar al gimnasio.',
    rulesCta: 'Abrir reglas',
    powered: 'Desarrollado por Fitliner',
  },
  fr: {
    badge: 'Salle de sport intelligente',
    addressCta: 'Itinéraire',
    titleBody: 'Téléchargez Fitliner, payez dans l’app et ouvrez la porte en un clic.',
    benefits: 'Vous bénéficiez aussi de conseils fitness gratuits, d’une communauté, de coachs et de bonus supplémentaires.',
    ios: 'Télécharger pour iPhone',
    android: 'Télécharger pour Android',
    iosBadgeTop: 'Télécharger sur',
    googleBadgeTop: 'Disponible sur',
    note: 'iOS & Android · Commencer gratuitement',
    publicPage: 'Page publique de la salle',
    liveStatus: 'Statut actuel de la salle',
    currentInGym: 'Actuellement dans la salle',
    currentInGymDescription: 'Personnes actuellement dans la salle',
    reviews: 'Avis',
    reviewsSummary: '{count} avis · {avg} / 5',
    address: 'Adresse',
    addressMissing: 'L’adresse n’est pas encore disponible.',
    navigate: 'Itinéraire',
    contact: 'Contact',
    phone: 'Téléphone',
    email: 'Email',
    contactMissing: 'Les coordonnées ne sont pas encore disponibles.',
    links: 'Liens',
    website: 'Site web',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    rules: 'Règles de la salle',
    rulesDescription: 'Lisez les règles avant d’entrer dans la salle.',
    rulesCta: 'Ouvrir les règles',
    powered: 'Propulsé par Fitliner',
  },
  'zh-Hans': {
    badge: '智能健身房',
    addressCta: '导航',
    titleBody: '下载 Fitliner，在应用内付款，然后一键开门。',
    benefits: '你还可以免费获得健身指导、社区、教练和更多奖励。',
    ios: '下载 iPhone 版',
    android: '下载 Android 版',
    iosBadgeTop: '下载于',
    googleBadgeTop: '下载于',
    note: 'iOS 与 Android · 免费开始',
    publicPage: '健身房公开页面',
    liveStatus: '健身房实时状态',
    currentInGym: '当前在健身房内',
    currentInGymDescription: '当前在健身房的人数',
    reviews: '评价',
    reviewsSummary: '{count} 条评价 · {avg} / 5',
    address: '地址',
    addressMissing: '地址暂不可用。',
    navigate: '导航',
    contact: '联系方式',
    phone: '电话',
    email: '邮箱',
    contactMissing: '联系方式暂不可用。',
    links: '链接',
    website: '网站',
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    rules: '健身房规则',
    rulesDescription: '进入健身房前请阅读规则。',
    rulesCta: '打开规则',
    powered: '由 Fitliner 提供支持',
  },
};

function getCopy(locale: string) {
  return COPY[LOCALES.includes(locale as Locale) ? (locale as Locale) : 'en'];
}

function formatReviewsSummary(template: string, count: number, avg: number) {
  return template
    .replace('{count}', String(count))
    .replace('{avg}', avg.toFixed(1));
}

function cleanUrl(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;
}

function mapUrl(address: string | null) {
  if (!address) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function youtubeEmbedUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.replace(/^www\./, '');

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const videoId = url.searchParams.get('v');
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?controls=0&rel=0&modestbranding=1&playsinline=1`
        : null;
    }

    if (hostname === 'youtu.be') {
      const videoId = url.pathname.replace('/', '').trim();
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?controls=0&rel=0&modestbranding=1&playsinline=1`
        : null;
    }

    if (hostname === 'youtube.com' && url.pathname.startsWith('/embed/')) {
      url.searchParams.set('controls', '0');
      url.searchParams.set('rel', '0');
      url.searchParams.set('modestbranding', '1');
      url.searchParams.set('playsinline', '1');
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

function gymPageMetaTitle(gymName: string, locale: string) {
  if (locale === 'sk') {
    return `${gymName} – otvor fitko cez Fitliner`;
  }

  if (locale === 'de') {
    return `${gymName} – Fitnessstudio mit Fitliner öffnen`;
  }

  if (locale === 'es') {
    return `${gymName} – abre el gimnasio con Fitliner`;
  }

  if (locale === 'fr') {
    return `${gymName} – ouvrez la salle avec Fitliner`;
  }

  if (locale === 'zh-Hans') {
    return `${gymName} – 使用 Fitliner 开门`;
  }

  return `${gymName} – open the gym with Fitliner`;
}

function gymPageMetaDescription(copy: Copy) {
  return `${copy.titleBody} ${copy.benefits}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = resolvedParams.slug;
  const locale = resolvedParams.locale;

  if (!LOCALES.includes(locale as Locale)) {
    return {};
  }

  const copy = getCopy(locale);

  const { data: gym } = await supabase
    .rpc('get_public_gym_by_slug', { input_slug: slug })
    .maybeSingle<PublicGym>();

  if (!gym) {
    return {
      title: 'Fitliner',
      description: copy.titleBody,
    };
  }

  const title = gymPageMetaTitle(gym.name, locale);
  const description = gymPageMetaDescription(copy);
  const url = `https://${gym.slug}.befitliner.com/${locale}`;
  const imageUrl = 'https://befitliner.com/og/gym-default.png';

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Fitliner',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${gym.name} – Fitliner`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PublicGymLocalePage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = resolvedParams.slug;
  const locale = resolvedParams.locale;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const copy = getCopy(locale);

  const [{ data, error }, { data: statsData, error: statsError }] = await Promise.all([
    supabase
      .rpc('get_public_gym_by_slug', { input_slug: slug })
      .maybeSingle<PublicGym>(),
    supabase
      .rpc('get_public_gym_stats_by_slug', { input_slug: slug })
      .maybeSingle<PublicGymStats>(),
  ]);

  if (error) {
    console.error('Failed to load localized public gym page:', error);
    notFound();
  }

  if (statsError) {
    console.error('Failed to load localized public gym stats:', statsError);
  }

  if (!data) {
    notFound();
  }

  const gym = data;
  const stats = statsData ?? {
    current_users_count: 0,
    reviews_count: 0,
    reviews_avg: 0,
  };

  const addressMapUrl = mapUrl(gym.address);
  const websiteUrl = cleanUrl(gym.website);
  const facebookUrl = cleanUrl(gym.facebook);
  const instagramUrl = cleanUrl(gym.instagram);
  const tiktokUrl = cleanUrl(gym.tiktok);
  const videoEmbedUrl = youtubeEmbedUrl(gym.public_video_url);

  return (
    <main className="min-h-screen bg-[#0B0B12] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8 sm:px-8">
        <header className="mb-10 flex items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-start text-white hover:text-white/85"
            aria-label="Fitliner homepage"
          >
            <span className="text-[18px] font-extrabold leading-none tracking-[0.22em]">
              F I T L I N E R
            </span>
            <span className="ml-[3px] -translate-y-[4px] text-[8px] font-extrabold leading-none tracking-[0.04em] text-white/70">
              TM
            </span>
          </Link>

          <nav aria-label="Language switcher" className="hidden flex-wrap justify-end gap-1.5 sm:flex">
            {LOCALES.map((targetLocale) => {
              const isActive = targetLocale === locale;

              return (
                <Link
                  key={targetLocale}
                  href={`/g/${slug}/${targetLocale}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'rounded-full border px-3 py-1.5 text-[11px] font-bold transition',
                    isActive
                      ? 'border-white/25 bg-white text-[#0B0B12]'
                      : 'border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  {LOCALE_LABELS[targetLocale]}
                </Link>
              );
            })}
          </nav>

          <details className="relative sm:hidden">
            <summary className="list-none rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/70 marker:hidden">
              {LOCALE_LABELS[locale as Locale]}
            </summary>
            <div className="absolute right-0 z-20 mt-2 min-w-32 overflow-hidden rounded-2xl border border-white/10 bg-[#12121A] p-1 shadow-2xl shadow-black/50">
              {LOCALES.map((targetLocale) => {
                const isActive = targetLocale === locale;

                return (
                  <Link
                    key={targetLocale}
                    href={`/g/${slug}/${targetLocale}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'block rounded-xl px-3 py-2 text-sm font-bold transition',
                      isActive
                        ? 'bg-white text-[#0B0B12]'
                        : 'text-white/65 hover:bg-white/10 hover:text-white',
                    ].join(' ')}
                  >
                    {LOCALE_LABELS[targetLocale]}
                  </Link>
                );
              })}
            </div>
          </details>
        </header>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {gym.name}
          </h1>

          {gym.address ? (
            <a
              href={addressMapUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-base leading-7 text-white/72 hover:text-white sm:text-lg"
            >
              <span aria-hidden="true">📍</span>
              <span>{copy.addressCta}: {gym.address}</span>
            </a>
          ) : null}

          <p className="mt-7 max-w-2xl text-xl font-black leading-snug tracking-[-0.03em] text-white sm:text-2xl">
            {copy.titleBody}
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            {copy.benefits}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href="https://apps.apple.com/sk/app/fitliner/id6760855966"
              target="_blank"
              rel="noreferrer"
              aria-label={copy.ios}
              className="flex min-h-[78px] items-center justify-center gap-5 rounded-[18px] border-2 border-[#A6A6A6] bg-black px-6 py-3 text-white shadow-lg shadow-black/25 transition hover:border-white/80 hover:bg-[#050505]"
            >
              <img
                src="/badge/appstore.png"
                alt=""
                className="h-12 w-12 object-contain"
                aria-hidden="true"
              />
              <span className="text-left leading-none">
                <span className="block text-[15px] font-semibold tracking-[0.04em] text-white sm:text-[16px]">
                  {copy.iosBadgeTop}
                </span>
                <span className="mt-1 block text-[30px] font-semibold tracking-[-0.04em] text-white sm:text-[34px]">
                  App Store
                </span>
              </span>
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=com.fitliner.app"
              target="_blank"
              rel="noreferrer"
              aria-label={copy.android}
              className="flex min-h-[78px] items-center justify-center gap-5 rounded-[18px] border-2 border-[#A6A6A6] bg-black px-6 py-3 text-white shadow-lg shadow-black/25 transition hover:border-white/80 hover:bg-[#050505]"
            >
              <img
                src="/badge/googleplay.png"
                alt=""
                className="h-12 w-12 object-contain"
                aria-hidden="true"
              />
              <span className="text-left leading-none">
                <span className="block text-[17px] font-normal tracking-[0.03em] text-white sm:text-[19px]">
                  {copy.googleBadgeTop}
                </span>
                <span className="mt-1 block text-[28px] font-semibold tracking-[-0.04em] text-white sm:text-[33px]">
                  Google Play
                </span>
              </span>
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-white/45">
            {copy.note}
          </p>
        </div>

        {videoEmbedUrl ? (
          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
            <div className="aspect-video w-full bg-black">
              <iframe
                src={videoEmbedUrl}
                title={`${gym.name} video`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">{copy.liveStatus}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href={`/g/${slug}/${locale}/traffic`}
              className="block cursor-pointer select-none rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-white/55">{copy.currentInGym}</p>
                <span className="text-sm font-bold text-white/40">→</span>
              </div>
              <p className="mt-3 text-4xl font-black tracking-tight">
                {stats.current_users_count}
              </p>
              <p className="mt-2 text-sm leading-5 text-white/55">
                {copy.currentInGymDescription}
              </p>
            </Link>

            <Link
              href={`/g/${slug}/${locale}/reviews`}
              className="block cursor-pointer select-none rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-white/55">{copy.reviews}</p>
                <span className="text-sm font-bold text-white/40">→</span>
              </div>
              <p className="mt-3 text-4xl font-black tracking-tight">
                {stats.reviews_avg.toFixed(1)}
              </p>
              <p className="mt-2 text-sm leading-5 text-white/55">
                {formatReviewsSummary(copy.reviewsSummary, stats.reviews_count, stats.reviews_avg)}
              </p>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href={`/g/${slug}/${locale}/rules`}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.07]"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold">{copy.rules}</h2>
              <span className="text-sm font-bold text-white/40">→</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {copy.rulesDescription}
            </p>
            <span className="mt-4 inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              {copy.rulesCta}
            </span>
          </Link>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-bold">{copy.contact}</h2>

            <div className="mt-2 space-y-2 text-sm leading-6 text-white/65">
              {gym.contact_phone ? (
                <p>
                  {copy.phone}:{' '}
                  <a href={`tel:${gym.contact_phone}`} className="text-white/80 underline decoration-white/20 underline-offset-4 hover:text-white">
                    {gym.contact_phone}
                  </a>
                </p>
              ) : null}
              {gym.contact_email ? (
                <p>
                  {copy.email}:{' '}
                  <a href={`mailto:${gym.contact_email}`} className="text-white/80 underline decoration-white/20 underline-offset-4 hover:text-white">
                    {gym.contact_email}
                  </a>
                </p>
              ) : null}

              {!gym.contact_phone && !gym.contact_email ? (
                <p>{copy.contactMissing}</p>
              ) : null}
            </div>
          </div>
        </div>

        {websiteUrl || facebookUrl || instagramUrl || tiktokUrl ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-bold">{copy.links}</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {websiteUrl ? (
                <a href={websiteUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                  {copy.website}
                </a>
              ) : null}

              {facebookUrl ? (
                <a href={facebookUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                  {copy.facebook}
                </a>
              ) : null}

              {instagramUrl ? (
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                  {copy.instagram}
                </a>
              ) : null}

              {tiktokUrl ? (
                <a href={tiktokUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                  {copy.tiktok}
                </a>
              ) : null}
            </div>
          </div>
        ) : null}



        <footer className="mt-auto pt-10 text-center text-xs text-white/35">
          {copy.powered} · {gym.currency} · {gym.timezone}
        </footer>
      </section>
    </main>
  );
}
