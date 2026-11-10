import type { Locale } from "./trainer-join-copy";

type Benefit = { title: string; description: string };
type TrainerIntroCopy = {
  audience: string;
  headline: string;
  highlight: string;
  description: string;
  start: string;
  seeHow: string;
  how: string;
  videoPlaceholder: string;
  bookingSteps: [string, string, string];
  benefitsTitle: string;
  benefits: [Benefit, Benefit, Benefit, Benefit];
};

export const trainerIntroCopy: Record<Locale, TrainerIntroCopy> = {
  sk: {
    audience: "Pre trénerov a koučov",
    headline: "Pošli jeden odkaz.",
    highlight: "Klient si vyberie termín a zaplatí online.",
    description:
      "Na vlastnej stránke vo Fitlineri ukážeš služby, ceny aj voľné termíny. V kalendári vidíš, kto má potvrdenú rezerváciu, a Fitliner pošle klientovi faktúru.",
    start: "Vytvoriť trénerský profil zadarmo",
    seeHow: "Pozrieť, ako to funguje",
    how: "Ako to funguje",
    videoPlaceholder: "Video ukážku pripravujeme",
    bookingSteps: ["Tvoj profil", "Výber termínu", "Potvrdená rezervácia"],
    benefitsTitle: "Menej administratívy, viac času na klientov",
    benefits: [
      {
        title: "Jednorazové tréningy",
        description: "Predávaj osobné, skupinové aj online tréningy. Klient zaplatí za konkrétny tréning.",
      },
      {
        title: "Mesačné predplatné",
        description: "Ponúkni dlhodobejší koučing s mesačnou cenou. Po prvom nákupe sa platby vyberajú automaticky.",
      },
      {
        title: "Faktúry po platbe",
        description: "Fitliner pošle klientovi faktúru v tvojom mene. Doklady si stiahneš pre účtovníčku.",
      },
      {
        title: "Zdieľaný tréningový denník",
        description: "Keď ti klient sprístupní denník, vidíš, čo odcvičil. Podľa oprávnení mu môžeš dať spätnú väzbu.",
      },
    ],
  },
  en: {
    audience: "For personal trainers and coaches",
    headline: "Share one link.",
    highlight: "Clients book and pay online.",
    description:
      "Show your services, prices and available times on your own Fitliner page. See confirmed bookings in your calendar while Fitliner sends invoices to clients.",
    start: "Create your free trainer profile",
    seeHow: "See how it works",
    how: "How it works",
    videoPlaceholder: "Video demo coming soon",
    bookingSteps: ["Your profile", "Choose a time", "Booking confirmed"],
    benefitsTitle: "Less admin, more time with clients",
    benefits: [
      {
        title: "One-off training sessions",
        description: "Sell one-to-one, group and online sessions. Clients pay for each session they book.",
      },
      {
        title: "Monthly subscriptions",
        description: "Offer ongoing coaching at a monthly price. Payments are collected automatically after the first purchase.",
      },
      {
        title: "Invoices after payment",
        description: "Fitliner emails clients an invoice on your behalf. Download the documents for your accountant.",
      },
      {
        title: "Shared training log",
        description: "When clients share their training log, you can see what they did and give feedback if they grant you permission.",
      },
    ],
  },
  de: {
    audience: "Für Personal Trainer und Coaches",
    headline: "Teile einen Link.",
    highlight: "Deine Kunden buchen und bezahlen online.",
    description:
      "Zeig deine Angebote, Preise und freien Termine auf deiner eigenen Fitliner-Seite. Im Kalender siehst du bestätigte Buchungen. Fitliner schickt deinen Kunden die Rechnung.",
    start: "Kostenloses Trainerprofil erstellen",
    seeHow: "So funktioniert’s",
    how: "So funktioniert’s",
    videoPlaceholder: "Die Video-Demo ist in Arbeit",
    bookingSteps: ["Dein Profil", "Termin auswählen", "Buchung bestätigt"],
    benefitsTitle: "Weniger Verwaltung, mehr Zeit für deine Kunden",
    benefits: [
      {
        title: "Einmalige Trainingseinheiten",
        description: "Verkaufe Einzel-, Gruppen- und Online-Trainings. Deine Kunden bezahlen pro gebuchter Einheit.",
      },
      {
        title: "Monatliche Abos",
        description: "Biete laufendes Coaching zum Monatspreis an. Nach dem ersten Kauf werden die Zahlungen automatisch eingezogen.",
      },
      {
        title: "Rechnungen nach der Zahlung",
        description: "Fitliner verschickt die Rechnung in deinem Namen. Die Belege für die Buchhaltung kannst du herunterladen.",
      },
      {
        title: "Geteiltes Trainingstagebuch",
        description: "Wenn deine Kunden ihr Tagebuch freigeben, siehst du, was sie trainiert haben. Mit der passenden Berechtigung kannst du Feedback geben.",
      },
    ],
  },
  es: {
    audience: "Para entrenadores personales y coaches",
    headline: "Comparte un solo enlace.",
    highlight: "Tus clientes reservan y pagan en línea.",
    description:
      "Muestra tus servicios, precios y horarios disponibles en tu propia página de Fitliner. Consulta las reservas confirmadas en tu calendario. Fitliner envía la factura a tus clientes.",
    start: "Crear mi perfil de entrenador gratis",
    seeHow: "Ver cómo funciona",
    how: "Cómo funciona",
    videoPlaceholder: "Estamos preparando el vídeo de demostración",
    bookingSteps: ["Tu perfil", "Elegir un horario", "Reserva confirmada"],
    benefitsTitle: "Menos gestión, más tiempo para tus clientes",
    benefits: [
      {
        title: "Sesiones sueltas",
        description: "Vende entrenamientos individuales, en grupo y en línea. Tus clientes pagan por cada sesión que reservan.",
      },
      {
        title: "Suscripciones mensuales",
        description: "Ofrece seguimiento continuo con una cuota mensual. Después de la primera compra, los pagos se cobran automáticamente.",
      },
      {
        title: "Facturas tras el pago",
        description: "Fitliner envía la factura en tu nombre. Puedes descargar los documentos para tu contabilidad.",
      },
      {
        title: "Diario de entrenamiento compartido",
        description: "Cuando un cliente comparte su diario contigo, puedes ver qué ha entrenado y darle feedback si tienes permiso.",
      },
    ],
  },
  fr: {
    audience: "Pour les coachs sportifs",
    headline: "Partage un seul lien.",
    highlight: "Tes clients réservent et paient en ligne.",
    description:
      "Présente tes services, tes tarifs et tes créneaux sur ta page Fitliner. Retrouve les réservations confirmées dans ton calendrier. Fitliner envoie la facture à tes clients.",
    start: "Créer mon profil de coach gratuitement",
    seeHow: "Voir comment ça marche",
    how: "Comment ça marche",
    videoPlaceholder: "La démo vidéo est en préparation",
    bookingSteps: ["Ton profil", "Choix du créneau", "Réservation confirmée"],
    benefitsTitle: "Moins de gestion, plus de temps pour tes clients",
    benefits: [
      {
        title: "Séances à l’unité",
        description: "Vends des séances individuelles, collectives ou en ligne. Tes clients paient pour chaque séance réservée.",
      },
      {
        title: "Abonnements mensuels",
        description: "Propose un suivi régulier à un tarif mensuel. Après le premier achat, les paiements sont prélevés automatiquement.",
      },
      {
        title: "Factures après paiement",
        description: "Fitliner envoie la facture en ton nom. Télécharge les justificatifs pour ta comptabilité.",
      },
      {
        title: "Carnet d’entraînement partagé",
        description: "Quand un client partage son carnet, tu vois les séances qu’il a effectuées. S’il t’en donne l’autorisation, tu peux lui faire des retours.",
      },
    ],
  },
  "zh-Hans": {
    audience: "面向私人教练和健身指导人员",
    headline: "分享一个链接。",
    highlight: "客户就能在线预约并付款。",
    description:
      "在你的 Fitliner 专属页面展示服务、价格和可预约时段。你可以在日历中查看已确认的预约，Fitliner 会向客户发送账单。",
    start: "免费创建教练资料",
    seeHow: "了解使用流程",
    how: "使用流程",
    videoPlaceholder: "演示视频正在制作中",
    bookingSteps: ["你的教练资料", "选择时段", "预约确认"],
    benefitsTitle: "少花时间处理杂务，多花时间指导客户",
    benefits: [
      {
        title: "按次训练",
        description: "提供一对一、团体或线上训练。客户按预约的课次付费。",
      },
      {
        title: "按月订阅",
        description: "以月费提供持续指导。首次购买后，系统会按订阅周期自动收款。",
      },
      {
        title: "付款后发送账单",
        description: "Fitliner 以你的名义向客户发送账单。你可以下载相关凭证，用于记账。",
      },
      {
        title: "共享训练日志",
        description: "客户分享训练日志后，你就能查看其训练记录，并在获得相应权限后提供反馈。",
      },
    ],
  },
};
