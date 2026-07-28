import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/json-ld';
import GymsFunnel from '@/components/gyms/gyms-funnel';
import {GYMS_SEO, isSiteLocale, pageMetadata, SITE_URL, type SiteLocale} from '@/lib/seo';

type PageProps = {params: Promise<{locale: string}> | {locale: string}};

type GymPageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  benefitsTitle: string;
  benefits: Array<{title: string; body: string}>;
  funnelTitle: string;
  funnelBody: string;
  back: string;
};

const COPY: Record<SiteLocale, GymPageCopy> = {
  en: {
    eyebrow: 'Fitliner for gyms',
    title: 'One system for gym access, memberships and member experience.',
    intro: 'Fitliner connects supported smart locks, digital memberships, online payments, member communication and useful traffic insights without forcing your members to juggle separate apps and access cards.',
    benefitsTitle: 'What a connected gym system should solve',
    benefits: [
      {title: 'Phone-based access', body: 'Give eligible members a clear digital entry flow and retain technical access logs for support and security.'},
      {title: 'Memberships and payments', body: 'Connect products, validity and online checkout so paid access does not depend on manual approval.'},
      {title: 'Member communication', body: 'Keep gym information, passes and direct communication close to the training experience.'},
      {title: 'Operational visibility', body: 'Use available entry activity to understand patterns while treating traffic figures as estimates, not safety counters.'}
    ],
    funnelTitle: 'Check whether Fitliner fits your gym',
    funnelBody: 'Answer a short set of operational questions. We use the details to assess your current access setup and next steps.',
    back: 'Fitliner for members'
  },
  sk: {
    eyebrow: 'Fitliner pre fitnesscentrá',
    title: 'Jeden systém pre vstup, členstvá a lepší zážitok členov.',
    intro: 'Fitliner prepája podporované smart zámky, digitálne členstvá, online platby, komunikáciu a užitočný prehľad návštevnosti bez ďalších kariet a oddelených aplikácií.',
    benefitsTitle: 'Čo má prepojený systém pre fitko vyriešiť',
    benefits: [
      {title: 'Vstup cez telefón', body: 'Oprávnený člen dostane jasný digitálny vstup a fitko technické záznamy pre podporu a bezpečnosť.'},
      {title: 'Členstvá a platby', body: 'Prepojte produkty, platnosť a online checkout, aby zaplatený vstup nečakal na ručné schválenie.'},
      {title: 'Komunikácia s členmi', body: 'Informácie o fitku, vstupy pre hostí a správy ostávajú blízko samotného tréningu.'},
      {title: 'Prehľad o prevádzke', body: 'Aktivitu vstupov využite na pochopenie trendov; návštevnosť je odhad, nie bezpečnostné počítadlo.'}
    ],
    funnelTitle: 'Overte si, či je Fitliner vhodný pre vaše fitko',
    funnelBody: 'Odpovedzte na krátke otázky o prevádzke. Podľa nich posúdime súčasný vstupný systém a ďalší postup.',
    back: 'Fitliner pre členov'
  },
  de: {
    eyebrow: 'Fitliner für Fitnessstudios',
    title: 'Ein System für Zutritt, Mitgliedschaften und Mitgliedererlebnis.',
    intro: 'Fitliner verbindet unterstützte Smart Locks, digitale Mitgliedschaften, Online-Zahlungen, Kommunikation und Auslastungseinblicke – ohne zusätzliche Karten und getrennte Apps.',
    benefitsTitle: 'Was ein verbundenes Studiosystem lösen sollte',
    benefits: [
      {title: 'Zutritt per Smartphone', body: 'Berechtigte Mitglieder erhalten einen klaren digitalen Zugang; technische Protokolle helfen bei Support und Sicherheit.'},
      {title: 'Mitgliedschaften und Zahlungen', body: 'Produkte, Laufzeiten und Online-Checkout werden verbunden, damit bezahlter Zutritt nicht manuell freigegeben werden muss.'},
      {title: 'Kommunikation', body: 'Studioinformationen, Gastpässe und Nachrichten bleiben nah am Trainingserlebnis.'},
      {title: 'Betriebliche Übersicht', body: 'Zutrittsaktivität zeigt Trends; Auslastungszahlen bleiben Schätzungen und sind keine Sicherheitszähler.'}
    ],
    funnelTitle: 'Prüfe, ob Fitliner zu deinem Studio passt',
    funnelBody: 'Beantworte einige kurze Fragen zum Betrieb. Damit bewerten wir das aktuelle Zutrittssystem und mögliche nächste Schritte.',
    back: 'Fitliner für Mitglieder'
  },
  es: {
    eyebrow: 'Fitliner para gimnasios',
    title: 'Un sistema para acceso, membresías y experiencia del socio.',
    intro: 'Fitliner conecta cerraduras compatibles, membresías digitales, pagos online, comunicación y datos útiles de afluencia sin obligar a usar tarjetas y apps separadas.',
    benefitsTitle: 'Qué debe resolver un sistema conectado',
    benefits: [
      {title: 'Acceso con el móvil', body: 'Los socios autorizados obtienen un acceso digital claro y el gimnasio conserva registros técnicos para soporte y seguridad.'},
      {title: 'Membresías y pagos', body: 'Conecta productos, vigencia y checkout para que el acceso pagado no dependa de aprobación manual.'},
      {title: 'Comunicación', body: 'Información, pases de invitado y mensajes permanecen cerca de la experiencia de entrenamiento.'},
      {title: 'Visibilidad operativa', body: 'La actividad de entrada ayuda a ver tendencias; la afluencia es una estimación, no un contador de seguridad.'}
    ],
    funnelTitle: 'Comprueba si Fitliner encaja con tu gimnasio',
    funnelBody: 'Responde unas preguntas breves sobre la operación. Las usamos para valorar el acceso actual y los siguientes pasos.',
    back: 'Fitliner para socios'
  },
  fr: {
    eyebrow: 'Fitliner pour les salles',
    title: 'Un système pour l’accès, les abonnements et l’expérience membre.',
    intro: 'Fitliner relie serrures compatibles, abonnements numériques, paiements en ligne, communication et données de fréquentation sans multiplier cartes et applications.',
    benefitsTitle: 'Ce qu’un système connecté doit résoudre',
    benefits: [
      {title: 'Accès par téléphone', body: 'Les membres autorisés bénéficient d’un parcours clair et la salle conserve les journaux techniques utiles au support et à la sécurité.'},
      {title: 'Abonnements et paiements', body: 'Reliez produits, validité et checkout afin que l’accès payé ne dépende pas d’une validation manuelle.'},
      {title: 'Communication', body: 'Informations, invitations et messages restent proches de l’expérience d’entraînement.'},
      {title: 'Vue opérationnelle', body: 'L’activité d’entrée révèle des tendances ; la fréquentation reste une estimation, pas un compteur de sécurité.'}
    ],
    funnelTitle: 'Vérifiez si Fitliner convient à votre salle',
    funnelBody: 'Répondez à quelques questions sur votre fonctionnement. Elles nous aident à évaluer l’accès actuel et les prochaines étapes.',
    back: 'Fitliner pour les membres'
  },
  'zh-Hans': {
    eyebrow: 'Fitliner 健身房解决方案',
    title: '一个系统管理门禁、会员和会员体验。',
    intro: 'Fitliner 将兼容的智能门锁、数字会员、在线付款、会员沟通和客流洞察连接起来，减少独立应用和门禁卡。',
    benefitsTitle: '互联系统应解决的问题',
    benefits: [
      {title: '手机门禁', body: '符合条件的会员获得清晰的数字入场流程，健身房保留用于支持和安全的技术记录。'},
      {title: '会员与付款', body: '连接产品、有效期和在线结账，已付款的门禁无需依赖人工审批。'},
      {title: '会员沟通', body: '健身房信息、访客通行证和消息都与训练体验保持在一起。'},
      {title: '运营洞察', body: '使用入场活动了解趋势；客流数据是估算值，不可作为安全人数计数器。'}
    ],
    funnelTitle: '看看 Fitliner 是否适合你的健身房',
    funnelBody: '回答几个简短的运营问题，我们会据此评估当前门禁方式和后续步骤。',
    back: '会员版 Fitliner'
  }
};

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const resolved = params instanceof Promise ? await params : params;
  if (!isSiteLocale(resolved.locale)) return {};
  return pageMetadata({locale: resolved.locale, path: 'gyms', ...GYMS_SEO[resolved.locale]});
}

export default async function GymsPage({params}: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  if (!isSiteLocale(resolved.locale)) notFound();
  const locale = resolved.locale;
  const copy = COPY[locale];
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/${locale}/gyms#service`,
    name: GYMS_SEO[locale].title,
    description: GYMS_SEO[locale].description,
    url: `${SITE_URL}/${locale}/gyms`,
    provider: {'@id': `${SITE_URL}/#organization`},
    serviceType: 'Gym management, membership and smart access platform',
    areaServed: 'Worldwide',
    audience: {'@type': 'BusinessAudience', audienceType: 'Fitness studios and gyms'}
  };

  return (
    <main className="min-h-screen bg-[#0B0B0D] text-white">
      <JsonLd data={serviceSchema} />
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 sm:py-16">
        <Link className="text-sm text-white/60 hover:text-white" href={`/${locale}`}>← {copy.back}</Link>
        <header className="mt-10 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{copy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl">{copy.title}</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">{copy.intro}</p>
        </header>

        <section className="mt-14" aria-labelledby="gym-benefits-title">
          <h2 id="gym-benefits-title" className="text-2xl font-bold sm:text-3xl">{copy.benefitsTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {copy.benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">{benefit.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-[#8B5CF6]/25 bg-[#7C3AED]/10 p-5 sm:p-8" aria-labelledby="gym-fit-title">
          <h2 id="gym-fit-title" className="text-2xl font-bold sm:text-3xl">{copy.funnelTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">{copy.funnelBody}</p>
          <GymsFunnel locale={locale} />
        </section>

        {(locale === 'en' || locale === 'sk') && (
          <p className="mt-10 text-sm text-white/55">
            <Link className="font-semibold text-[#B9A1FF] hover:text-white" href={`/${locale}/guides/gym-management-software-checklist`}>
              {locale === 'sk' ? 'Prečítať checklist výberu systému pre fitko' : 'Read the gym software selection checklist'} →
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
