import AcquisitionFooter from '@/components/acquisition-footer';
import RoleGateway from '@/components/role-gateway';
import {promises as fs} from 'fs';
import path from 'path';
import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/json-ld';
import {HOME_SEO, isSiteLocale, pageMetadata, SITE_URL} from '@/lib/seo';

const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;
type Locale = (typeof LOCALES)[number];

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
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
  params: Promise<{locale: Locale}>;
}) {
  const resolved = params instanceof Promise ? await params : params;
  const locale = resolved.locale;
  const t = await loadMessages(locale);
  const supportLabel = getSupportLabel(locale);
  const hero = getHeroCopy(locale);
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

        <RoleGateway locale={locale} />

        <AcquisitionFooter locale={locale} labels={t.footer} supportLabel={supportLabel} iosUrl={iosUrl} androidUrl={androidUrl} androidComingSoon={androidComingSoon} androidSoonLabel={androidSoonLabel} />
      </div>
    </main>
    </>
  );
}
