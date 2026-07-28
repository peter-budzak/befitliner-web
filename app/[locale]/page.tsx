import {promises as fs} from 'fs';
import path from 'path';
import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/json-ld';
import {HOME_SEO, isSiteLocale, pageMetadata, SITE_URL} from '@/lib/seo';

const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;
type Locale = (typeof LOCALES)[number];

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}> | {locale: string};
}): Promise<Metadata> {
  const resolved = params instanceof Promise ? await params : params;
  if (!isSiteLocale(resolved.locale)) return {};
  return pageMetadata({locale: resolved.locale, ...HOME_SEO[resolved.locale]});
}

type Messages = {
  brand: string;
  h1: string;
  sub: string;
  cta_ios: string;
  cta_android: string;
  note: string;
  footer: {
    claim: string;
    links_title: string;
    privacy: string;
    terms: string;
    for_gyms: string;
    app_title: string;
    download_ios: string;
    download_android: string;
    rights: string;
  };
};

type HeroCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  socialProof: string;
  secondaryNote: string;
};

type FeatureItem = {
  title: string;
  description: string;
};

type ShowcaseItem = {
  kicker: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
};

function getHeroCopy(locale: string): HeroCopy {
  const copy: Record<string, HeroCopy> = {
    en: {
      eyebrow: 'One app for access, training and rewards',
      title: 'Your gym key, coach and progress tracker — in one app.',
      subtitle:
        'Fitliner connects real gym access, training, food tracking and rewards into one seamless mobile experience.',
      bullets: [
        'Open your gym with one tap',
        'Track food, progress and workouts',
        'Stay connected with your coach and gym friends',
      ],
      socialProof: 'Built for modern gyms and everyday members.',
      secondaryNote: 'iOS & Android · Free to start',
    },
    sk: {
      eyebrow: 'Jedna appka pre vstup, tréning a odmeny',
      title: 'Tvoj kľúč do fitka, kouč a tracker progresu — v jednej appke.',
      subtitle:
        'Fitliner spája reálny vstup do fitka, tréning, sledovanie jedla a odmeny do jedného plynulého mobilného zážitku.',
      bullets: [
        'Otvor svoje fitko jedným klikom',
        'Sleduj jedlo, progres a tréningy',
        'Buď v kontakte s trénerom a ľuďmi z fitka',
      ],
      socialProof: 'Vytvorené pre moderné fitká aj bežných členov.',
      secondaryNote: 'iOS & Android · Začni zadarmo',
    },
    de: {
      eyebrow: 'Eine App für Zugang, Training und Belohnungen',
      title: 'Dein Gym-Schlüssel, Coach und Fortschrittstracker — in einer App.',
      subtitle:
        'Fitliner verbindet echten Gym-Zugang, Training, Ernährungstracking und Belohnungen in einer nahtlosen mobilen Erfahrung.',
      bullets: [
        'Öffne dein Gym mit einem Tipp',
        'Verfolge Essen, Fortschritt und Workouts',
        'Bleib mit Coach und Gym-Freunden verbunden',
      ],
      socialProof: 'Für moderne Studios und echte Mitglieder entwickelt.',
      secondaryNote: 'iOS & Android · Kostenlos starten',
    },
    es: {
      eyebrow: 'Una app para acceso, entrenamiento y recompensas',
      title: 'Tu llave del gimnasio, coach y seguimiento de progreso — en una sola app.',
      subtitle:
        'Fitliner conecta acceso real al gimnasio, entrenamiento, seguimiento de comida y recompensas en una experiencia móvil fluida.',
      bullets: [
        'Abre tu gimnasio con un toque',
        'Sigue comida, progreso y entrenamientos',
        'Conecta con tu coach y amigos del gym',
      ],
      socialProof: 'Creado para gimnasios modernos y usuarios reales.',
      secondaryNote: 'iOS y Android · Empieza gratis',
    },
    fr: {
      eyebrow: 'Une seule app pour accès, entraînement et récompenses',
      title: 'Votre clé de salle, coach et suivi de progression — dans une seule app.',
      subtitle:
        'Fitliner réunit le vrai accès à la salle, l’entraînement, le suivi alimentaire et les récompenses dans une expérience mobile fluide.',
      bullets: [
        'Ouvrez votre salle en un geste',
        'Suivez vos repas, progrès et séances',
        'Restez connecté avec votre coach et vos amis',
      ],
      socialProof: 'Conçu pour les salles modernes et leurs membres.',
      secondaryNote: 'iOS & Android · Gratuit pour commencer',
    },
    'zh-Hans': {
      eyebrow: '一个应用，搞定门禁、训练和奖励',
      title: '你的健身房钥匙、教练和进度追踪器，都在一个应用里。',
      subtitle:
        'Fitliner 将真实的健身房门禁、训练、饮食记录和奖励整合为一个流畅的移动体验。',
      bullets: [
        '一键打开健身房大门',
        '记录饮食、进度和训练',
        '与教练和健身房好友保持联系',
      ],
      socialProof: '为现代健身房和真实用户打造。',
      secondaryNote: 'iOS 与 Android · 免费开始',
    },
  };

  return copy[locale] ?? copy.en;
}

function getFeatureItems(locale: string): FeatureItem[] {
  const items: Record<string, FeatureItem[]> = {
    en: [
      {
        title: 'Gym access in one tap',
        description: 'Use your phone as your gym key and remove cards, tags and friction at the entrance.',
      },
      {
        title: 'Personalized training flow',
        description: 'Follow your custom plan, see step-by-step exercise guidance and keep progress visible.',
      },
      {
        title: 'Built-in coach and community',
        description: 'Message your coach, stay connected with members and send gym passes directly in the app.',
      },
    ],
    sk: [
      {
        title: 'Vstup do fitka jedným klikom',
        description: 'Použi telefón ako kľúč do fitka a odstráň karty, čipy a zbytočné trenie pri vstupe.',
      },
      {
        title: 'Personalizovaný tréningový flow',
        description: 'Sleduj svoj plán, pozeraj si krokové návody na cviky a maj progres stále na očiach.',
      },
      {
        title: 'Kouč a komunita priamo v appke',
        description: 'Píš si s trénerom, buď v kontakte s ľuďmi z fitka a posielaj vstupy priamo cez aplikáciu.',
      },
    ],
    de: [
      {
        title: 'Gym-Zugang mit einem Tipp',
        description: 'Nutze dein Smartphone als Studioschlüssel und ersetze Karten, Tags und unnötige Reibung am Eingang.',
      },
      {
        title: 'Personalisierter Trainingsfluss',
        description: 'Folge deinem Plan, nutze Schritt-für-Schritt-Übungen und behalte deinen Fortschritt im Blick.',
      },
      {
        title: 'Coach und Community integriert',
        description: 'Schreibe deinem Coach, bleibe mit Mitgliedern verbunden und sende Studio-Pässe direkt in der App.',
      },
    ],
    es: [
      {
        title: 'Acceso al gimnasio con un toque',
        description: 'Usa tu móvil como llave del gimnasio y elimina tarjetas, chips y fricción en la entrada.',
      },
      {
        title: 'Flujo de entrenamiento personalizado',
        description: 'Sigue tu plan, revisa ejercicios paso a paso y mantén tu progreso siempre visible.',
      },
      {
        title: 'Coach y comunidad integrados',
        description: 'Escribe a tu coach, conecta con otros miembros y envía pases al gimnasio desde la app.',
      },
    ],
    fr: [
      {
        title: 'Accès à la salle en un geste',
        description: 'Utilisez votre téléphone comme clé de salle et supprimez cartes, tags et frictions à l’entrée.',
      },
      {
        title: 'Parcours d’entraînement personnalisé',
        description: 'Suivez votre programme, consultez les exercices étape par étape et gardez votre progression visible.',
      },
      {
        title: 'Coach et communauté intégrés',
        description: 'Écrivez à votre coach, restez en contact avec les membres et envoyez des accès directement depuis l’app.',
      },
    ],
    'zh-Hans': [
      {
        title: '一键进入健身房',
        description: '把手机当作健身房钥匙，告别卡片、门禁扣和入场摩擦。',
      },
      {
        title: '个性化训练流程',
        description: '跟随你的专属计划，查看分步骤动作指导，并持续看到自己的进步。',
      },
      {
        title: '内置教练与社区',
        description: '随时联系教练，与会员互动，还能直接在应用内发送健身房通行证。',
      },
    ],
  };

  return items[locale] ?? items.en;
}

function getShowcaseItems(locale: string): ShowcaseItem[] {
  const items: Record<string, ShowcaseItem[]> = {
    en: [
      {
        kicker: 'Access',
        title: 'Open gym doors with one tap',
        description: 'From the homepage to the entrance screen, access feels instant and premium.',
        imageSrc: '/gym.png',
        imageAlt: 'Fitliner gym access screen',
      },
      {
        kicker: 'Training',
        title: 'Custom plan tailored to you',
        description: 'Keep your current plan, exercise details and next steps in one simple flow.',
        imageSrc: '/training.png',
        imageAlt: 'Fitliner training plan screen',
      },
      {
        kicker: 'Activity',
        title: 'See when your gym is busy',
        description: 'Use real activity insights to choose the best time to train.',
        imageSrc: '/gymactivity.png',
        imageAlt: 'Fitliner gym activity screen',
      },
    ],
    sk: [
      {
        kicker: 'Vstup',
        title: 'Otvor dvere do fitka jedným klikom',
        description: 'Od homepage až po vstupnú obrazovku pôsobí prístup okamžite a prémiovo.',
        imageSrc: '/gym.png',
        imageAlt: 'Fitliner obrazovka vstupu do fitka',
      },
      {
        kicker: 'Tréning',
        title: 'Plán prispôsobený práve tebe',
        description: 'Maj svoj aktuálny plán, detaily cvikov a ďalšie kroky v jednom jednoduchom flowe.',
        imageSrc: '/training.png',
        imageAlt: 'Fitliner obrazovka tréningového plánu',
      },
      {
        kicker: 'Aktivita',
        title: 'Zisti, kedy je fitko plné',
        description: 'Použi reálne dáta o návštevnosti a vyber si najlepší čas na tréning.',
        imageSrc: '/gymactivity.png',
        imageAlt: 'Fitliner obrazovka aktivity vo fitku',
      },
    ],
    de: [
      {
        kicker: 'Zugang',
        title: 'Öffne dein Gym mit einem Tipp',
        description: 'Von der Startseite bis zum Eingang wirkt der Zugang sofortig und hochwertig.',
        imageSrc: '/gym.png',
        imageAlt: 'Fitliner Gym-Zugangsbildschirm',
      },
      {
        kicker: 'Training',
        title: 'Trainingsplan für dich gemacht',
        description: 'Halte deinen Plan, Übungsdetails und nächste Schritte in einem klaren Ablauf.',
        imageSrc: '/training.png',
        imageAlt: 'Fitliner Trainingsplan-Bildschirm',
      },
      {
        kicker: 'Aktivität',
        title: 'Sieh, wann dein Gym voll ist',
        description: 'Nutze echte Aktivitätsdaten und trainiere zur besten Zeit.',
        imageSrc: '/gymactivity.png',
        imageAlt: 'Fitliner Aktivitätsbildschirm fürs Gym',
      },
    ],
    es: [
      {
        kicker: 'Acceso',
        title: 'Abre tu gimnasio con un toque',
        description: 'Desde la home hasta la pantalla de entrada, el acceso se siente instantáneo y premium.',
        imageSrc: '/gym.png',
        imageAlt: 'Pantalla de acceso al gimnasio de Fitliner',
      },
      {
        kicker: 'Entrenamiento',
        title: 'Plan personalizado para ti',
        description: 'Mantén tu plan, los detalles de ejercicios y los siguientes pasos en un flujo claro.',
        imageSrc: '/training.png',
        imageAlt: 'Pantalla del plan de entrenamiento de Fitliner',
      },
      {
        kicker: 'Actividad',
        title: 'Descubre cuándo está lleno tu gym',
        description: 'Usa datos reales de actividad para entrenar a la mejor hora.',
        imageSrc: '/gymactivity.png',
        imageAlt: 'Pantalla de actividad del gimnasio de Fitliner',
      },
    ],
    fr: [
      {
        kicker: 'Accès',
        title: 'Ouvrez votre salle en un geste',
        description: 'De l’accueil à l’écran d’entrée, l’accès paraît instantané et premium.',
        imageSrc: '/gym.png',
        imageAlt: 'Écran d’accès à la salle Fitliner',
      },
      {
        kicker: 'Entraînement',
        title: 'Programme personnalisé pour vous',
        description: 'Gardez votre plan, les détails des exercices et les prochaines étapes dans un parcours clair.',
        imageSrc: '/training.png',
        imageAlt: 'Écran du programme d’entraînement Fitliner',
      },
      {
        kicker: 'Activité',
        title: 'Voyez quand votre salle est chargée',
        description: 'Utilisez de vraies données d’activité pour choisir le meilleur moment.',
        imageSrc: '/gymactivity.png',
        imageAlt: 'Écran d’activité de la salle Fitliner',
      },
    ],
    'zh-Hans': [
      {
        kicker: '门禁',
        title: '一键打开健身房大门',
        description: '从首页到入场界面，整个体验都更快、更高级。',
        imageSrc: '/gym.png',
        imageAlt: 'Fitliner 健身房门禁界面',
      },
      {
        kicker: '训练',
        title: '为你量身定制的训练计划',
        description: '把当前计划、动作详情和下一步安排放进一个清晰流程里。',
        imageSrc: '/training.png',
        imageAlt: 'Fitliner 训练计划界面',
      },
      {
        kicker: '活跃度',
        title: '查看健身房什么时候最忙',
        description: '通过真实活跃数据，选择更适合训练的时间。',
        imageSrc: '/gymactivity.png',
        imageAlt: 'Fitliner 健身房活跃度界面',
      },
    ],
  };

  return items[locale] ?? items.en;
}

async function loadMessages(locale: string): Promise<Messages> {
  if (!isSiteLocale(locale)) notFound();
  const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as Messages;
}

function getSupportLabel(locale: string): string {
  const labels: Record<string, string> = {
    en: 'Support',
    sk: 'Podpora',
    de: 'Support',
    es: 'Soporte',
    fr: 'Support',
    'zh-Hans': '支持',
  };

  return labels[locale] ?? 'Support';
}

function LanguageSwitcherDesktop({current}: {current: string}) {
  const FLAGS: Record<string, string> = {
    en: '🇺🇸',
    sk: '🇸🇰',
    de: '🇩🇪',
    es: '🇪🇸',
    fr: '🇫🇷',
    'zh-Hans': '🇨🇳'
  };

  return (
    <div className="hidden items-center gap-2 sm:flex">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}`}
          title={l}
          className={
            'flex h-8 w-8 items-center justify-center rounded-full border text-lg transition ' +
            (l === current
              ? 'border-white/40 bg-white/15'
              : 'border-white/10 bg-white/5 hover:bg-white/10')
          }
        >
          {FLAGS[l]}
        </Link>
      ))}
    </div>
  );
}

function LanguageSwitcherMobile({current}: {current: string}) {
  const FLAGS: Record<string, string> = {
    en: '🇺🇸',
    sk: '🇸🇰',
    de: '🇩🇪',
    es: '🇪🇸',
    fr: '🇫🇷',
    'zh-Hans': '🇨🇳'
  };

  const currentFlag = FLAGS[current] ?? '🌐';

  return (
    <details className="relative sm:hidden">
      <summary className="list-none cursor-pointer select-none">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
          <span className="text-lg">{currentFlag}</span>
          <span className="text-xs text-white/60">{current}</span>
          <span className="ml-1 text-white/50">▾</span>
        </div>
      </summary>

      <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0D] shadow-2xl">
        {LOCALES.map((l) => (
          <Link
            key={l}
            href={`/${l}`}
            className={
              'flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 ' +
              (l === current ? 'bg-white/5' : '')
            }
          >
            <span className="text-lg">{FLAGS[l]}</span>
            <span className="text-xs text-white/70">{l}</span>
          </Link>
        ))}
      </div>
    </details>
  );
}

export default async function Page({
  params
}: {
  params: Promise<{locale: Locale}> | {locale: Locale};
}) {
  const resolved = params instanceof Promise ? await params : params;
  const locale = resolved.locale;
  const t = await loadMessages(locale);
  const supportLabel = getSupportLabel(locale);
  const hero = getHeroCopy(locale);
  const features = getFeatureItems(locale);
  const showcase = getShowcaseItems(locale);
  const androidComingSoon = true;
  const androidSoonLabel =
    locale === 'sk'
      ? 'Google Play už čoskoro'
      : locale === 'de'
        ? 'Google Play bald verfügbar'
        : locale === 'es'
          ? 'Google Play muy pronto'
          : locale === 'fr'
            ? 'Google Play bientôt'
            : locale === 'zh-Hans'
              ? 'Google Play 即将推出'
              : 'Google Play coming soon';

  // TODO: keď budeš mať linky, dáme ich sem alebo do env:
  const iosUrl =
    process.env.NEXT_PUBLIC_APPSTORE_URL ||
    'https://apps.apple.com/app/id6760855966';
  const androidUrl =
    process.env.NEXT_PUBLIC_PLAYSTORE_URL ||
    'https://play.google.com/store/apps/details?id=com.fitliner.app';
  const guides = locale === 'sk'
    ? [
        {slug: 'phone-gym-access', title: 'Ako funguje vstup do fitka cez telefón', description: 'Bezpečnosť, záložné scenáre a čo očakávať pri dverách.'},
        {slug: 'gym-management-software-checklist', title: 'Ako vybrať systém pre fitnesscentrum', description: 'Praktický checklist pre vstup, platby, členstvá a migráciu.'},
        {slug: 'health-report-timeline', title: 'Ako si vytvoriť prehľad zdravotných výsledkov', description: 'Ako bezpečne nahrať, overiť a sledovať hodnoty bez nahrádzania lekára.'}
      ]
    : locale === 'en'
      ? [
          {slug: 'phone-gym-access', title: 'How phone-based gym access works', description: 'Security, backup scenarios and what members should expect at the door.'},
          {slug: 'gym-management-software-checklist', title: 'How to choose gym management software', description: 'A practical checklist for access, payments, memberships and migration.'},
          {slug: 'health-report-timeline', title: 'How to build a useful health-report timeline', description: 'Upload, verify and follow results responsibly without replacing medical care.'}
        ]
      : [];
  const mobileApplication = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    '@id': `${SITE_URL}/#app`,
    name: 'Fitliner',
    operatingSystem: 'iOS, Android',
    applicationCategory: 'HealthApplication',
    url: `${SITE_URL}/${locale}`,
    description: HOME_SEO[locale].description,
    image: `${SITE_URL}/icon.png`,
    downloadUrl: [iosUrl, androidUrl],
    publisher: {'@id': `${SITE_URL}/#organization`},
    featureList: hero.bullets
  };

  return (
    <>
      <JsonLd data={mobileApplication} />
    <main className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="pt-1">
            <div className="inline-flex items-start text-white">
              <span className="text-[18px] font-extrabold leading-none tracking-[0.22em]">
                F I T L I N E R
              </span>
              <span className="ml-[3px] -translate-y-[4px] text-[8px] font-extrabold leading-none tracking-[0.04em] text-white/70">
                TM
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <LanguageSwitcherMobile current={locale} />
            <LanguageSwitcherDesktop current={locale} />
          </div>
        </div>

        <section className="mt-14 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#A78BFA]/25 bg-[#7C3AED]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C4B5FD]">
              {hero.eyebrow}
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              {hero.subtitle}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-1">
              {hero.bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7C3AED]/20 text-[#C4B5FD]">
                    ✓
                  </span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
              <a
                href={iosUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Download Fitliner on the App Store"
                className="flex min-h-[78px] items-center justify-center gap-5 rounded-[18px] border-2 border-[#A6A6A6] bg-black px-6 py-3 text-white shadow-lg shadow-black/25 transition hover:border-white/80 hover:bg-[#050505]"
              >
                <Image
                  src="/badge/appstore.png"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                  aria-hidden="true"
                />
                <span className="text-left leading-none">
                  <span className="block text-[15px] font-semibold tracking-[0.04em] text-white sm:text-[16px]">
                    {locale === 'sk'
                      ? 'Stiahnuť z'
                      : locale === 'de'
                        ? 'Laden im'
                        : locale === 'es'
                          ? 'Descargar en'
                          : locale === 'fr'
                            ? 'Télécharger sur'
                            : locale === 'zh-Hans'
                              ? '下载于'
                              : 'Download on the'}
                  </span>
                  <span className="mt-1 block text-[30px] font-semibold tracking-[-0.04em] text-white sm:text-[34px]">
                    App Store
                  </span>
                </span>
              </a>

              <a
                href={androidUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Get Fitliner on Google Play"
                className="flex min-h-[78px] items-center justify-center gap-5 rounded-[18px] border-2 border-[#A6A6A6] bg-black px-6 py-3 text-white shadow-lg shadow-black/25 transition hover:border-white/80 hover:bg-[#050505]"
              >
                <Image
                  src="/badge/googleplay.png"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                  aria-hidden="true"
                />
                <span className="text-left leading-none">
                  <span className="block text-[17px] font-normal tracking-[0.03em] text-white sm:text-[19px]">
                    {locale === 'sk'
                      ? 'Stiahnuť z'
                      : locale === 'de'
                        ? 'Jetzt bei'
                        : locale === 'es'
                          ? 'Consíguelo en'
                          : locale === 'fr'
                            ? 'Disponible sur'
                            : locale === 'zh-Hans'
                              ? '下载于'
                              : 'Get it on'}
                  </span>
                  <span className="mt-1 block text-[28px] font-semibold tracking-[-0.04em] text-white sm:text-[33px]">
                    Google Play
                  </span>
                </span>
              </a>
            </div>

            <div className="mt-4 text-sm text-white/45">{hero.secondaryNote}</div>
            <div className="mt-2 text-sm text-white/60">{hero.socialProof}</div>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/25 blur-3xl" />

            <div className="relative mx-auto w-full max-w-[420px] rounded-[2.4rem] border border-white/10 bg-gradient-to-b from-white/8 to-white/5 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
              <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-black/50">
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="h-2 w-24 rounded-full bg-white/10" />
                  <div className="h-2 w-10 rounded-full bg-white/10" />
                </div>

                <div className="px-4 pb-4">
                  <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                    <Image
                      src="/gym.png"
                      alt="Fitliner gym access screen"
                      width={600}
                      height={900}
                      priority
                      sizes="(max-width: 1024px) 420px, 36vw"
                      className="h-[620px] w-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
          <div className="text-sm uppercase tracking-[0.2em] text-[#A78BFA]">
            {locale === 'sk'
              ? 'Prečo Fitliner'
              : locale === 'de'
                ? 'Warum Fitliner'
                : locale === 'es'
                  ? 'Por qué Fitliner'
                  : locale === 'fr'
                    ? 'Pourquoi Fitliner'
                    : locale === 'zh-Hans'
                      ? '为什么选择 Fitliner'
                      : 'Why Fitliner'}
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-white">
            {locale === 'sk'
              ? 'Väčšina fitness appiek iba trackuje. Fitliner všetko reálne prepája.'
              : locale === 'de'
                ? 'Die meisten Fitness-Apps tracken nur. Fitliner verbindet wirklich alles.'
                : locale === 'es'
                  ? 'La mayoría de apps fitness solo registran. Fitliner lo conecta todo de verdad.'
                  : locale === 'fr'
                    ? 'La plupart des apps fitness se contentent de suivre. Fitliner relie vraiment tout.'
                    : locale === 'zh-Hans'
                      ? '大多数健身应用只会记录。Fitliner 真正把一切连接起来。'
                      : 'Most fitness apps track. Fitliner actually connects everything.'}
          </h2>
          <div className="mt-6 space-y-2 text-sm text-white/70">
            <div>
              {locale === 'sk'
                ? '→ Žiadne karty. Žiadne trenie.'
                : locale === 'de'
                  ? '→ Keine Karten. Keine Reibung.'
                  : locale === 'es'
                    ? '→ Sin tarjetas. Sin fricción.'
                    : locale === 'fr'
                      ? '→ Pas de cartes. Pas de friction.'
                      : locale === 'zh-Hans'
                        ? '→ 不用卡片。没有阻力。'
                        : '→ No cards. No friction.'}
            </div>
            <div>
              {locale === 'sk'
                ? '→ Reálny vstup do fitka + reálny progres'
                : locale === 'de'
                  ? '→ Echter Gym-Zugang + echter Fortschritt'
                  : locale === 'es'
                    ? '→ Acceso real al gimnasio + progreso real'
                    : locale === 'fr'
                      ? '→ Vrai accès à la salle + vraie progression'
                      : locale === 'zh-Hans'
                        ? '→ 真实门禁 + 真实进步'
                        : '→ Real gym access + real progress'}
            </div>
            <div>
              {locale === 'sk'
                ? '→ Odmeny, ktoré ťa držia v konzistencii'
                : locale === 'de'
                  ? '→ Belohnungen, die dich konstant halten'
                  : locale === 'es'
                    ? '→ Recompensas que te ayudan a ser constante'
                    : locale === 'fr'
                      ? '→ Des récompenses qui vous gardent régulier'
                      : locale === 'zh-Hans'
                        ? '→ 奖励机制帮你保持稳定'
                        : '→ Rewards that keep you consistent'}
            </div>
          </div>
        </section>
        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <div className="text-lg font-semibold text-white">{item.title}</div>
              <p className="mt-3 text-sm leading-6 text-white/65">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-5 lg:grid-cols-3">
          {showcase.map((item) => (
            <div
              key={item.title}
              className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/5 transition hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(124,58,237,0.25)]"
            >
              <div className="border-b border-white/10 px-6 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A78BFA]">
                  {item.kicker}
                </div>
                <div className="mt-3 text-2xl font-semibold leading-tight text-white">
                  {item.title}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">{item.description}</p>
              </div>

              <div className="p-5">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    width={600}
                    height={900}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="h-[420px] w-full object-cover object-top"
                    style={item.imagePosition ? {objectPosition: item.imagePosition} : undefined}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>
        <section className="mt-16 grid gap-5 lg:grid-cols-3">
          <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/5 transition hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(124,58,237,0.25)] lg:col-span-2">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A78BFA]">
                {locale === 'sk'
                  ? 'Domov'
                  : locale === 'de'
                    ? 'Start'
                    : locale === 'es'
                      ? 'Inicio'
                      : locale === 'fr'
                        ? 'Accueil'
                        : locale === 'zh-Hans'
                          ? '首页'
                          : 'Home'}
              </div>
              <div className="mt-3 text-2xl font-semibold leading-tight text-white">
                {locale === 'sk'
                  ? 'Jedna obrazovka, všetko dôležité'
                  : locale === 'de'
                    ? 'Ein Screen für alles Wichtige'
                    : locale === 'es'
                      ? 'Una sola pantalla para lo importante'
                      : locale === 'fr'
                        ? 'Un seul écran pour l’essentiel'
                        : locale === 'zh-Hans'
                          ? '一个首页，掌握全部重点'
                          : 'One screen for everything that matters'}
              </div>
              <p className="mt-3 text-sm leading-6 text-white/65">
                {locale === 'sk'
                  ? 'Food tracking, progres, vstup do fitka a odmeny na jednom čistom domovskom screene.'
                  : locale === 'de'
                    ? 'Food-Tracking, Fortschritt, Gym-Zugang und Belohnungen auf einem klaren Homescreen.'
                    : locale === 'es'
                      ? 'Comida, progreso, acceso al gimnasio y recompensas en una home clara y moderna.'
                      : locale === 'fr'
                        ? 'Nutrition, progression, accès à la salle et récompenses sur un accueil clair et moderne.'
                        : locale === 'zh-Hans'
                          ? '饮食记录、进度、门禁和奖励，都集中在一个清晰的首页中。'
                          : 'Food tracking, progress, gym access and rewards in one clean home view.'}
              </p>
            </div>

            <div className="p-5">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                <Image
                  src="/home.png"
                  alt="Fitliner home screen"
                  width={600}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-[520px] w-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/5 transition hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(124,58,237,0.25)]">
              <div className="border-b border-white/10 px-6 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A78BFA]">
                  Messenger
                </div>
                <div className="mt-3 text-2xl font-semibold leading-tight text-white">
                  {locale === 'sk'
                    ? 'Komunita a kouč v jednej appke'
                    : locale === 'de'
                      ? 'Community und Coach in einer App'
                      : locale === 'es'
                        ? 'Comunidad y coach en una sola app'
                        : locale === 'fr'
                          ? 'Communauté et coach dans une seule app'
                          : locale === 'zh-Hans'
                            ? '社区和教练，都在一个应用里'
                            : 'Community and coaching in one app'}
                </div>
              </div>
              <div className="p-5">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                  <Image
                    src="/messenger.png"
                    alt="Fitliner messenger screen"
                    width={600}
                    height={900}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-[280px] w-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/5 transition hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(124,58,237,0.25)]">
              <div className="border-b border-white/10 px-6 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A78BFA]">
                  Guidance
                </div>
                <div className="mt-3 text-2xl font-semibold leading-tight text-white">
                  {locale === 'sk'
                    ? 'Cviky vysvetlené krok za krokom'
                    : locale === 'de'
                      ? 'Übungen Schritt für Schritt erklärt'
                      : locale === 'es'
                        ? 'Ejercicios explicados paso a paso'
                        : locale === 'fr'
                          ? 'Exercices expliqués pas à pas'
                          : locale === 'zh-Hans'
                            ? '动作指导，清晰分步骤'
                            : 'Step-by-step exercise guidance'}
                </div>
              </div>
              <div className="p-5">
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                  <Image
                    src="/exercise.png"
                    alt="Fitliner exercise detail screen"
                    width={600}
                    height={900}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-[280px] w-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {guides.length > 0 && (
          <section className="mt-16" aria-labelledby="guides-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">
                  {locale === 'sk' ? 'Praktické návody' : 'Practical guides'}
                </div>
                <h2 id="guides-heading" className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                  {locale === 'sk' ? 'Rozhoduj sa podľa faktov, nie marketingu' : 'Make informed fitness-tech decisions'}
                </h2>
              </div>
              <Link className="text-sm font-semibold text-[#B9A1FF] hover:text-white" href={`/${locale}/guides`}>
                {locale === 'sk' ? 'Všetky návody' : 'All guides'} →
              </Link>
            </div>
            <div className="mt-7 grid gap-4 lg:grid-cols-3">
              {guides.map((guide) => (
                <article key={guide.slug} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <h3 className="text-xl font-semibold leading-tight">
                    <Link className="hover:text-[#C4B5FD]" href={`/${locale}/guides/${guide.slug}`}>{guide.title}</Link>
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">{guide.description}</p>
                  <Link className="mt-5 inline-flex text-sm font-semibold text-[#B9A1FF]" href={`/${locale}/guides/${guide.slug}`}>
                    {locale === 'sk' ? 'Čítať návod' : 'Read guide'} →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 overflow-hidden rounded-[2rem] border border-[#8B5CF6]/30 bg-gradient-to-br from-[#7C3AED]/25 via-white/[0.055] to-white/[0.025] p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#B9A1FF]">
                {locale === 'sk' ? 'Novinka · Zdravotná karta' : locale === 'de' ? 'Neu · Gesundheitskarte' : locale === 'es' ? 'Nuevo · Tarjeta de Salud' : locale === 'fr' ? 'Nouveau · Carte Santé' : locale === 'zh-Hans' ? '全新 · 健康档案' : 'New · Health Card'}
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
                {locale === 'sk' ? 'Krvné testy a výsledky z váhy. Prehľadne, v čase a s kontextom.' : locale === 'de' ? 'Blutwerte und Körperanalyse. Klar, im Verlauf und mit Kontext.' : locale === 'es' ? 'Análisis de sangre y composición corporal, claros y con contexto.' : locale === 'fr' ? 'Bilans sanguins et composition corporelle, clairs et contextualisés.' : locale === 'zh-Hans' ? '化验结果与体成分数据，清晰展示长期趋势。' : 'Blood tests and body composition, clear over time and in context.'}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                {locale === 'sk' ? 'Nahraj PDF alebo fotografiu, skontroluj rozpoznané hodnoty a sleduj každú metriku vo vlastnom grafe. Aktívni členovia partnerských gymov ju majú v cene.' : locale === 'de' ? 'PDF oder Foto hochladen, erkannte Werte prüfen und jede Messgröße im eigenen Verlauf verfolgen. Bei aktiver Mitgliedschaft in einem Partnerstudio inklusive.' : locale === 'es' ? 'Sube un PDF o una foto, revisa los valores detectados y sigue cada métrica en su propio gráfico.' : locale === 'fr' ? 'Importez un PDF ou une photo, vérifiez les valeurs détectées et suivez chaque mesure dans son propre graphique.' : locale === 'zh-Hans' ? '上传 PDF 或照片，确认识别结果，并在独立图表中追踪每项指标。' : 'Upload a PDF or photo, review detected values and follow every metric in its own chart. Included with active partner-gym memberships.'}
              </p>
            </div>
            <Link href={`/${locale}/health`} className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-[#8B5CF6] px-7 py-4 font-bold text-white shadow-[0_16px_45px_rgba(124,58,237,0.3)] transition hover:brightness-110">
              {locale === 'sk' ? 'Zistiť, ako funguje' : locale === 'de' ? 'So funktioniert es' : locale === 'es' ? 'Ver cómo funciona' : locale === 'fr' ? 'Découvrir' : locale === 'zh-Hans' ? '了解详情' : 'See how it works'} →
            </Link>
          </div>
        </section>

        <footer className="mt-16 border-t border-white/10 pt-10 pb-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="inline-flex items-start text-white">
                <span className="text-[18px] font-extrabold leading-none tracking-[0.22em]">
                  F I T L I N E R
                </span>
                <span className="ml-[3px] -translate-y-[4px] text-[8px] font-extrabold leading-none tracking-[0.04em] text-white/70">
                  TM
                </span>
              </div>
              <div className="mt-2 max-w-xs text-sm leading-6 text-white/60">{hero.socialProof}</div>
            </div>

            {/* Links */}
            <div className="text-sm">
              <div className="text-white/70">{t.footer.links_title}</div>
              <div className="mt-3 flex flex-col gap-2 text-white/60">
                <Link className="hover:text-white" href={`/${locale}/privacy`}>
                  🛡️ {t.footer.privacy}
                </Link>
                <Link className="hover:text-white" href={`/${locale}/terms`}>
                  📄 {t.footer.terms}
                </Link>
                <Link className="hover:text-white" href={`/${locale}/gyms`}>
                  🏋️ {t.footer.for_gyms}
                </Link>
                <Link className="hover:text-white" href={`/${locale}/health`}>
                  ✦ {locale === 'sk' ? 'Zdravotná karta' : locale === 'de' ? 'Gesundheitskarte' : locale === 'es' ? 'Tarjeta de Salud' : locale === 'fr' ? 'Carte Santé' : locale === 'zh-Hans' ? '健康档案' : 'Health Card'}
                </Link>
                <Link className="hover:text-white" href={`/${locale}/support`}>
                  💬 {supportLabel}
                </Link>
                {(locale === 'en' || locale === 'sk') && (
                  <Link className="hover:text-white" href={`/${locale}/guides`}>
                    📚 {locale === 'sk' ? 'Návody' : 'Guides'}
                  </Link>
                )}
              </div>
            </div>

            {/* App */}
            <div className="text-sm">
              <div className="text-white/70">{t.footer.app_title}</div>
              <div className="mt-3 flex flex-col gap-2 text-white/60">
                <a
                  className="hover:text-white"
                  href={iosUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                   {t.footer.download_ios}
                </a>
                {androidComingSoon ? (
                  <span className="text-white/35">▶︎ {androidSoonLabel}</span>
                ) : (
                  <a
                    className="hover:text-white"
                    href={androidUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ▶︎ {t.footer.download_android}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 text-xs text-white/40">
            © {new Date().getFullYear()} BeFitliner. {t.footer.rights}
          </div>
        </footer>
      </div>
    </main>
    </>
  );
}
