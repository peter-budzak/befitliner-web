import type {Metadata} from 'next';

export const SITE_URL = 'https://www.befitliner.com';
export const SITE_NAME = 'Fitliner';
export const LEGAL_NAME = 'Globalio LLC';
export const SUPPORT_EMAIL = 'support@fitliner.eu';
export const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;
export type SiteLocale = (typeof LOCALES)[number];

export const LANGUAGE_TAGS: Record<SiteLocale, string> = {
  en: 'en',
  sk: 'sk',
  de: 'de',
  es: 'es',
  fr: 'fr',
  'zh-Hans': 'zh-Hans'
};

export const OPEN_GRAPH_LOCALES: Record<SiteLocale, string> = {
  en: 'en_US',
  sk: 'sk_SK',
  de: 'de_DE',
  es: 'es_ES',
  fr: 'fr_FR',
  'zh-Hans': 'zh_CN'
};

export const HOME_SEO: Record<SiteLocale, {title: string; description: string}> = {
  en: {
    title: 'Fitliner: Gym Access, Training, Food Tracking & Progress App',
    description: 'Use your phone as a gym key, follow training plans, track food and progress, message your coach and earn rewards with Fitliner for iOS and Android.'
  },
  sk: {
    title: 'Fitliner: vstup do fitka, tréning, jedlo a progres v jednej appke',
    description: 'Použi telefón ako kľúč do fitka, sleduj tréning, jedlo a progres, komunikuj s trénerom a získavaj odmeny v aplikácii Fitliner.'
  },
  de: {
    title: 'Fitliner: Gym-Zugang, Training, Ernährung und Fortschritt',
    description: 'Nutze dein Smartphone als Gym-Schlüssel, folge Trainingsplänen, tracke Ernährung und Fortschritt und bleibe mit deinem Coach verbunden.'
  },
  es: {
    title: 'Fitliner: acceso al gimnasio, entrenamiento y progreso',
    description: 'Usa el móvil como llave del gimnasio, sigue tu plan, registra comida y progreso, habla con tu coach y consigue recompensas con Fitliner.'
  },
  fr: {
    title: 'Fitliner : accès à la salle, entraînement et progression',
    description: 'Utilisez votre téléphone comme clé de salle, suivez vos séances, repas et progrès, échangez avec votre coach et gagnez des récompenses.'
  },
  'zh-Hans': {
    title: 'Fitliner：健身房门禁、训练、饮食与进度管理应用',
    description: '用手机打开健身房门，跟随训练计划，记录饮食和进度，与教练沟通并获得奖励，一切尽在 Fitliner。'
  }
};

export const HEALTH_SEO: Record<SiteLocale, {title: string; description: string}> = {
  en: {
    title: 'Fitliner Health Card: Turn Health Reports Into a Clear Timeline',
    description: 'Upload a lab report or diagnostic-scale result, review extracted values and follow confirmed health metrics over time. Not a diagnosis or medical advice.'
  },
  sk: {
    title: 'Fitliner Health: história krvných výsledkov v jednom prehľade',
    description: 'Nahraj staré aj nové krvné výsledky z PDF alebo fotografie, skontroluj rozpoznané hodnoty a sleduj ich potvrdený vývoj v čase.'
  },
  de: {
    title: 'Fitliner Gesundheitskarte: Gesundheitswerte im Zeitverlauf',
    description: 'Lade Labor- oder Körperanalyseberichte hoch, prüfe erkannte Werte und verfolge bestätigte Gesundheitsmetriken übersichtlich im Zeitverlauf.'
  },
  es: {
    title: 'Fitliner Health Card: tus resultados de salud en el tiempo',
    description: 'Sube informes de laboratorio o báscula diagnóstica, revisa los valores extraídos y sigue las métricas confirmadas en una línea temporal clara.'
  },
  fr: {
    title: 'Fitliner Health Card : vos résultats de santé dans le temps',
    description: 'Importez un bilan de laboratoire ou de balance diagnostique, vérifiez les valeurs extraites et suivez les mesures confirmées dans le temps.'
  },
  'zh-Hans': {
    title: 'Fitliner 健康档案：清晰追踪长期健康指标',
    description: '上传化验单或诊断秤报告，核对提取的数据，并在清晰的时间轴中追踪已确认的健康指标。'
  }
};

export const GYMS_SEO: Record<SiteLocale, {title: string; description: string}> = {
  en: {
    title: 'Fitliner for Gyms: Smart Access, Memberships and Payments',
    description: 'Run gym access, memberships, online payments, member communication and traffic insights in one system built for independent gyms.'
  },
  sk: {
    title: 'Fitliner pre fitnesscentrá: vstup, členstvá a platby',
    description: 'Automatizujte vstup do fitka, členstvá, online platby, komunikáciu a prehľad návštevnosti v jednom systéme pre fitnesscentrá.'
  },
  de: {
    title: 'Fitliner für Fitnessstudios: Zutritt, Mitgliedschaften und Zahlungen',
    description: 'Verwalte Studiozugang, Mitgliedschaften, Online-Zahlungen, Kommunikation und Auslastung in einem System für moderne Fitnessstudios.'
  },
  es: {
    title: 'Fitliner para gimnasios: acceso, membresías y pagos',
    description: 'Gestiona acceso, membresías, pagos online, comunicación y datos de afluencia en un sistema pensado para gimnasios modernos.'
  },
  fr: {
    title: 'Fitliner pour salles de sport : accès, abonnements et paiements',
    description: 'Gérez accès, abonnements, paiements en ligne, communication et fréquentation dans un système conçu pour les salles modernes.'
  },
  'zh-Hans': {
    title: 'Fitliner 健身房系统：智能门禁、会员与在线付款',
    description: '在一个系统中管理健身房门禁、会员、在线付款、会员沟通和客流数据，适合现代独立健身房。'
  }
};

export const SUPPORT_SEO: Record<SiteLocale, {title: string; description: string}> = {
  en: {title: 'Fitliner Support', description: 'Get help with the Fitliner app, sign-in, gym access, memberships, payments, Health Card or your account.'},
  sk: {title: 'Fitliner podpora', description: 'Pomoc s aplikáciou Fitliner, prihlásením, vstupom do fitka, členstvom, platbou, Zdravotnou kartou alebo účtom.'},
  de: {title: 'Fitliner Support', description: 'Hilfe zur Fitliner App, Anmeldung, Studiozugang, Mitgliedschaft, Zahlung, Gesundheitskarte oder zum Konto.'},
  es: {title: 'Soporte de Fitliner', description: 'Ayuda con la app Fitliner, inicio de sesión, acceso al gimnasio, membresías, pagos, Health Card o tu cuenta.'},
  fr: {title: 'Support Fitliner', description: 'Aide pour l’app Fitliner, la connexion, l’accès à la salle, les abonnements, paiements, Health Card ou votre compte.'},
  'zh-Hans': {title: 'Fitliner 支持', description: '获取有关 Fitliner 应用、登录、健身房门禁、会员、付款、健康档案或账户的帮助。'}
};

export function isSiteLocale(value: string): value is SiteLocale {
  return LOCALES.includes(value as SiteLocale);
}

export function absoluteUrl(path = '/') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function localizedAlternates(path = '') {
  const suffix = path ? `/${path.replace(/^\//, '')}` : '';
  return Object.fromEntries([
    ...LOCALES.map((locale) => [LANGUAGE_TAGS[locale], absoluteUrl(`/${locale}${suffix}`)]),
    ['x-default', absoluteUrl(`/en${suffix}`)]
  ]);
}

export function pageMetadata({
  locale,
  path = '',
  title,
  description,
  image = '/og/gym-default.png',
  index = true,
  languages = localizedAlternates(path)
}: {
  locale: SiteLocale;
  path?: string;
  title: string;
  description: string;
  image?: string;
  index?: boolean;
  languages?: Record<string, string>;
}): Metadata {
  const suffix = path ? `/${path.replace(/^\//, '')}` : '';
  const canonical = absoluteUrl(`/${locale}${suffix}`);
  const imageUrl = image.startsWith('http') ? image : absoluteUrl(image);

  return {
    title: {absolute: title},
    description,
    alternates: {canonical, languages},
    robots: {
      index,
      follow: true,
      googleBot: {
        index,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1
      }
    },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      locale: OPEN_GRAPH_LOCALES[locale],
      alternateLocale: LOCALES.filter((item) => item !== locale).map((item) => OPEN_GRAPH_LOCALES[item]),
      images: [{url: imageUrl, width: 1200, height: 630, alt: title}]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl]
    }
  };
}
