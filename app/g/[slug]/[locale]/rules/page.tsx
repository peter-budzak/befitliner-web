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
  rules_text: string | null;
  currency: string;
  timezone: string;
};

type Copy = {
  back: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  noRules: string;
  defaultRules: string;
  powered: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    back: 'Back to gym',
    eyebrow: 'Gym rules',
    title: 'Rules',
    subtitle: 'Please read the rules before entering the gym.',
    noRules: 'This gym has not published rules yet.',
    defaultRules: '🏋️‍♂️ Gym entry\nEvery customer must record their entry using the Fitliner app. Entering without opening the door via the app is considered a violation of the rules.\n\n🚫 No sharing access\nPurchased membership or entry is intended strictly for one person only. Letting other people into the gym on your own access is not allowed.\n\n📵 Rule violations\nThe gym owner reserves the right to immediately cancel gym access without refund or compensation if a rule violation is detected.\n\n⚠️ Training at your own risk\nEvery visitor trains at their own risk and is responsible for their health condition. In case of health issues, training must be adapted to personal capabilities.\n\n👟 Shoes and towel\nClean indoor sports shoes are required in the gym. Every visitor must use a towel when exercising on machines and benches.\n\n🧹 Keep things tidy\nAfter using a machine or equipment, everyone must return it to its place and keep the training area tidy.\n\n🎥 Camera system\nGym premises may be monitored by a camera system for property protection and visitor safety.\n\n🤝 Respect and consideration\nBehave respectfully toward other visitors. Inappropriate behavior, damage to equipment, or harassment of others may lead to an entry ban.',
    powered: 'Powered by Fitliner',
  },
  sk: {
    back: 'Späť na fitko',
    eyebrow: 'Pravidlá fitka',
    title: 'Pravidlá',
    subtitle: 'Pred vstupom do fitka si prosím prečítaj pravidlá.',
    noRules: 'Toto fitko zatiaľ nezverejnilo pravidlá.',
    defaultRules: '🏋️‍♂️ Vstup do gymu\nKaždý zákazník je povinný zaznamenať svoj vstup pomocou aplikácie Fitliner. Vstup bez otvorenia dverí cez aplikáciu sa považuje za porušenie pravidiel.\n\n🚫 Zákaz zdieľania vstupu\nZakúpené členstvo alebo vstup je určený výhradne pre jednu osobu. Nie je dovolené vpúšťať do gymu ďalšie osoby na svoj vstup.\n\n📵 Porušenie pravidiel\nMajiteľ gymu si vyhradzuje právo pri zistení porušenia pravidiel okamžite zrušiť prístup do gymu bez nároku na vrátenie peňazí alebo náhradu škody.\n\n⚠️ Tréning na vlastnú zodpovednosť\nKaždý návštevník cvičí na vlastnú zodpovednosť a zodpovedá za svoj zdravotný stav. V prípade zdravotných problémov je potrebné prispôsobiť tréning vlastným možnostiam.\n\n👟 Obuv a uterák\nV gyme je povinné používať čistú športovú obuv určenú do interiéru. Každý návštevník je povinný používať uterák pri cvičení na strojoch a lavičkách.\n\n🧹 Udržiavanie poriadku\nPo použití stroja alebo náradia je každý povinný vrátiť vybavenie na svoje miesto a udržiavať poriadok v tréningovom priestore.\n\n🎥 Kamerový systém\nPriestory gymu môžu byť monitorované kamerovým systémom za účelom ochrany majetku a bezpečnosti návštevníkov.\n\n🤝 Rešpekt a ohľaduplnosť\nSprávaj sa ohľaduplne k ostatným návštevníkom. Nevhodné správanie, poškodzovanie zariadenia alebo obťažovanie iných osôb môže viesť k zákazu vstupu.',
    powered: 'Vytvorené cez Fitliner',
  },
  de: {
    back: 'Zurück zum Gym',
    eyebrow: 'Gym-Regeln',
    title: 'Regeln',
    subtitle: 'Bitte lies die Regeln, bevor du das Gym betrittst.',
    noRules: 'Dieses Gym hat noch keine Regeln veröffentlicht.',
    defaultRules: '🏋️‍♂️ Zutritt zum Fitnessstudio\nJeder Kunde muss seinen Zutritt mit der Fitliner-App erfassen. Ein Zutritt ohne Öffnen der Tür über die App gilt als Regelverstoß.\n\n🚫 Zugang nicht teilen\nGekaufte Mitgliedschaft oder Zutritt ist ausschließlich für eine Person bestimmt. Es ist nicht erlaubt, weitere Personen mit dem eigenen Zutritt ins Fitnessstudio zu lassen.\n\n📵 Regelverstöße\nDer Besitzer des Fitnessstudios behält sich das Recht vor, bei Feststellung eines Regelverstoßes den Zugang zum Fitnessstudio sofort und ohne Anspruch auf Rückerstattung oder Schadensersatz zu sperren.\n\n⚠️ Training auf eigene Verantwortung\nJeder Besucher trainiert auf eigene Verantwortung und ist für seinen Gesundheitszustand selbst verantwortlich. Bei gesundheitlichen Problemen muss das Training den eigenen Möglichkeiten angepasst werden.\n\n👟 Schuhe und Handtuch\nIm Fitnessstudio sind saubere Hallensportschuhe Pflicht. Jeder Besucher muss beim Training an Geräten und auf Bänken ein Handtuch benutzen.\n\n🧹 Ordnung halten\nNach Benutzung eines Geräts oder Zubehörs muss alles an seinen Platz zurückgelegt und der Trainingsbereich sauber gehalten werden.\n\n🎥 Kamerasystem\nDie Räume des Fitnessstudios können zum Schutz des Eigentums und zur Sicherheit der Besucher videoüberwacht werden.\n\n🤝 Respekt und Rücksicht\nVerhalte dich respektvoll gegenüber anderen Besuchern. Unangemessenes Verhalten, Beschädigung von Geräten oder Belästigung anderer Personen kann zu einem Zutrittsverbot führen.',
    powered: 'Bereitgestellt von Fitliner',
  },
  es: {
    back: 'Volver al gimnasio',
    eyebrow: 'Reglas del gimnasio',
    title: 'Reglas',
    subtitle: 'Lee las reglas antes de entrar al gimnasio.',
    noRules: 'Este gimnasio aún no ha publicado reglas.',
    defaultRules: '🏋️‍♂️ Entrada al gimnasio\nCada cliente debe registrar su entrada usando la app Fitliner. Entrar sin abrir la puerta mediante la app se considera una infracción de las reglas.\n\n🚫 Prohibido compartir el acceso\nLa membresía o entrada comprada está destinada exclusivamente a una sola persona. No está permitido dejar entrar a otras personas al gimnasio con tu propio acceso.\n\n📵 Incumplimiento de las reglas\nEl propietario del gimnasio se reserva el derecho de cancelar inmediatamente el acceso al gimnasio sin derecho a reembolso ni compensación si detecta una infracción de las reglas.\n\n⚠️ Entrenamiento bajo tu propia responsabilidad\nCada visitante entrena bajo su propia responsabilidad y es responsable de su estado de salud. En caso de problemas de salud, es necesario adaptar el entrenamiento a sus propias posibilidades.\n\n👟 Calzado y toalla\nEn el gimnasio es obligatorio usar calzado deportivo limpio para interior. Cada visitante debe usar una toalla al entrenar en máquinas y bancos.\n\n🧹 Mantener el orden\nDespués de usar una máquina o un accesorio, cada persona debe devolver el equipo a su lugar y mantener el área de entrenamiento ordenada.\n\n🎥 Sistema de cámaras\nLas instalaciones del gimnasio pueden estar monitoreadas por cámaras con el fin de proteger la propiedad y la seguridad de los visitantes.\n\n🤝 Respeto y consideración\nCompórtate con respeto hacia los demás visitantes. El comportamiento inapropiado, el daño al equipamiento o el acoso a otras personas puede llevar a la prohibición de entrada.',
    powered: 'Desarrollado por Fitliner',
  },
  fr: {
    back: 'Retour à la salle',
    eyebrow: 'Règles de la salle',
    title: 'Règles',
    subtitle: 'Veuillez lire les règles avant d’entrer dans la salle.',
    noRules: 'Cette salle n’a pas encore publié de règles.',
    defaultRules: '🏋️‍♂️ Entrée dans la salle\nChaque client doit enregistrer son entrée à l’aide de l’application Fitliner. Entrer sans ouvrir la porte via l’application est considéré comme une violation des règles.\n\n🚫 Interdiction de partager l’accès\nL’abonnement ou l’entrée achetée est strictement destiné à une seule personne. Il est interdit de faire entrer d’autres personnes dans la salle avec son propre accès.\n\n📵 Violation des règles\nLe propriétaire de la salle se réserve le droit de supprimer immédiatement l’accès à la salle sans remboursement ni compensation en cas de violation des règles.\n\n⚠️ Entraînement sous sa propre responsabilité\nChaque visiteur s’entraîne sous sa propre responsabilité et est responsable de son état de santé. En cas de problème de santé, il est nécessaire d’adapter l’entraînement à ses propres capacités.\n\n👟 Chaussures et serviette\nDans la salle, il est obligatoire de porter des chaussures de sport propres pour l’intérieur. Chaque visiteur doit utiliser une serviette lors de l’entraînement sur les machines et les bancs.\n\n🧹 Maintenir l’ordre\nAprès utilisation d’une machine ou d’un équipement, chacun doit remettre le matériel à sa place et garder la zone d’entraînement propre.\n\n🎥 Système de caméras\nLes locaux de la salle peuvent être surveillés par un système de caméras afin de protéger les biens et d’assurer la sécurité des visiteurs.\n\n🤝 Respect et considération\nComporte-toi avec respect envers les autres visiteurs. Un comportement inapproprié, la dégradation du matériel ou le harcèlement d’autrui peut entraîner une interdiction d’entrée.',
    powered: 'Propulsé par Fitliner',
  },
  'zh-Hans': {
    back: '返回健身房',
    eyebrow: '健身房规则',
    title: '规则',
    subtitle: '进入健身房前请阅读规则。',
    noRules: '这家健身房尚未发布规则。',
    defaultRules: '🏋️‍♂️ 进入健身房\n每位客户都必须通过 Fitliner 应用记录入场。未通过应用开门而进入健身房将被视为违反规则。\n\n🚫 禁止共享入场权限\n购买的会员资格或入场仅供一人使用。不允许使用自己的入场权限让其他人进入健身房。\n\n📵 违反规则\n一旦发现违反规则，健身房所有者有权立即取消进入健身房的权限，且无权要求退款或赔偿。\n\n⚠️ 自行承担训练责任\n每位访客都需自行承担训练责任，并对自己的健康状况负责。如有健康问题，必须根据自身情况调整训练。\n\n👟 鞋子和毛巾\n在健身房内必须穿着干净的室内运动鞋。每位访客在使用器械和长椅训练时都必须使用毛巾。\n\n🧹 保持整洁\n使用器械或设备后，每个人都必须将设备放回原位，并保持训练区域整洁。\n\n🎥 摄像系统\n健身房区域可能会使用摄像监控系统，以保护财产和访客安全。\n\n🤝 尊重与体谅\n请尊重其他访客。不当行为、损坏设备或骚扰他人可能导致被禁止入内。',
    powered: '由 Fitliner 提供支持',
  },
};

function getCopy(locale: string) {
  return COPY[LOCALES.includes(locale as Locale) ? (locale as Locale) : 'en'];
}

export default async function PublicGymRulesPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, locale } = resolvedParams;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const copy = getCopy(locale);

  const { data: gym, error } = await supabase
    .rpc('get_public_gym_by_slug', { input_slug: slug })
    .maybeSingle<PublicGym>();

  if (error || !gym) {
    console.error('Failed to load public gym rules:', error);
    notFound();
  }

  const rulesText = gym.rules_text?.trim() || copy.defaultRules;

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

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="whitespace-pre-line text-sm leading-7 text-white/72">
            {rulesText}
          </p>
        </div>

        <footer className="mt-auto pt-10 text-center text-xs text-white/35">
          {copy.powered} · {gym.currency} · {gym.timezone}
        </footer>
      </section>
    </main>
  );
}
