import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  timezone: string;
  currency: string;
  rules_text: string | null;
};

type Copy = {
  badge: string;
  titleBody: string;
  ios: string;
  android: string;
  note: string;
  publicPage: string;
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
  powered: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    badge: 'Open with Fitliner',
    titleBody: 'Download the Fitliner app, choose your membership or entry pass, and open the gym with your phone.',
    ios: 'Download for iPhone',
    android: 'Download for Android',
    note: 'iOS & Android · Free to start',
    publicPage: 'Public gym page',
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
    powered: 'Powered by Fitliner',
  },
  sk: {
    badge: 'Otvor cez Fitliner',
    titleBody: 'Stiahni si aplikáciu Fitliner, vyber si členstvo alebo vstup a otvor fitko mobilom.',
    ios: 'Stiahnuť pre iPhone',
    android: 'Stiahnuť pre Android',
    note: 'iOS & Android · Začni zadarmo',
    publicPage: 'Verejná stránka fitka',
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
    powered: 'Vytvorené cez Fitliner',
  },
  de: {
    badge: 'Mit Fitliner öffnen',
    titleBody: 'Lade die Fitliner App herunter, wähle deine Mitgliedschaft oder deinen Eintritt und öffne das Gym mit deinem Smartphone.',
    ios: 'Für iPhone laden',
    android: 'Für Android laden',
    note: 'iOS & Android · Kostenlos starten',
    publicPage: 'Öffentliche Gym-Seite',
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
    powered: 'Bereitgestellt von Fitliner',
  },
  es: {
    badge: 'Abrir con Fitliner',
    titleBody: 'Descarga la app Fitliner, elige tu membresía o pase de entrada y abre el gimnasio con tu móvil.',
    ios: 'Descargar para iPhone',
    android: 'Descargar para Android',
    note: 'iOS y Android · Empieza gratis',
    publicPage: 'Página pública del gimnasio',
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
    powered: 'Desarrollado por Fitliner',
  },
  fr: {
    badge: 'Ouvrir avec Fitliner',
    titleBody: 'Téléchargez l’app Fitliner, choisissez votre abonnement ou votre accès, puis ouvrez la salle avec votre téléphone.',
    ios: 'Télécharger pour iPhone',
    android: 'Télécharger pour Android',
    note: 'iOS & Android · Commencer gratuitement',
    publicPage: 'Page publique de la salle',
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
    powered: 'Propulsé par Fitliner',
  },
  'zh-Hans': {
    badge: '用 Fitliner 开门',
    titleBody: '下载 Fitliner 应用，选择会员或入场通行证，然后用手机打开健身房。',
    ios: '下载 iPhone 版',
    android: '下载 Android 版',
    note: 'iOS 与 Android · 免费开始',
    publicPage: '健身房公开页面',
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
    powered: '由 Fitliner 提供支持',
  },
};

function getCopy(locale: string) {
  return COPY[LOCALES.includes(locale as Locale) ? (locale as Locale) : 'en'];
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

export default async function PublicGymLocalePage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = resolvedParams.slug;
  const locale = resolvedParams.locale;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const copy = getCopy(locale);

  const { data, error } = await supabase
    .rpc('get_public_gym_by_slug', { input_slug: slug })
    .maybeSingle<PublicGym>();

  if (error) {
    console.error('Failed to load localized public gym page:', error);
    notFound();
  }

  if (!data) {
    notFound();
  }

  const gym = data;
  const addressMapUrl = mapUrl(gym.address);
  const websiteUrl = cleanUrl(gym.website);
  const facebookUrl = cleanUrl(gym.facebook);
  const instagramUrl = cleanUrl(gym.instagram);
  const tiktokUrl = cleanUrl(gym.tiktok);

  return (
    <main className="min-h-screen bg-[#0B0B12] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8 sm:px-8">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="text-sm font-semibold text-white/70 hover:text-white">
            Fitliner
          </Link>

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            {copy.publicPage}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-6 inline-flex rounded-full bg-[#7C4DFF]/15 px-4 py-2 text-sm font-semibold text-[#BBA7FF]">
            {copy.badge}
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {gym.name}
          </h1>

          {gym.address ? (
            <p className="mt-4 text-lg leading-7 text-white/72">
              {gym.address}
            </p>
          ) : null}

          <p className="mt-6 text-base leading-7 text-white/70">
            {copy.titleBody}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href="#"
              className="flex items-center justify-center rounded-2xl bg-[#7C4DFF] px-5 py-4 text-center text-sm font-bold text-white transition hover:bg-[#6B3DFF]"
            >
              {copy.ios}
            </a>

            <a
              href="#"
              className="flex items-center justify-center rounded-2xl bg-white px-5 py-4 text-center text-sm font-bold text-[#111]"
            >
              {copy.android}
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-white/45">
            {copy.note}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-bold">{copy.address}</h2>

            <p className="mt-2 text-sm leading-6 text-white/65">
              {gym.address || copy.addressMissing}
            </p>

            {addressMapUrl ? (
              <a
                href={addressMapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                {copy.navigate}
              </a>
            ) : null}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-bold">{copy.contact}</h2>

            <div className="mt-2 space-y-2 text-sm leading-6 text-white/65">
              {gym.contact_phone ? <p>{copy.phone}: {gym.contact_phone}</p> : null}
              {gym.contact_email ? <p>{copy.email}: {gym.contact_email}</p> : null}

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

        {gym.rules_text?.trim() ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-bold">{copy.rules}</h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/65">
              {gym.rules_text}
            </p>
          </div>
        ) : null}

        <footer className="mt-auto pt-10 text-center text-xs text-white/35">
          {copy.powered} · {gym.currency} · {gym.timezone}
        </footer>
      </section>
    </main>
  );
}
