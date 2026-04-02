const SUPPORT_EMAIL = 'peter@peterbudzak.com';

type Locale = 'en' | 'sk' | 'de' | 'fr' | 'es' | 'zh-hans';

type SupportCopy = {
  badge: string;
  title: string;
  intro: string;
  fastestTitle: string;
  fastestBody: string;
  emailTitle: string;
  emailBody: string;
  emailButton: string;
  includeTitle: string;
  includeItems: string[];
  topicsTitle: string;
  topicsBody: string;
  responseTitle: string;
  responseBody: string;
};

const copyByLocale: Record<Locale, SupportCopy> = {
  en: {
    badge: 'BeFitliner Support',
    title: 'Contact support',
    intro:
      'Need help with the Fitliner app, gym access, membership, payments, or your account? Contact our support team using one of the options below.',
    fastestTitle: 'Fastest option: message us in the app',
    fastestBody:
      'Open the Fitliner app and go to Messenger, then send a message to the admin support account. This is the recommended support channel for active users.',
    emailTitle: 'Email support',
    emailBody:
      'If you cannot access the app, email us directly and include as much detail as possible.',
    emailButton: SUPPORT_EMAIL,
    includeTitle: 'What to include in your message',
    includeItems: [
      'your email used in the app',
      'gym name',
      'phone model and operating system',
      'app version, if available',
      'short description of the problem',
      'screenshot, if relevant',
    ],
    topicsTitle: 'Typical support topics',
    topicsBody:
      'We can help with sign in issues, app access, membership status, payment-related questions, gym entry problems, and general product support.',
    responseTitle: 'Response time',
    responseBody:
      'For active users, the fastest support is inside the app. Email requests are usually answered within 1–2 business days.',
  },
  sk: {
    badge: 'BeFitliner Podpora',
    title: 'Kontaktujte podporu',
    intro:
      'Potrebujete pomoc s aplikáciou Fitliner, vstupom do fitka, členstvom, platbami alebo účtom? Kontaktujte náš support jednou z možností nižšie.',
    fastestTitle: 'Najrýchlejšia možnosť: správa priamo v appke',
    fastestBody:
      'Otvorte aplikáciu Fitliner, prejdite do sekcie Messenger a pošlite správu admin support účtu. Pre aktívnych používateľov je to odporúčaný support kanál.',
    emailTitle: 'Email podpora',
    emailBody:
      'Ak sa neviete dostať do aplikácie, napíšte nám email a pridajte čo najviac detailov.',
    emailButton: SUPPORT_EMAIL,
    includeTitle: 'Čo uviesť v správe',
    includeItems: [
      'email, ktorý používate v appke',
      'názov fitka',
      'model telefónu a operačný systém',
      'verziu aplikácie, ak ju vidíte',
      'stručný popis problému',
      'screenshot, ak je relevantný',
    ],
    topicsTitle: 'Typické témy podpory',
    topicsBody:
      'Pomôžeme vám s problémami s prihlásením, prístupom do appky, stavom členstva, otázkami k platbám, vstupom do gymu aj so všeobecnou podporou produktu.',
    responseTitle: 'Čas odpovede',
    responseBody:
      'Pre aktívnych používateľov je najrýchlejšia podpora priamo v appke. Na emaily zvyčajne odpovedáme do 1–2 pracovných dní.',
  },
  de: {
    badge: 'BeFitliner Support',
    title: 'Support kontaktieren',
    intro:
      'Benötigen Sie Hilfe mit der Fitliner App, dem Fitnessstudio-Zugang, der Mitgliedschaft, Zahlungen oder Ihrem Konto? Kontaktieren Sie unser Support-Team über eine der folgenden Möglichkeiten.',
    fastestTitle: 'Schnellste Option: Nachricht in der App',
    fastestBody:
      'Öffnen Sie die Fitliner App, gehen Sie zum Messenger und senden Sie eine Nachricht an das Admin-Support-Konto. Das ist der empfohlene Support-Kanal für aktive Nutzer.',
    emailTitle: 'Support per E-Mail',
    emailBody:
      'Wenn Sie keinen Zugriff auf die App haben, schreiben Sie uns direkt per E-Mail und senden Sie möglichst viele Details mit.',
    emailButton: SUPPORT_EMAIL,
    includeTitle: 'Was in Ihrer Nachricht enthalten sein sollte',
    includeItems: [
      'Ihre in der App verwendete E-Mail-Adresse',
      'Name des Fitnessstudios',
      'Telefonmodell und Betriebssystem',
      'App-Version, falls verfügbar',
      'kurze Beschreibung des Problems',
      'Screenshot, falls relevant',
    ],
    topicsTitle: 'Typische Support-Themen',
    topicsBody:
      'Wir helfen bei Problemen mit der Anmeldung, dem App-Zugang, dem Mitgliedschaftsstatus, Fragen zu Zahlungen, Problemen beim Studiozugang und allgemeinem Produktsupport.',
    responseTitle: 'Antwortzeit',
    responseBody:
      'Für aktive Nutzer ist der schnellste Support direkt in der App. E-Mail-Anfragen beantworten wir in der Regel innerhalb von 1–2 Werktagen.',
  },
  fr: {
    badge: 'Support BeFitliner',
    title: 'Contacter le support',
    intro:
      'Vous avez besoin d’aide avec l’application Fitliner, l’accès à la salle, l’abonnement, les paiements ou votre compte ? Contactez notre équipe support via l’une des options ci-dessous.',
    fastestTitle: 'Option la plus rapide : message dans l’application',
    fastestBody:
      'Ouvrez l’application Fitliner, allez dans Messenger, puis envoyez un message au compte de support administrateur. C’est le canal de support recommandé pour les utilisateurs actifs.',
    emailTitle: 'Support par e-mail',
    emailBody:
      'Si vous ne pouvez pas accéder à l’application, envoyez-nous un e-mail directement en ajoutant autant de détails que possible.',
    emailButton: SUPPORT_EMAIL,
    includeTitle: 'Que joindre à votre message',
    includeItems: [
      'votre adresse e-mail utilisée dans l’application',
      'le nom de la salle',
      'le modèle du téléphone et le système d’exploitation',
      'la version de l’application, si disponible',
      'une courte description du problème',
      'une capture d’écran si nécessaire',
    ],
    topicsTitle: 'Sujets de support les plus fréquents',
    topicsBody:
      'Nous pouvons vous aider pour les problèmes de connexion, l’accès à l’application, le statut d’abonnement, les questions de paiement, les problèmes d’entrée à la salle et le support produit général.',
    responseTitle: 'Délai de réponse',
    responseBody:
      'Pour les utilisateurs actifs, le support le plus rapide se trouve directement dans l’application. Les demandes par e-mail reçoivent généralement une réponse sous 1 à 2 jours ouvrés.',
  },
  es: {
    badge: 'Soporte BeFitliner',
    title: 'Contactar con soporte',
    intro:
      '¿Necesitas ayuda con la app Fitliner, el acceso al gimnasio, la membresía, los pagos o tu cuenta? Contacta con nuestro equipo de soporte usando una de las opciones que aparecen abajo.',
    fastestTitle: 'Opción más rápida: mensaje dentro de la app',
    fastestBody:
      'Abre la app Fitliner, entra en Messenger y envía un mensaje a la cuenta de soporte del administrador. Este es el canal de soporte recomendado para usuarios activos.',
    emailTitle: 'Soporte por correo electrónico',
    emailBody:
      'Si no puedes acceder a la app, escríbenos directamente por correo electrónico e incluye todos los detalles posibles.',
    emailButton: SUPPORT_EMAIL,
    includeTitle: 'Qué incluir en tu mensaje',
    includeItems: [
      'el correo que usas en la app',
      'nombre del gimnasio',
      'modelo del teléfono y sistema operativo',
      'versión de la app, si está disponible',
      'breve descripción del problema',
      'captura de pantalla, si corresponde',
    ],
    topicsTitle: 'Temas habituales de soporte',
    topicsBody:
      'Podemos ayudarte con problemas de inicio de sesión, acceso a la app, estado de la membresía, preguntas relacionadas con pagos, problemas de entrada al gimnasio y soporte general del producto.',
    responseTitle: 'Tiempo de respuesta',
    responseBody:
      'Para usuarios activos, el soporte más rápido está dentro de la app. Las solicitudes por correo electrónico suelen responderse en 1–2 días laborables.',
  },
  'zh-hans': {
    badge: 'BeFitliner 支持',
    title: '联系支持团队',
    intro:
      '如果你在 Fitliner 应用、健身房门禁、会员状态、付款或账户方面需要帮助，请通过以下任一方式联系支持团队。',
    fastestTitle: '最快方式：在应用内发送消息',
    fastestBody:
      '打开 Fitliner 应用，进入 Messenger，然后向管理员支持账户发送消息。这是活跃用户推荐使用的支持渠道。',
    emailTitle: '电子邮件支持',
    emailBody:
      '如果你无法进入应用，请直接给我们发送电子邮件，并尽量提供更多细节。',
    emailButton: SUPPORT_EMAIL,
    includeTitle: '消息中请尽量包含以下信息',
    includeItems: [
      '你在应用中使用的邮箱',
      '健身房名称',
      '手机型号和操作系统',
      '应用版本（如果可见）',
      '问题的简短描述',
      '相关截图（如有）',
    ],
    topicsTitle: '常见支持问题',
    topicsBody:
      '我们可以帮助处理登录问题、应用访问问题、会员状态、付款相关问题、健身房入场问题以及一般产品支持。',
    responseTitle: '响应时间',
    responseBody:
      '对于活跃用户，最快的支持方式是在应用内联系。电子邮件通常会在 1–2 个工作日内回复。',
  },
};

function getCopy(locale: string): SupportCopy {
  const normalized = locale.toLowerCase();
  return copyByLocale[(normalized as Locale)] ?? copyByLocale.en;
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = getCopy(locale);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 lg:py-24">
        <div className="mb-10">
          <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
            {copy.badge}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            {copy.intro}
          </p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">{copy.fastestTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.fastestBody}
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">{copy.emailTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.emailBody}
            </p>
            <div className="mt-4">
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=BeFitliner%20Support`}
                className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                {copy.emailButton}
              </a>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">{copy.includeTitle}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.includeItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">{copy.topicsTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.topicsBody}
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">{copy.responseTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.responseBody}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}