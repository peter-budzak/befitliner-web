type CardCopy = {label: string; title: string; description: string; cta: string};
type GatewayCopy = {headline: string; subtitle: string; free: string; cards: [CardCopy, CardCopy, CardCopy]};
export const gatewayCopy: Record<string, GatewayCopy> = {
  "sk": {
    "headline": "Tvoja forma. Tvoji klienti. Tvoj gym.",
    "subtitle": "S Fitlinerom máš tréning aj podnikanie vo fitness jednoduchšie. Vyber si svoju cestu.",
    "free": "Vytvorenie profilu zdarma",
    "cards": [
      {
        "label": "PRE TEBA",
        "title": "Chcem sa dostať do formy",
        "description": "Tréning, strava a tvoj progres. Prehľadne na jednom mieste.",
        "cta": "Nájdi svoju cestu"
      },
      {
        "label": "PRE TRÉNEROV",
        "title": "Chcem rozvíjať svoje trénerstvo",
        "description": "Tvoja vlastná stránka, rezervácie a platby od klientov.",
        "cta": "Vytvor si profil"
      },
      {
        "label": "PRE FITNESS CENTRÁ",
        "title": "Chcem jednoduchšie riadiť gym",
        "description": "Vstupy, členstvá a platby. Menej každodennej administratívy.",
        "cta": "Spoznaj riešenie"
      }
    ]
  },
  "en": {
    "headline": "Your fitness. Your clients. Your gym.",
    "subtitle": "Fitliner makes training and running a fitness business simpler. Choose your path.",
    "free": "Free profile creation",
    "cards": [
      {
        "label": "FOR YOU",
        "title": "I want to get in shape",
        "description": "Training, nutrition and your progress. All clearly organised in one place.",
        "cta": "Find your path"
      },
      {
        "label": "FOR TRAINERS",
        "title": "I want to grow my coaching business",
        "description": "Your own page, bookings and client payments.",
        "cta": "Create your profile"
      },
      {
        "label": "FOR GYMS",
        "title": "I want to manage my gym more easily",
        "description": "Access, memberships and payments. Less day-to-day admin.",
        "cta": "Explore the solution"
      }
    ]
  },
  "de": {
    "headline": "Deine Fitness. Deine Kunden. Dein Studio.",
    "subtitle": "Mit Fitliner werden Training und dein Fitnessbusiness einfacher. Wähle deinen Weg.",
    "free": "Profil kostenlos erstellen",
    "cards": [
      {
        "label": "FÜR DICH",
        "title": "Ich möchte in Form kommen",
        "description": "Training, Ernährung und dein Fortschritt. Alles übersichtlich an einem Ort.",
        "cta": "Finde deinen Weg"
      },
      {
        "label": "FÜR TRAINER",
        "title": "Ich möchte mein Coaching ausbauen",
        "description": "Deine eigene Seite, Terminbuchungen und Kundenzahlungen.",
        "cta": "Erstelle dein Profil"
      },
      {
        "label": "FÜR FITNESSSTUDIOS",
        "title": "Ich möchte mein Studio einfacher verwalten",
        "description": "Zutritt, Mitgliedschaften und Zahlungen. Weniger Verwaltung im Alltag.",
        "cta": "Entdecke die Lösung"
      }
    ]
  },
  "es": {
    "headline": "Tu forma física. Tus clientes. Tu gimnasio.",
    "subtitle": "Fitliner simplifica tus entrenamientos y la gestión de tu negocio de fitness. Elige tu camino.",
    "free": "Crea tu perfil gratis",
    "cards": [
      {
        "label": "PARA TI",
        "title": "Quiero ponerme en forma",
        "description": "Entrenamiento, alimentación y tu progreso. Todo claro y en un solo lugar.",
        "cta": "Encuentra tu camino"
      },
      {
        "label": "PARA ENTRENADORES",
        "title": "Quiero hacer crecer mi negocio de entrenamiento",
        "description": "Tu propia página, reservas y pagos de clientes.",
        "cta": "Crea tu perfil"
      },
      {
        "label": "PARA GIMNASIOS",
        "title": "Quiero gestionar mi gimnasio más fácilmente",
        "description": "Accesos, membresías y pagos. Menos tareas administrativas cada día.",
        "cta": "Descubre la solución"
      }
    ]
  },
  "fr": {
    "headline": "Ta forme. Tes clients. Ta salle.",
    "subtitle": "Fitliner simplifie tes entraînements et la gestion de ton activité fitness. Choisis ta voie.",
    "free": "Création de profil gratuite",
    "cards": [
      {
        "label": "POUR TOI",
        "title": "Je veux me remettre en forme",
        "description": "Entraînement, alimentation et progression. Tout au même endroit, en toute clarté.",
        "cta": "Trouve ta voie"
      },
      {
        "label": "POUR LES COACHS",
        "title": "Je veux développer mon activité de coaching",
        "description": "Ta propre page, les réservations et les paiements de tes clients.",
        "cta": "Crée ton profil"
      },
      {
        "label": "POUR LES SALLES DE SPORT",
        "title": "Je veux gérer ma salle plus simplement",
        "description": "Accès, abonnements et paiements. Moins de tâches administratives au quotidien.",
        "cta": "Découvre la solution"
      }
    ]
  },
  "zh-Hans": {
    "headline": "你的体能。你的客户。你的健身房。",
    "subtitle": "Fitliner 让训练和健身业务管理更简单。选择适合你的方向。",
    "free": "免费创建个人主页",
    "cards": [
      {
        "label": "为你打造",
        "title": "我想练出好状态",
        "description": "训练、饮食和进步记录，清晰整合在一处。",
        "cta": "找到你的方向"
      },
      {
        "label": "面向教练",
        "title": "我想发展私教业务",
        "description": "专属主页、课程预约和客户付款，一站管理。",
        "cta": "创建个人主页"
      },
      {
        "label": "面向健身房",
        "title": "我想更轻松地管理健身房",
        "description": "门禁、会员和收款，减少日常管理事务。",
        "cta": "了解解决方案"
      }
    ]
  }
};
