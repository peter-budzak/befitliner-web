export type Answers = Record<string, string>;
export type Question = {
  id: string;
  section: string;
  title: string;
  note: string;
  options: { value: string; title: string; detail: string; icon: string }[];
};
export const questions: Question[] = [
  {
    id: "goal",
    section: "Tvoj cieľ",
    title: "Čo chceš zmeniť?",
    note: "Začnime tým, na čom záleží tebe.",
    options: [
      {
        value: "fat",
        title: "Schudnúť a cítiť sa lepšie",
        detail: "Viac pohybu a prehľad o jedle",
        icon: "◎",
      },
      {
        value: "muscle",
        title: "Budovať svaly a silu",
        detail: "Tréning s jasným smerom",
        icon: "↗",
      },
      {
        value: "fitness",
        title: "Zlepšiť kondíciu",
        detail: "Viac energie pre každý deň",
        icon: "ϟ",
      },
      {
        value: "return",
        title: "Vrátiť sa do formy",
        detail: "Znova nájsť svoj rytmus",
        icon: "↻",
      },
    ],
  },
  {
    id: "experience",
    section: "Tvoj cieľ",
    title: "Odkiaľ dnes začínaš?",
    note: "Dobrý plán sa prispôsobí tvojej skúsenosti.",
    options: [
      {
        value: "beginner",
        title: "Začínam",
        detail: "Chcem vedieť, ako na to",
        icon: "01",
      },
      {
        value: "returning",
        title: "Cvičil/a som, ale mám pauzu",
        detail: "Chcem znova začať pravidelne",
        icon: "02",
      },
      {
        value: "regular",
        title: "Cvičím pravidelne",
        detail: "Chcem svoj tréning posunúť",
        icon: "03",
      },
    ],
  },
  {
    id: "age",
    section: "Tvoj cieľ",
    title: "Do ktorej vekovej skupiny patríš?",
    note: "Táto ukážka je určená dospelým od 18 rokov.",
    options: [
      {
        value: "18–29",
        title: "18–29 rokov",
        detail: "Tvoj čas začať",
        icon: "↗",
      },
      {
        value: "30–39",
        title: "30–39 rokov",
        detail: "Priestor pre seba",
        icon: "↗",
      },
      {
        value: "40–49",
        title: "40–49 rokov",
        detail: "Sila pre každý deň",
        icon: "↗",
      },
      {
        value: "50+",
        title: "50 a viac rokov",
        detail: "Pohyb vlastným tempom",
        icon: "↗",
      },
    ],
  },
  {
    id: "location",
    section: "Tvoj tréning",
    title: "Kde chceš cvičiť?",
    note: "Tvoj plán má zapadnúť do tvojho života.",
    options: [
      {
        value: "gym",
        title: "Vo fitku",
        detail: "Stroje, činky a priestor na tréning",
        icon: "▥",
      },
      {
        value: "home",
        title: "Doma",
        detail: "Pohodlne, bez dochádzania",
        icon: "⌂",
      },
      {
        value: "mixed",
        title: "Doma aj vo fitku",
        detail: "Podľa toho, ako mi to vyjde",
        icon: "⇄",
      },
    ],
  },
  {
    id: "equipment",
    section: "Tvoj tréning",
    title: "Čo máš k dispozícii?",
    note: "Vyber možnosť, ktorá najlepšie vystihuje tvoje vybavenie.",
    options: [
      {
        value: "bodyweight",
        title: "Vlastnú váhu",
        detail: "Bez tréningového vybavenia",
        icon: "◯",
      },
      {
        value: "basic",
        title: "Činky alebo odporové gumy",
        detail: "Základné vybavenie",
        icon: "↔",
      },
      {
        value: "full",
        title: "Vybavené fitnesscentrum",
        detail: "Stroje aj voľné váhy",
        icon: "▥",
      },
    ],
  },
  {
    id: "days",
    section: "Tvoj tréning",
    title: "Koľko dní si vieš vyhradiť?",
    note: "Vyber zvládnuteľný rytmus. Pravidelnosť má hodnotu.",
    options: [
      {
        value: "2",
        title: "2 dni týždenne",
        detail: "Pokojný začiatok",
        icon: "02",
      },
      {
        value: "3",
        title: "3 dni týždenne",
        detail: "Priestor aj na regeneráciu",
        icon: "03",
      },
      {
        value: "4",
        title: "4 dni týždenne",
        detail: "Tréning je moja priorita",
        icon: "04",
      },
    ],
  },
  {
    id: "minutes",
    section: "Tvoj tréning",
    title: "Koľko času máš na jeden tréning?",
    note: "Aj kratší tréning môže mať svoje pevné miesto.",
    options: [
      {
        value: "20",
        title: "Približne 20 minút",
        detail: "Krátko a sústredene",
        icon: "◷",
      },
      {
        value: "35",
        title: "Približne 35 minút",
        detail: "Môj čas na pohyb",
        icon: "◷",
      },
      {
        value: "50",
        title: "Približne 50 minút",
        detail: "Chcem si dať záležať",
        icon: "◷",
      },
    ],
  },
  {
    id: "obstacle",
    section: "Tvoj tréning",
    title: "Čo ti najčastejšie stojí v ceste?",
    note: "Práve tu ti má Fitliner pomôcť.",
    options: [
      {
        value: "plan",
        title: "Neviem, čo presne cvičiť",
        detail: "Chýba mi jasný plán",
        icon: "≡",
      },
      {
        value: "time",
        title: "Mám málo času",
        detail: "Potrebujem jednoduchý režim",
        icon: "◷",
      },
      {
        value: "consistency",
        title: "Ťažko si udržím pravidelnosť",
        detail: "Začnem, ale prestanem",
        icon: "↻",
      },
      {
        value: "progress",
        title: "Nevidím svoj progres",
        detail: "Chcem vedieť, či sa posúvam",
        icon: "↗",
      },
    ],
  },
  {
    id: "food",
    section: "Tvoje návyky",
    title: "Ako to máš dnes s jedlom?",
    note: "Prehľad je prvý krok. Bez hodnotenia a výčitiek.",
    options: [
      {
        value: "overview",
        title: "Chcem získať prehľad",
        detail: "Neviem, koľko toho prijmem",
        icon: "◎",
      },
      {
        value: "simple",
        title: "Chcem jednoduchšie zapisovanie",
        detail: "Ručné počítanie ma nebaví",
        icon: "≡",
      },
      {
        value: "balanced",
        title: "Mám režim, chcem ho doladiť",
        detail: "Viac súvislostí s tréningom",
        icon: "✓",
      },
    ],
  },
  {
    id: "focus",
    section: "Tvoje návyky",
    title: "Na čo sa chceš sústrediť najviac?",
    note: "Tvoj dôvod je dôležitejší ako dokonalý začiatok.",
    options: [
      {
        value: "energy",
        title: "Mať viac energie",
        detail: "Cítiť sa lepšie počas dňa",
        icon: "ϟ",
      },
      {
        value: "confidence",
        title: "Cítiť sa dobre vo svojom tele",
        detail: "Budovať si dôveru v seba",
        icon: "♡",
      },
      {
        value: "strength",
        title: "Byť silnejší/ia",
        detail: "Vidieť výsledky svojej práce",
        icon: "↗",
      },
    ],
  },
];
export const steps = [
  "intro",
  "goal",
  "obstacle",
  "experience",
  "location",
  "equipment",
  "days",
  "minutes",
  "food",
  "coach-proof",
  "training-proof",
  "habits-proof",
  "email",
  "verification",
  "result",
  "offer",
  "checkout",
  "done",
] as const;
export type Step = (typeof steps)[number];
export const goalLabels: Record<string, string> = {
  fat: "Schudnúť a cítiť sa lepšie",
  muscle: "Budovať svaly a silu",
  fitness: "Zlepšiť kondíciu",
  return: "Vrátiť sa do formy",
};
export const packages = [
  {
    id: "week",
    name: "1-týždňový štart",
    duration: "7 dní",
    price: 4.99,
    regular: 6.99,
    tag: "VYSKÚŠAJ SVOJ RYTMUS",
  },
  {
    id: "month",
    name: "4-týždňový program",
    duration: "28 dní",
    price: 14.99,
    regular: 19.99,
    tag: "ODPORÚČANÝ ŠTART",
  },
  {
    id: "quarter",
    name: "12-týždňový program",
    duration: "84 dní",
    price: 29.99,
    regular: 39.99,
    tag: "VIAC ČASU NA NÁVYK",
  },
];
export function euro(value: number) {
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
export function recommendation(a: Answers) {
  const days = ["2", "3", "4"].includes(a.days) ? Number(a.days) : 3;
  const minutes = ["20", "35", "50"].includes(a.minutes)
    ? Number(a.minutes)
    : 35;
  const location =
    a.location === "home"
      ? "doma"
      : a.location === "mixed"
        ? "doma aj vo fitku"
        : "vo fitku";
  const style =
    a.experience === "beginner" || a.experience === "returning"
      ? "Postupný začiatok"
      : "Pravidelný progres";
  return {
    days,
    minutes,
    location,
    style,
    goal: goalLabels[a.goal] ?? goalLabels.fitness,
    week: days === 2 ? [0, 3] : days === 4 ? [0, 1, 3, 5] : [0, 2, 4],
  };
}

export function trainingBenefit(a: Answers) {
  const copy: Record<string, { title: string; description: string }> = {
    plan: {
      title: "Prídeš cvičiť. Vieš, kde začať.",
      description:
        "Namiesto hľadania náhodného tréningu otvoríš vlastný plán. AI ti ho pomôže pripraviť podľa cieľa, času a vybavenia.",
    },
    time: {
      title: "Tréning má zapadnúť do tvojho dňa.",
      description:
        "Plán si pripravíš podľa času, ktorý reálne máš. Pri tréningu už máš cviky a predchádzajúce záznamy na jednom mieste.",
    },
    consistency: {
      title: "Ďalší tréning nemusíš vymýšľať znova.",
      description:
        "S vlastným plánom máš východisko pre ďalší deň. Záznamy ti pomôžu nadviazať aj po prestávke.",
    },
    progress: {
      title: "Minulý výkon nemusíš držať v hlave.",
      description:
        "Pri cviku vidíš predchádzajúce hodnoty. Dnešné série si zapíšeš a neskôr porovnáš v histórii.",
    },
  };
  return copy[a.obstacle] ?? copy.plan;
}

export const offerStorageKey = "fitliner-member-offer-v2";
export function offerSeconds(deadline: number, now: number) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
export function programPrice(plan: (typeof packages)[number], seconds: number) {
  return seconds > 0 ? plan.price : plan.regular;
}
