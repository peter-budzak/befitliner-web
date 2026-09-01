'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';

type AnswerValue = string | string[];
type Answers = Record<string, AnswerValue>;
type Attribution = Record<string, string>;
type DiscountOffer = {
  token: string;
  requestId: string;
  expiresAt: string;
};
type Question = {
  id: string;
  title: string;
  hint?: string;
  multiple?: boolean;
  options: Array<{value: string; label: string; icon: string}>;
};

const ANALYSIS_SCREEN_DURATION_MS = 5200;
const DISCOUNT_OFFER_STORAGE_KEY = 'fitliner_health_funnel_discount_offer_v2';
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '475851925437843';
const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function trackingCopy(locale: string) {
  if (locale === 'en') return {body: 'Optional marketing measurement helps us understand which ads work. We never send health answers or results to Meta.', reject: 'Reject', accept: 'Allow measurement'};
  if (locale === 'de') return {body: 'Optionale Marketingmessung hilft uns zu erkennen, welche Anzeigen funktionieren. Gesundheitsantworten oder Ergebnisse senden wir niemals an Meta.', reject: 'Ablehnen', accept: 'Messung erlauben'};
  if (locale === 'es') return {body: 'La medición de marketing opcional nos ayuda a saber qué anuncios funcionan. Nunca enviamos respuestas ni resultados de salud a Meta.', reject: 'Rechazar', accept: 'Permitir medición'};
  if (locale === 'fr') return {body: 'La mesure marketing facultative nous aide à savoir quelles publicités fonctionnent. Nous n’envoyons jamais vos réponses ou résultats de santé à Meta.', reject: 'Refuser', accept: 'Autoriser la mesure'};
  if (locale === 'zh-Hans') return {body: '可选的营销衡量可帮助我们了解哪些广告有效。我们绝不会向 Meta 发送健康问卷答案或健康结果。', reject: '拒绝', accept: '允许衡量'};
  return {body: 'Voliteľné marketingové meranie nám pomáha zistiť, ktoré reklamy fungujú. Zdravotné odpovede ani výsledky do Meta neposielame.', reject: 'Odmietnuť', accept: 'Povoliť meranie'};
}

function readAttribution(allowMarketingIdentifiers: boolean): Attribution {
  const params = new URLSearchParams(window.location.search);
  const next: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key)?.trim();
    if (value) next[key] = value.slice(0, 200);
  }
  const fbclid = params.get('fbclid')?.trim();
  if (allowMarketingIdentifiers && fbclid) next.fbclid = fbclid.slice(0, 250);
  return next;
}

function sourceUrl(allowMarketingIdentifiers: boolean) {
  const url = new URL(window.location.href);
  if (!allowMarketingIdentifiers) url.searchParams.delete('fbclid');
  return url.toString();
}

function validUuid(value: string | null): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function saveDiscountOffer(offer: DiscountOffer) {
  window.localStorage.setItem(DISCOUNT_OFFER_STORAGE_KEY, JSON.stringify(offer));
  window.localStorage.removeItem('fitliner_health_funnel_offer_token');
  window.localStorage.removeItem('fitliner_health_funnel_offer_expires_at');
}

function readDiscountOffer(requestId: string): DiscountOffer | null {
  const raw = window.localStorage.getItem(DISCOUNT_OFFER_STORAGE_KEY);
  if (!raw) return null;
  try {
    const offer = JSON.parse(raw) as Partial<DiscountOffer>;
    if (
      validUuid(offer.token ?? null) &&
      offer.requestId === requestId &&
      typeof offer.expiresAt === 'string' &&
      new Date(offer.expiresAt).getTime() > Date.now()
    ) {
      return offer as DiscountOffer;
    }
  } catch {
    // Invalid or legacy offers are cleared below.
  }
  window.localStorage.removeItem(DISCOUNT_OFFER_STORAGE_KEY);
  return null;
}

function ensureMetaPixel() {
  if (!PIXEL_ID || window.fbq) return;
  const fbq = (...args: unknown[]) => {
    (fbq as unknown as {queue: unknown[][]}).queue.push(args);
  };
  (fbq as unknown as {queue: unknown[][]}).queue = [];
  (fbq as unknown as {loaded: boolean}).loaded = true;
  (fbq as unknown as {version: string}).version = '2.0';
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
  window.fbq('trackCustom', 'HealthLandingView');
}

function trackMetaCustom(event: string) {
  window.fbq?.('trackCustom', event);
}

function trackMetaStandard(event: string, parameters: Record<string, string | number>, eventId?: string) {
  window.fbq?.('track', event, parameters, eventId ? {eventID: eventId} : undefined);
}

function cookieValue(name: string) {
  const prefix = `${name}=`;
  const entry = document.cookie.split(';').map((value) => value.trim()).find((value) => value.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : '';
}

async function sendServerRegistrationEvent(eventId: string, requestId: string, email: string) {
  const response = await fetch('/api/meta/conversions', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      event_name: 'CompleteRegistration',
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: sourceUrl(true),
      email,
      external_id: requestId,
      fbp: cookieValue('_fbp'),
      fbc: cookieValue('_fbc'),
    }),
  });
  if (!response.ok) throw new Error('Server conversion event failed.');
}

type FunnelCopy = {
  language: string;
  introEyebrow: string;
  introTitle: string;
  introBody: string;
  introCta: string;
  introTrust: string[];
  stepLabel: string;
  continue: string;
  back: string;
  questions: Question[];
  educationEyebrow: string;
  educationTitle: string;
  educationBody: string;
  educationItems: Array<{title: string; body: string; icon: string}>;
  educationCta: string;
  analysisTitle: string;
  analysisSteps: string[];
  resultEyebrow: string;
  resultTitle: string;
  resultBody: string;
  resultCards: Array<{title: string; body: string; icon: string}>;
  resultCta: string;
  emailTitle: string;
  emailBody: string;
  emailPlaceholder: string;
  healthConsent: string;
  marketingConsent: string;
  emailCta: string;
  offerEyebrow: string;
  offerBadge: string;
  offerTitle: string;
  offerBody: string;
  perMonth: string;
  dailyPrice: string;
  billedYearly: string;
  renewalNote: string;
  priceGuarantee: string;
  merchantDisclosure: string;
  accessLabel: string;
  included: string[];
  termsConsent: string;
  subscribe: string;
  alreadyMember: string;
  alreadyMemberCta: string;
  medicalNote: string;
  checkoutError: string;
  submitting: string;
};

type BloodHistoryUiCopy = {
  privacyPrefix: string;
  privacyLink: string;
  educationBadge: string;
  marketingBonus: string;
  discountedBadge: string;
  discountedTitle: string;
  standardReasonEyebrow: string;
  standardReasonBody: string;
  discountedReasonEyebrow: string;
  discountedReasonBody: string;
  discountedMonthly: string;
  discountedDaily: string;
  valueSummary: (dailyPrice: string) => string;
  discountedBilling: string;
  discountedGuarantee: string;
  discountedTerms: string;
  termsLink: string;
  discountedCta: string;
  accessNote: string;
  exitBadge: string;
  exitTitle: string;
  exitBody: string;
  exitAccept: string;
  exitClaiming: string;
  exitDecline: string;
  offerActivationError: string;
  discountCheckoutError: string;
  previewLabResult: string;
  previewPdf: string;
  previewTotalCholesterol: string;
  previewGlucose: string;
  previewHistory: string;
  previewConfirmed: string;
  previewChartAria: string;
  previewDisclaimer: string;
  phoneAria: string;
  phoneSteps: string;
  phoneCaption: string;
};

const commonQuestions = {
  sk: [
    {id: 'goal', title: 'Čo chceš urobiť so svojimi krvnými výsledkami?', options: [
      {value: 'archive', label: 'Uchovať ich na jednom mieste', icon: '▣'},
      {value: 'trends', label: 'Vidieť ich vývoj v čase', icon: '↗'},
      {value: 'understand', label: 'Lepšie rozumieť jednotlivým hodnotám', icon: '?'},
      {value: 'doctor', label: 'Mať prehľad pri návšteve lekára', icon: '◒'},
    ]},
    {id: 'sources', title: 'Kde máš dnes uložené staršie krvné výsledky?', hint: 'Vyber všetko, čo platí.', multiple: true, options: [
      {value: 'paper', label: 'V papierovej zdravotnej karte', icon: '▤'},
      {value: 'pdf', label: 'V PDF alebo fotografiách', icon: '▱'},
      {value: 'email', label: 'V e-mailoch alebo pacientskej zóne', icon: '@'},
      {value: 'none', label: 'Neviem ich nájsť alebo ich nemám', icon: '○'},
    ]},
    {id: 'history_length', title: 'Za aké obdobie môžeš mať krvné výsledky?', options: [
      {value: 'two_years', label: 'Posledné 1–2 roky', icon: '◷'},
      {value: 'five_years', label: 'Približne 3–5 rokov', icon: '◴'},
      {value: 'ten_years', label: 'Viac ako 5 rokov', icon: '↗'},
      {value: 'unknown', label: 'Neviem, chcem ich začať zbierať', icon: '＋'},
    ]},
    {id: 'lab_recency', title: 'Kedy si absolvoval posledné krvné testy?', options: [
      {value: 'six_months', label: 'Počas posledných 6 mesiacov', icon: '✓'},
      {value: 'year', label: 'Pred 6–12 mesiacmi', icon: '◷'},
      {value: 'older', label: 'Pred viac ako rokom', icon: '◴'},
      {value: 'never', label: 'Nepamätám si / nikdy', icon: '＋'},
    ]},
    {id: 'barrier', title: 'Čo ti dnes najviac bráni sledovať vývoj krvných výsledkov?', options: [
      {value: 'scattered', label: 'Výsledky mám rozhádzané v papieroch a e-mailoch', icon: '▱'},
      {value: 'understanding', label: 'Neviem, čo hodnoty znamenajú', icon: '?'},
      {value: 'trends', label: 'Nevidím vývoj a súvislosti v čase', icon: '⌁'},
      {value: 'routine', label: 'Zabúdam na pravidelné krvné testy', icon: '◷'},
    ]},
    {id: 'priority', title: 'Čo má pre teba história krvných testov robiť?', hint: 'Vyber všetko, čo je pre teba dôležité.', multiple: true, options: [
      {value: 'archive', label: 'Bezpečne uchovať všetky krvné výsledky', icon: '▣'},
      {value: 'charts', label: 'Ukázať prehľadné grafy a trendy', icon: '↗'},
      {value: 'reminders', label: 'Pripomenúť ďalší krvný test', icon: '◷'},
      {value: 'doctor', label: 'Ukázať vývoj pri návšteve lekára', icon: '◒'},
    ]},
  ] as Question[],
  en: [
    {id: 'goal', title: 'What would you like to do with your blood test results?', options: [
      {value: 'archive', label: 'Keep them together in one place', icon: '▣'},
      {value: 'trends', label: 'See how they change over time', icon: '↗'},
      {value: 'understand', label: 'Better understand each value', icon: '?'},
      {value: 'doctor', label: 'Have a clear overview for doctor visits', icon: '◒'},
    ]},
    {id: 'sources', title: 'Where are your older blood test results stored today?', hint: 'Select all that apply.', multiple: true, options: [
      {value: 'paper', label: 'In a paper medical file', icon: '▤'},
      {value: 'pdf', label: 'In PDFs or photos', icon: '▱'},
      {value: 'email', label: 'In emails or a patient portal', icon: '@'},
      {value: 'none', label: 'I cannot find them or do not have any', icon: '○'},
    ]},
    {id: 'history_length', title: 'How far back might your blood test history go?', options: [
      {value: 'two_years', label: 'The last 1–2 years', icon: '◷'},
      {value: 'five_years', label: 'About 3–5 years', icon: '◴'},
      {value: 'ten_years', label: 'More than 5 years', icon: '↗'},
      {value: 'unknown', label: 'I am not sure — I want to start collecting it', icon: '＋'},
    ]},
    {id: 'lab_recency', title: 'When did you last have blood tests?', options: [
      {value: 'six_months', label: 'Within the last 6 months', icon: '✓'},
      {value: 'year', label: '6–12 months ago', icon: '◷'},
      {value: 'older', label: 'More than a year ago', icon: '◴'},
      {value: 'never', label: 'I do not remember / never', icon: '＋'},
    ]},
    {id: 'barrier', title: 'What makes it hardest to follow your blood test history today?', options: [
      {value: 'scattered', label: 'Results are scattered across paper and email', icon: '▱'},
      {value: 'understanding', label: 'I do not know what the values mean', icon: '?'},
      {value: 'trends', label: 'I cannot see changes and patterns over time', icon: '⌁'},
      {value: 'routine', label: 'I forget to schedule regular blood tests', icon: '◷'},
    ]},
    {id: 'priority', title: 'What should your blood test history do for you?', hint: 'Select everything that matters to you.', multiple: true, options: [
      {value: 'archive', label: 'Securely keep every blood test result', icon: '▣'},
      {value: 'charts', label: 'Show clear charts and trends', icon: '↗'},
      {value: 'reminders', label: 'Remind me about my next blood test', icon: '◷'},
      {value: 'doctor', label: 'Show the trend during a doctor visit', icon: '◒'},
    ]},
  ] as Question[],
};

const questionTranslations: Record<string, Array<{title: string; hint?: string; labels: string[]}>> = {
  de: [
    {title: 'Was möchtest du mit deinen Blutwerten tun?', labels: ['Alle Ergebnisse an einem Ort aufbewahren', 'Ihre Entwicklung im Zeitverlauf sehen', 'Einzelne Werte besser verstehen', 'Bei Arztterminen einen klaren Überblick haben']},
    {title: 'Wo sind deine älteren Blutwerte heute gespeichert?', hint: 'Wähle alles Zutreffende.', labels: ['In einer medizinischen Papierakte', 'In PDFs oder Fotos', 'In E-Mails oder einem Patientenportal', 'Ich finde sie nicht oder habe keine']},
    {title: 'Über welchen Zeitraum könnten deine Blutwerte vorliegen?', labels: ['Die letzten 1–2 Jahre', 'Etwa 3–5 Jahre', 'Mehr als 5 Jahre', 'Ich weiß es nicht – ich möchte jetzt anfangen']},
    {title: 'Wann hattest du zuletzt eine Blutuntersuchung?', labels: ['In den letzten 6 Monaten', 'Vor 6–12 Monaten', 'Vor mehr als einem Jahr', 'Ich weiß es nicht / noch nie']},
    {title: 'Was erschwert dir heute am meisten, deine Blutwerte zu verfolgen?', labels: ['Ergebnisse liegen verteilt auf Papier und in E-Mails', 'Ich weiß nicht, was die Werte bedeuten', 'Ich sehe Veränderungen und Zusammenhänge nicht', 'Ich vergesse regelmäßige Blutuntersuchungen']},
    {title: 'Was soll deine Blutwert-Historie für dich tun?', hint: 'Wähle alles, was dir wichtig ist.', labels: ['Alle Blutwerte sicher aufbewahren', 'Klare Diagramme und Trends zeigen', 'An die nächste Blutuntersuchung erinnern', 'Den Verlauf beim Arzt zeigen']},
  ],
  es: [
    {title: '¿Qué quieres hacer con tus análisis de sangre?', labels: ['Guardarlos juntos en un solo lugar', 'Ver su evolución a lo largo del tiempo', 'Entender mejor cada valor', 'Tener un resumen claro para las visitas médicas']},
    {title: '¿Dónde guardas hoy tus análisis de sangre antiguos?', hint: 'Selecciona todo lo que corresponda.', labels: ['En una historia clínica en papel', 'En PDF o fotografías', 'En correos o un portal de pacientes', 'No los encuentro o no tengo ninguno']},
    {title: '¿De cuántos años podría ser tu historial?', labels: ['Del último 1–2 años', 'De unos 3–5 años', 'De más de 5 años', 'No lo sé; quiero empezar a recopilarlo']},
    {title: '¿Cuándo te hiciste el último análisis de sangre?', labels: ['Durante los últimos 6 meses', 'Hace 6–12 meses', 'Hace más de un año', 'No lo recuerdo / nunca']},
    {title: '¿Qué te impide hoy seguir la evolución de tus análisis?', labels: ['Mis resultados están dispersos en papeles y correos', 'No sé qué significan los valores', 'No puedo ver cambios y relaciones en el tiempo', 'Olvido hacerme análisis con regularidad']},
    {title: '¿Qué debería hacer por ti tu historial de análisis?', hint: 'Selecciona todo lo importante.', labels: ['Guardar todos mis análisis de forma segura', 'Mostrar gráficos y tendencias claros', 'Recordarme el próximo análisis', 'Mostrar la evolución en una visita médica']},
  ],
  fr: [
    {title: 'Que souhaitez-vous faire de vos bilans sanguins ?', labels: ['Tous les conserver au même endroit', 'Voir leur évolution dans le temps', 'Mieux comprendre chaque valeur', 'Disposer d’un aperçu clair lors d’une consultation']},
    {title: 'Où sont conservés vos anciens bilans sanguins ?', hint: 'Sélectionnez toutes les réponses pertinentes.', labels: ['Dans un dossier médical papier', 'Dans des PDF ou des photos', 'Dans des e-mails ou un portail patient', 'Je ne les retrouve pas ou je n’en ai pas']},
    {title: 'Sur quelle période vos bilans pourraient-ils s’étendre ?', labels: ['Les 1–2 dernières années', 'Environ 3–5 ans', 'Plus de 5 ans', 'Je ne sais pas, je veux commencer maintenant']},
    {title: 'Quand avez-vous fait votre dernier bilan sanguin ?', labels: ['Au cours des 6 derniers mois', 'Il y a 6 à 12 mois', 'Il y a plus d’un an', 'Je ne sais plus / jamais']},
    {title: 'Qu’est-ce qui vous empêche de suivre l’évolution de vos bilans ?', labels: ['Mes résultats sont dispersés entre papier et e-mails', 'Je ne comprends pas la signification des valeurs', 'Je ne vois pas les évolutions et les liens dans le temps', 'J’oublie de faire des bilans réguliers']},
    {title: 'Que doit faire votre historique de bilans pour vous ?', hint: 'Sélectionnez tout ce qui compte.', labels: ['Conserver tous mes bilans en sécurité', 'Afficher des graphiques et tendances clairs', 'Me rappeler le prochain bilan', 'Montrer l’évolution lors d’une consultation']},
  ],
  'zh-Hans': [
    {title: '你希望如何管理自己的血液检查结果？', labels: ['将所有结果集中保存', '查看各项指标随时间的变化', '更好地理解每项数值', '就诊时有清晰的总览']},
    {title: '你目前将过往的血检结果保存在哪里？', hint: '可多选。', labels: ['纸质病历中', 'PDF 或照片中', '邮件或患者门户中', '找不到或还没有']},
    {title: '你的血检历史可能跨越多长时间？', labels: ['最近 1–2 年', '大约 3–5 年', '超过 5 年', '不确定，想从现在开始收集']},
    {title: '你上次做血液检查是什么时候？', labels: ['最近 6 个月内', '6–12 个月前', '超过一年前', '不记得 / 从未检查']},
    {title: '目前是什么让追踪血检变化变得困难？', labels: ['结果散落在纸张和邮件中', '不清楚各项数值的含义', '看不到长期变化和关联', '经常忘记定期血液检查']},
    {title: '你希望血检历史为你做什么？', hint: '可多选。', labels: ['安全保存所有血检结果', '显示清晰的图表与趋势', '提醒我下次血液检查', '就诊时展示变化趋势']},
  ],
};

function translatedQuestions(locale: string): Question[] {
  const translation = questionTranslations[locale];
  if (!translation) return commonQuestions.en;
  return commonQuestions.en.map((question, questionIndex) => ({
    ...question,
    title: translation[questionIndex]?.title ?? question.title,
    hint: translation[questionIndex]?.hint,
    options: question.options.map((option, optionIndex) => ({
      ...option,
      label: translation[questionIndex]?.labels[optionIndex] ?? option.label,
    })),
  }));
}

const copy: Record<string, FunnelCopy> = {
  sk: {
    language: 'sk', introEyebrow: 'Fitliner Health · história krvných testov',
    introTitle: 'Jeden krvný test je číslo. História ukáže vývoj.',
    introBody: 'Nahraj staré aj nové krvné výsledky z PDF alebo fotografie. Fitliner ich usporiada podľa rokov a ukáže vývoj cholesterolu, cukru, pečeňových testov a ďalších potvrdených hodnôt.',
    introCta: 'Vytvoriť históriu',
    introTrust: ['Šifrovaný prenos a chránený prístup', 'Hlavná databáza v EÚ (Írsko)', 'Osobné ani zdravotné údaje nepredávame'],
    stepLabel: 'Krok', continue: 'Pokračovať', back: 'Späť', questions: commonQuestions.sk,
    educationEyebrow: 'Novinka pre prvých používateľov v EÚ', educationTitle: 'Premeň svoje krvné výsledky na nástroj, ktorý rastie s tebou.',
    educationBody: 'Odfotíš alebo nahráš výsledok. Fitliner rozpozná metriky, jednotky, dátum aj referenčné rozpätie a pred uložením ti všetko ukáže na kontrolu. Z jednotlivých papierov tak postupne vznikne tvoja prehľadná zdravotná história.',
    educationItems: [
      {title: 'Ľubovoľný formát', body: 'PDF, fotografia alebo ručné zadanie.', icon: '▤'},
      {title: 'Každá metrika zvlášť', body: 'Cholesterol, glukóza či pečeňové testy majú vlastnú históriu.', icon: '⌁'},
      {title: 'Ty rozhoduješ', body: 'Žiadny údaj sa neuloží bez tvojej kontroly.', icon: '✓'},
    ], educationCta: 'Rozumiem, pokračovať',
    analysisTitle: 'Pripravujeme tvoju históriu krvných výsledkov',
    analysisSteps: ['Vyhodnocujeme tvoje ciele', 'Nastavujeme históriu výsledkov', 'Pripravujeme Zdravotnú kartu'],
    resultEyebrow: 'Tvoj Fitliner Health plán', resultTitle: 'Jasná história, nie ďalšia zložka s papiermi.',
    resultBody: 'Zdravotná karta spojí potvrdené krvné výsledky z rôznych rokov do jedného prehľadu. Uvidíš, ako sa jednotlivé hodnoty menili a kedy si absolvoval posledný test.',
    resultCards: [
      {title: 'Staré aj nové výsledky', body: 'Nahraj PDF alebo fotografiu a potvrď rozpoznané hodnoty.', icon: '▤'},
      {title: 'Vývoj po rokoch', body: 'Každá krvná metrika dostane vlastnú časovú os a graf.', icon: '↗'},
      {title: 'Prehľad pre konzultáciu', body: 'Vývoj môžeš pri ďalšej návšteve ukázať svojmu lekárovi.', icon: '◒'},
    ], resultCta: 'Poslať môj plán na e-mail',
    emailTitle: 'Kam ti môžeme poslať aktiváciu?',
    emailBody: 'Ak už máš registráciu vo Fitliner, použi rovnaký e-mail.',
    emailPlaceholder: 'tvoj@email.sk',
    healthConsent: 'Súhlasím so spracovaním e-mailu na vytvorenie a správu môjho účtu Fitliner Health.',
    marketingConsent: 'Chcem dostať svoj osobný plán, praktické tipy a ak aktiváciu nedokončím, aj časovo obmedzenú VIP ponuku. Kedykoľvek sa môžem odhlásiť. (nepovinné)',
    emailCta: 'Pokračovať a dokončiť',
    offerEyebrow: 'Posledný krok · ročný plán', offerBadge: 'Zakladateľská cena',
    offerTitle: 'Výsledky z minulosti už nezmeníš. Od dneška ich však nemusíš strácať.',
    offerBody: 'Začni budovať svoju digitálnu históriu teraz. Pri každom ďalšom odbere bude hodnotnejšia, pretože nové výsledky konečne uvidíš v súvislostiach s tými predchádzajúcimi.',
    perMonth: '2,90 € / mesiac', dailyPrice: '≈ 0,10 € denne', billedYearly: 'Dnes si aktivuješ 12 mesiacov za 34,80 €',
    renewalNote: 'Potom 34,80 € každých 12 mesiacov. Zrušiť môžeš pred ďalšou platbou.',
    priceGuarantee: 'Aktiváciou dnes si uzamkneš zakladateľskú cenu 34,80 € ročne na celý čas nepretržitého predplatného.',
    merchantDisclosure: 'Predané cez Link. Link je oficiálnym predajcom transakcie a Stripe zabezpečuje platbu aj transakčnú podporu.', accessLabel: '12 mesiacov prístupu',
    included: ['Staré aj nové krvné výsledky na jednom bezpečnom mieste', 'Neobmedzený import PDF a fotografií v rôznych jazykoch', 'Kontrola rozpoznaných hodnôt pred uložením', 'Jasné grafy a referenčné rozpätia pre každú metriku', 'Pripomienky ďalších krvných testov'],
    termsConsent: 'Súhlasím s Podmienkami používania a s opakovanou ročnou platbou 34,80 €, kým predplatné nezruším.',
    subscribe: 'Začať svoju históriu za 34,80 €', alreadyMember: 'Máš aktívne členstvo v partnerskom gyme?',
    alreadyMemberCta: 'Zdravotnú kartu už máš v cene. Otvor Fitliner aplikáciu a nepriplácaj.',
    medicalNote: 'Fitliner neposkytuje diagnózu ani lekársku radu. Výsledky a odporúčania vždy konzultuj s kvalifikovaným zdravotníkom.',
    checkoutError: 'Platbu sa nepodarilo otvoriť. Skontroluj e-mail a skús to znova.', submitting: 'Pripravujem bezpečnú platbu…',
  },
  en: {
    language: 'en', introEyebrow: 'Fitliner Health · blood test history', introTitle: 'One blood test is a number. Your history reveals the trend.',
    introBody: 'Upload old and new blood test results as a PDF or photo. Fitliner organizes them by year and shows how cholesterol, glucose, liver markers and other confirmed values change over time.',
    introCta: 'Build my history', introTrust: ['Encrypted transfer and protected access', 'Primary database in the EU (Ireland)', 'We never sell personal or health data'],
    stepLabel: 'Step', continue: 'Continue', back: 'Back', questions: commonQuestions.en,
    educationEyebrow: 'New for early users in the EU', educationTitle: 'Turn your blood test results into a tool that grows with you.',
    educationBody: 'Take a photo or upload a report. Fitliner identifies metrics, units, the test date and reference ranges, then shows everything for your review before saving. Scattered papers gradually become one clear health history.',
    educationItems: [
      {title: 'Any common format', body: 'PDF, photo or manual entry.', icon: '▤'},
      {title: 'Every metric stays separate', body: 'Cholesterol, glucose and liver markers each get their own history.', icon: '⌁'},
      {title: 'You stay in control', body: 'Nothing is saved without your review.', icon: '✓'},
    ], educationCta: 'I understand, continue', analysisTitle: 'Preparing your blood test history',
    analysisSteps: ['Reviewing your goals', 'Setting up your results history', 'Preparing your Health Card'],
    resultEyebrow: 'Your Fitliner Health plan', resultTitle: 'A clear history, not another folder of papers.',
    resultBody: 'Your Health Card connects confirmed blood test results from different years in one view. See how each value changed and when your most recent test took place.',
    resultCards: [
      {title: 'Old and new results', body: 'Upload a PDF or photo and confirm the recognized values.', icon: '▤'},
      {title: 'Trends across years', body: 'Every blood marker gets its own timeline and chart.', icon: '↗'},
      {title: 'A useful consultation overview', body: 'Show the trend to your doctor at a future visit.', icon: '◒'},
    ], resultCta: 'Send my plan by email', emailTitle: 'Where should we send your activation?',
    emailBody: 'If you already have a Fitliner account, use the same email address.',
    emailPlaceholder: 'you@example.com', healthConsent: 'I agree to the processing of my email address to create and manage my Fitliner Health account.',
    marketingConsent: 'Send me my personal plan, practical tips and, if I do not finish activation, a limited-time VIP offer. I can unsubscribe at any time. (optional)', emailCta: 'Continue and finish',
    offerEyebrow: 'Final step · annual plan', offerBadge: 'Founding price',
    offerTitle: 'You cannot change past results. From today, you do not have to lose them.',
    offerBody: 'Start building your digital history now. It becomes more useful with every future test because new results can finally be seen in context with the previous ones.',
    perMonth: '€2.90 / month', dailyPrice: '≈ €0.10 a day', billedYearly: 'Pay €34.80 today for 12 months',
    renewalNote: 'Then €34.80 every 12 months. Cancel before your next charge.',
    priceGuarantee: 'Keep the €34.80 annual founding price while your subscription remains continuously active.',
    merchantDisclosure: 'Sold through Link. Link is the merchant of record, with payment and transaction support provided by Stripe.', accessLabel: '12 months of access',
    included: ['Old and new blood test results in one secure place', 'Unlimited PDF and photo imports in multiple languages', 'Review recognized values before saving', 'Clear charts and reference ranges for every metric', 'Reminders for future blood tests'],
    termsConsent: 'I accept the Terms of Use and the recurring annual charge of €34.80 until I cancel.',
    subscribe: 'Start my history for €34.80', alreadyMember: 'Do you have an active membership at a partner gym?',
    alreadyMemberCta: 'Your Health Card is already included. Open the Fitliner app and do not pay twice.',
    medicalNote: 'Fitliner does not provide a diagnosis or medical advice. Always discuss results and recommendations with a qualified healthcare professional.',
    checkoutError: 'We could not open checkout. Check your email and try again.', submitting: 'Preparing secure checkout…',
  },
};

function localizedCopy(locale: string): FunnelCopy {
  const base = copy[locale] ?? copy.en;
  if (locale === 'de') return {
    ...base,
    questions: translatedQuestions('de'), language: 'de',
    introEyebrow: 'Fitliner Health · Blutwert-Historie',
    introTitle: 'Ein Bluttest ist eine Zahl. Die Historie zeigt die Entwicklung.',
    introBody: 'Lade alte und neue Blutwerte als PDF oder Foto hoch. Fitliner ordnet sie nach Jahren und zeigt die Entwicklung von Cholesterin, Glukose, Leberwerten und weiteren bestätigten Werten.',
    introCta: 'Meine Historie erstellen',
    introTrust: ['Verschlüsselte Übertragung und geschützter Zugriff', 'Primäre Datenbank in der EU (Irland)', 'Wir verkaufen keine persönlichen oder Gesundheitsdaten'],
    stepLabel: 'Schritt', continue: 'Weiter', back: 'Zurück',
    educationEyebrow: 'Neu für erste Nutzer in der EU',
    educationTitle: 'Mach aus deinen Blutwerten ein Werkzeug, das mit dir wächst.',
    educationBody: 'Fotografiere oder lade einen Befund hoch. Fitliner erkennt Messwerte, Einheiten, Datum und Referenzbereiche und zeigt dir vor dem Speichern alles zur Kontrolle. Aus einzelnen Dokumenten entsteht Schritt für Schritt deine übersichtliche Gesundheitshistorie.',
    educationItems: [
      {title: 'Jedes gängige Format', body: 'PDF, Foto oder manuelle Eingabe.', icon: '▤'},
      {title: 'Jeder Wert bleibt getrennt', body: 'Cholesterin, Glukose und Leberwerte erhalten eine eigene Historie.', icon: '⌁'},
      {title: 'Du entscheidest', body: 'Nichts wird ohne deine Kontrolle gespeichert.', icon: '✓'},
    ],
    educationCta: 'Verstanden, weiter',
    emailTitle: 'Wohin sollen wir deine Aktivierung senden?',
    emailBody: 'Wenn du bereits ein Fitliner-Konto hast, verwende dieselbe E-Mail-Adresse.',
    emailPlaceholder: 'du@beispiel.de',
    healthConsent: 'Ich stimme der Verarbeitung meiner E-Mail-Adresse zur Erstellung und Verwaltung meines Fitliner-Health-Kontos zu.',
    marketingConsent: 'Sende mir meinen persönlichen Plan, praktische Tipps und, falls ich die Aktivierung nicht abschließe, ein zeitlich begrenztes VIP-Angebot. Ich kann mich jederzeit abmelden. (optional)',
    emailCta: 'Weiter und abschließen',
    offerEyebrow: 'Letzter Schritt · Jahresplan', offerBadge: 'Gründerpreis',
    offerTitle: 'Vergangene Ergebnisse kannst du nicht ändern. Ab heute musst du sie aber nicht mehr verlieren.',
    offerBody: 'Beginne jetzt mit deiner digitalen Historie. Mit jedem weiteren Bluttest wird sie wertvoller, weil du neue Ergebnisse endlich im Zusammenhang mit früheren sehen kannst.',
    perMonth: '2,90 € / Monat', dailyPrice: '≈ 0,10 € pro Tag', billedYearly: 'Heute 34,80 € für 12 Monate',
    renewalNote: 'Danach 34,80 € alle 12 Monate. Vor der nächsten Zahlung kündbar.',
    priceGuarantee: 'Der Gründerpreis von 34,80 € pro Jahr bleibt bei ununterbrochenem Abo erhalten.',
    merchantDisclosure: 'Verkauft über Link. Link ist der Vertragshändler; Stripe übernimmt Zahlung und Transaktionssupport.', accessLabel: '12 Monate Zugang',
    included: ['Alte und neue Blutwerte an einem sicheren Ort', 'Unbegrenzter Import von PDFs und Fotos in mehreren Sprachen', 'Erkannte Werte vor dem Speichern prüfen', 'Klare Diagramme und Referenzbereiche für jeden Wert', 'Erinnerungen an künftige Blutuntersuchungen'],
    termsConsent: 'Ich akzeptiere die Nutzungsbedingungen und die wiederkehrende Jahreszahlung von 34,80 €, bis ich kündige.',
    subscribe: 'Meine Historie für 34,80 € starten',
    alreadyMember: 'Hast du eine aktive Mitgliedschaft in einem Partnerstudio?',
    alreadyMemberCta: 'Deine Gesundheitskarte ist bereits enthalten. Öffne die Fitliner App und zahle nicht doppelt.',
    medicalNote: 'Fitliner stellt keine Diagnose und erteilt keinen medizinischen Rat. Besprich Ergebnisse und Empfehlungen immer mit qualifiziertem medizinischem Fachpersonal.',
    submitting: 'Sichere Zahlung wird vorbereitet…', checkoutError: 'Die Zahlung konnte nicht geöffnet werden. Prüfe deine E-Mail und versuche es erneut.',
  };
  if (locale === 'es') return {
    ...base,
    questions: translatedQuestions('es'), language: 'es',
    introEyebrow: 'Fitliner Health · historial de análisis', introTitle: 'Un análisis es una cifra. Tu historial revela la evolución.',
    introBody: 'Sube análisis antiguos y nuevos en PDF o fotografía. Fitliner los ordena por año y muestra la evolución del colesterol, la glucosa, los marcadores hepáticos y otros valores confirmados.',
    introCta: 'Crear mi historial', introTrust: ['Transferencia cifrada y acceso protegido', 'Base de datos principal en la UE (Irlanda)', 'Nunca vendemos datos personales ni de salud'],
    stepLabel: 'Paso', continue: 'Continuar', back: 'Atrás',
    educationEyebrow: 'Nuevo para los primeros usuarios de la UE', educationTitle: 'Convierte tus análisis en una herramienta que crece contigo.',
    educationBody: 'Haz una foto o sube un informe. Fitliner detecta métricas, unidades, fecha e intervalos de referencia y te muestra todo para revisarlo antes de guardar. Los papeles dispersos se convierten poco a poco en un historial de salud claro.',
    educationItems: [{title: 'Cualquier formato habitual', body: 'PDF, foto o entrada manual.', icon: '▤'}, {title: 'Cada métrica por separado', body: 'Colesterol, glucosa y marcadores hepáticos tienen su propio historial.', icon: '⌁'}, {title: 'Tú decides', body: 'Nada se guarda sin tu revisión.', icon: '✓'}],
    educationCta: 'Entendido, continuar', emailTitle: '¿Dónde enviamos tu activación?', emailBody: 'Si ya tienes una cuenta Fitliner, usa la misma dirección de correo.',
    emailPlaceholder: 'tu@correo.es', healthConsent: 'Acepto el tratamiento de mi correo para crear y gestionar mi cuenta Fitliner Health.',
    marketingConsent: 'Quiero recibir mi plan personal, consejos prácticos y, si no termino la activación, una oferta VIP por tiempo limitado. Puedo darme de baja en cualquier momento. (opcional)', emailCta: 'Continuar y terminar',
    offerEyebrow: 'Último paso · plan anual', offerBadge: 'Precio fundador', offerTitle: 'No puedes cambiar los resultados del pasado. Desde hoy, no tienes por qué perderlos.',
    offerBody: 'Empieza ahora tu historial digital. Será más valioso con cada nuevo análisis, porque podrás ver los resultados nuevos junto a los anteriores.',
    perMonth: '2,90 € / mes', dailyPrice: '≈ 0,10 € al día', billedYearly: 'Activa hoy 12 meses por 34,80 €', renewalNote: 'Después, 34,80 € cada 12 meses. Cancela antes del próximo cobro.',
    priceGuarantee: 'Mantén el precio fundador de 34,80 € al año mientras tu suscripción siga activa.', merchantDisclosure: 'Vendido a través de Link. Link es el vendedor oficial y Stripe gestiona el pago y el soporte de la transacción.', accessLabel: '12 meses de acceso',
    included: ['Análisis antiguos y nuevos en un lugar seguro', 'Importaciones ilimitadas de PDF y fotos en varios idiomas', 'Revisión de los valores detectados antes de guardar', 'Gráficos e intervalos de referencia claros para cada métrica', 'Recordatorios para futuros análisis'],
    termsConsent: 'Acepto las Condiciones de uso y el cobro anual recurrente de 34,80 € hasta que cancele.', subscribe: 'Crear mi historial por 34,80 €',
    alreadyMember: '¿Tienes una membresía activa en un gimnasio asociado?', alreadyMemberCta: 'Tu Tarjeta de Salud ya está incluida. Abre la app Fitliner y no pagues dos veces.',
    medicalNote: 'Fitliner no ofrece diagnósticos ni consejo médico. Consulta siempre los resultados y recomendaciones con un profesional sanitario cualificado.', checkoutError: 'No hemos podido abrir el pago. Revisa tu correo e inténtalo de nuevo.', submitting: 'Preparando pago seguro…',
  };
  if (locale === 'fr') return {
    ...base,
    questions: translatedQuestions('fr'), language: 'fr',
    introEyebrow: 'Fitliner Health · historique des bilans sanguins', introTitle: 'Un bilan est une valeur. L’historique révèle l’évolution.',
    introBody: 'Importez vos anciens et nouveaux bilans en PDF ou en photo. Fitliner les classe par année et montre l’évolution du cholestérol, de la glycémie, des marqueurs hépatiques et d’autres valeurs confirmées.',
    introCta: 'Créer mon historique', introTrust: ['Transfert chiffré et accès protégé', 'Base de données principale dans l’UE (Irlande)', 'Nous ne vendons jamais de données personnelles ou de santé'],
    stepLabel: 'Étape', continue: 'Continuer', back: 'Retour',
    educationEyebrow: 'Nouveau pour les premiers utilisateurs dans l’UE', educationTitle: 'Transformez vos bilans en un outil qui grandit avec vous.',
    educationBody: 'Photographiez ou importez un bilan. Fitliner reconnaît les mesures, les unités, la date et les intervalles de référence, puis vous montre tout avant l’enregistrement. Vos documents dispersés deviennent progressivement un historique santé clair.',
    educationItems: [{title: 'Tout format courant', body: 'PDF, photo ou saisie manuelle.', icon: '▤'}, {title: 'Chaque mesure reste distincte', body: 'Cholestérol, glycémie et marqueurs hépatiques ont leur propre historique.', icon: '⌁'}, {title: 'Vous décidez', body: 'Rien n’est enregistré sans votre validation.', icon: '✓'}],
    educationCta: 'J’ai compris, continuer', emailTitle: 'Où envoyer votre activation ?', emailBody: 'Si vous avez déjà un compte Fitliner, utilisez la même adresse e-mail.',
    emailPlaceholder: 'vous@exemple.fr', healthConsent: 'J’accepte le traitement de mon adresse e-mail pour créer et gérer mon compte Fitliner Health.',
    marketingConsent: 'Je souhaite recevoir mon plan personnel, des conseils pratiques et, si je ne termine pas l’activation, une offre VIP limitée dans le temps. Je peux me désinscrire à tout moment. (facultatif)', emailCta: 'Continuer et terminer',
    offerEyebrow: 'Dernière étape · formule annuelle', offerBadge: 'Prix fondateur', offerTitle: 'Vous ne pouvez pas changer les résultats passés. Dès aujourd’hui, vous n’avez plus à les perdre.',
    offerBody: 'Commencez maintenant votre historique numérique. Il gagnera en valeur à chaque nouveau bilan, car vous pourrez enfin comparer les nouveaux résultats aux précédents.',
    perMonth: '2,90 € / mois', dailyPrice: '≈ 0,10 € par jour', billedYearly: 'Activez 12 mois aujourd’hui pour 34,80 €', renewalNote: 'Puis 34,80 € tous les 12 mois. Résiliable avant le prochain paiement.',
    priceGuarantee: 'Conservez le prix fondateur de 34,80 € par an tant que votre abonnement reste actif.', merchantDisclosure: 'Vendu via Link. Link est le vendeur officiel et Stripe gère le paiement et l’assistance transactionnelle.', accessLabel: '12 mois d’accès',
    included: ['Anciens et nouveaux bilans au même endroit sécurisé', 'Imports illimités de PDF et photos en plusieurs langues', 'Validation des valeurs reconnues avant enregistrement', 'Graphiques et intervalles de référence clairs pour chaque mesure', 'Rappels pour vos prochains bilans'],
    termsConsent: 'J’accepte les Conditions d’utilisation et le paiement annuel récurrent de 34,80 € jusqu’à résiliation.', subscribe: 'Créer mon historique pour 34,80 €',
    alreadyMember: 'Avez-vous un abonnement actif dans une salle partenaire ?', alreadyMemberCta: 'Votre Carte Santé est déjà incluse. Ouvrez l’app Fitliner et ne payez pas deux fois.',
    medicalNote: 'Fitliner ne fournit ni diagnostic ni conseil médical. Discutez toujours des résultats et recommandations avec un professionnel de santé qualifié.', checkoutError: 'Impossible d’ouvrir le paiement. Vérifiez votre e-mail et réessayez.', submitting: 'Préparation du paiement sécurisé…',
  };
  if (locale === 'zh-Hans') return {
    ...base,
    questions: translatedQuestions('zh-Hans'), language: 'zh-Hans',
    introEyebrow: 'Fitliner Health · 血检历史', introTitle: '一次血检只是一个数字。历史才能展现趋势。',
    introBody: '上传旧的和新的血检 PDF 或照片。Fitliner 会按年份整理，并展示胆固醇、血糖、肝功能指标及其他已确认数值的变化。',
    introCta: '创建我的血检历史', introTrust: ['加密传输和受保护的访问', '主数据库位于欧盟（爱尔兰）', '我们绝不出售个人或健康数据'],
    stepLabel: '步骤', continue: '继续', back: '返回',
    educationEyebrow: '面向欧盟早期用户的新功能', educationTitle: '让血检结果变成一项会随你不断积累价值的工具。',
    educationBody: '拍照或上传报告。Fitliner 会识别指标、单位、日期和参考范围，并在保存前让你确认每项内容。分散的纸质报告会逐渐变成清晰的健康历史。',
    educationItems: [{title: '常见格式都支持', body: 'PDF、照片或手动输入。', icon: '▤'}, {title: '每项指标独立记录', body: '胆固醇、血糖和肝功能指标都有自己的历史。', icon: '⌁'}, {title: '由你决定', body: '未经你确认，任何数据都不会保存。', icon: '✓'}],
    educationCta: '我了解了，继续', emailTitle: '将激活信息发送到哪里？', emailBody: '如果你已有 Fitliner 账号，请使用同一个邮箱。',
    emailPlaceholder: 'you@example.com', healthConsent: '我同意处理我的邮箱，以创建和管理 Fitliner Health 账号。',
    marketingConsent: '我希望收到个人方案、实用建议，以及在未完成激活时收到限时 VIP 优惠。我可以随时退订。（可选）', emailCta: '继续并完成',
    offerEyebrow: '最后一步 · 年度方案', offerBadge: '创始会员价', offerTitle: '过去的结果无法改变。但从今天起，你不必再丢失它们。',
    offerBody: '现在开始建立数字血检历史。每次新检查都会让它更有价值，因为新结果终于可以和过往数据一起查看。',
    perMonth: '每月 €2.90', dailyPrice: '每天约 €0.10', billedYearly: '今天以 €34.80 开通 12 个月', renewalNote: '之后每 12 个月支付 €34.80，可在下次扣款前取消。',
    priceGuarantee: '订阅持续有效期间，保留每年 €34.80 的创始会员价。', merchantDisclosure: '通过 Link 销售。Link 是本次交易的法定销售方，Stripe 负责付款及交易支持。', accessLabel: '12 个月访问权限',
    included: ['将旧的和新的血检结果安全保存在一处', '支持多种语言的 PDF 和照片无限导入', '保存前确认识别出的数值', '为每项指标显示清晰图表和参考范围', '提醒你今后的血液检查'],
    termsConsent: '我接受使用条款，并同意每年自动支付 €34.80，直到取消订阅。', subscribe: '以 €34.80 开始建立历史',
    alreadyMember: '你是合作健身房的有效会员吗？', alreadyMemberCta: '你的健康档案已经包含在会员权益中。打开 Fitliner 应用，请勿重复付款。',
    medicalNote: 'Fitliner 不提供诊断或医疗建议。请始终与合格医疗专业人员讨论检查结果和建议。', checkoutError: '无法打开付款页面。请检查邮箱并重试。', submitting: '正在准备安全支付…',
  };
  return base;
}

function localizedBloodHistoryUi(locale: string): BloodHistoryUiCopy {
  const sk: BloodHistoryUiCopy = {
    privacyPrefix: 'Ochranu údajov a tvoje práva nastavujeme podľa pravidiel GDPR.',
    privacyLink: 'Ako chránime údaje',
    educationBadge: 'Včasný prístup k Fitliner Health',
    marketingBonus: 'Bonus zdarma',
    discountedBadge: 'VIP · −50 % na prvý rok',
    discountedTitle: 'Prvý rok Fitliner Health za polovicu.',
    standardReasonEyebrow: 'Prečo začať dnes',
    standardReasonBody: 'Každý ďalší krvný výsledok má väčšiu hodnotu, keď ho máš s čím porovnať. Tvoj prvý graf môže vzniknúť ešte dnes.',
    discountedReasonEyebrow: 'VIP ponuka je aktívna',
    discountedReasonBody: 'Prvý rok máš za 17,40 €. Ponuka platí 48 hodín. Po prvom roku sa predplatné obnoví za štandardnú zakladateľskú cenu.',
    discountedMonthly: '1,45 € / mesiac prvý rok',
    discountedDaily: '≈ 0,05 € denne',
    valueSummary: (dailyPrice) => `Za symbolických ${dailyPrice} denne si buduješ prehľad, ktorého hodnota rastie s každým výsledkom.`,
    discountedBilling: 'Dnes zaplatíš 17,40 € za prvých 12 mesiacov',
    discountedGuarantee: 'VIP zľava platí 48 hodín a uplatní sa iba na prvú ročnú platbu.',
    discountedTerms: 'Súhlasím s Podmienkami používania, dnešnou platbou 17,40 € za prvý rok a následnou opakovanou ročnou platbou 34,80 €, kým predplatné nezruším.',
    termsLink: 'Podmienky',
    discountedCta: 'Aktivovať prvý rok za 17,40 €',
    accessNote: '12 mesiacov prístupu · bezpečná platba · zrušenie pred obnovením',
    exitBadge: 'VIP ponuka · 48 hodín',
    exitTitle: 'Počkaj — ak ťa zastavila cena, prvý rok máš za polovicu.',
    exitBody: 'Aktivuj Fitliner Health za 17,40 € na prvých 12 mesiacov, teda približne 0,05 € denne. Potom 34,80 € ročne; zrušiť môžeš pred obnovením.',
    exitAccept: 'Áno, chcem prvý rok za 17,40 €',
    exitClaiming: 'Aktivujem VIP ponuku…',
    exitDecline: 'Nie, ďakujem',
    offerActivationError: 'VIP ponuku sa nepodarilo aktivovať. Skús to, prosím, znova.',
    discountCheckoutError: 'VIP zľavu sa nepodarilo potvrdiť, preto sme platbu neotvorili. Obnov stránku a skús ponuku aktivovať znova.',
    previewLabResult: 'Laboratórny výsledok', previewPdf: 'PDF', previewTotalCholesterol: 'Celkový cholesterol', previewGlucose: 'Glukóza',
    previewHistory: 'História hodnoty', previewConfirmed: '3 potvrdené výsledky',
    previewChartAria: 'Ilustračný graf troch výsledkov v rokoch 2016, 2021 a 2026',
    previewDisclaimer: 'Ilustračný príklad zobrazenia. Fitliner neposkytuje diagnózu ani nenahrádza lekára.',
    phoneAria: 'Ukážka premeny papierového krvného výsledku na prehľadný graf vo Fitliner Health',
    phoneSteps: 'Papier → potvrdené hodnoty → graf', phoneCaption: 'Ukážka spracovania výsledku v aplikácii',
  };
  if (locale === 'en') return {
    ...sk,
    privacyPrefix: 'We protect your data and rights in accordance with GDPR.', privacyLink: 'How we protect your data',
    educationBadge: 'Early access to Fitliner Health', marketingBonus: 'Free bonus',
    discountedBadge: 'VIP · 50% off the first year', discountedTitle: 'Your first year of Fitliner Health for half price.',
    standardReasonEyebrow: 'Why start today', standardReasonBody: 'Every future blood result is more valuable when you have something to compare it with. Your first chart can start today.',
    discountedReasonEyebrow: 'Your VIP offer is active', discountedReasonBody: 'Your first year is €17.40. The offer is valid for 48 hours. After the first year, your subscription renews at the standard founding price.',
    discountedMonthly: '€1.45 / month for the first year', discountedDaily: '≈ €0.05 a day',
    valueSummary: (dailyPrice) => `For just ${dailyPrice} a day, you build a health history that becomes more valuable with every result.`,
    discountedBilling: 'Pay €17.40 today for the first 12 months', discountedGuarantee: 'The VIP discount is valid for 48 hours and applies only to your first annual payment.',
    discountedTerms: 'I accept the Terms of Use, today’s €17.40 payment for the first year and the recurring annual payment of €34.80 until I cancel.', termsLink: 'Terms',
    discountedCta: 'Activate my first year for €17.40', accessNote: '12 months of access · secure payment · cancel before renewal',
    exitBadge: 'VIP offer · 48 hours', exitTitle: 'Wait — if price stopped you, get your first year for half price.',
    exitBody: 'Activate Fitliner Health for €17.40 for the first 12 months — about €0.05 a day. Then €34.80 a year; cancel before renewal.',
    exitAccept: 'Yes, I want my first year for €17.40', exitClaiming: 'Activating your VIP offer…', exitDecline: 'No, thank you',
    offerActivationError: 'We could not activate the VIP offer. Please try again.', discountCheckoutError: 'We could not confirm the VIP discount, so checkout was not opened. Refresh the page and activate the offer again.',
    previewLabResult: 'Laboratory result', previewTotalCholesterol: 'Total cholesterol', previewGlucose: 'Glucose', previewHistory: 'Value history', previewConfirmed: '3 confirmed results',
    previewChartAria: 'Illustrative chart of three results from 2016, 2021 and 2026', previewDisclaimer: 'Illustrative display. Fitliner does not diagnose or replace a doctor.',
    phoneAria: 'Preview of a paper blood result becoming a clear chart in Fitliner Health', phoneSteps: 'Paper → confirmed values → chart', phoneCaption: 'Preview of result processing in the app',
  };
  if (locale === 'de') return {
    ...sk,
    privacyPrefix: 'Wir schützen deine Daten und Rechte gemäß der DSGVO.', privacyLink: 'So schützen wir deine Daten', educationBadge: 'Frühzugang zu Fitliner Health', marketingBonus: 'Kostenloser Bonus',
    discountedBadge: 'VIP · 50 % im ersten Jahr', discountedTitle: 'Dein erstes Fitliner-Health-Jahr zum halben Preis.',
    standardReasonEyebrow: 'Warum heute beginnen', standardReasonBody: 'Jeder weitere Blutwert ist wertvoller, wenn du ihn vergleichen kannst. Dein erstes Diagramm kann heute entstehen.',
    discountedReasonEyebrow: 'Dein VIP-Angebot ist aktiv', discountedReasonBody: 'Das erste Jahr kostet 17,40 €. Das Angebot gilt 48 Stunden. Danach verlängert sich das Abo zum regulären Gründerpreis.',
    discountedMonthly: '1,45 € / Monat im ersten Jahr', discountedDaily: '≈ 0,05 € pro Tag', valueSummary: (dailyPrice) => `Für nur ${dailyPrice} pro Tag baust du eine Historie auf, die mit jedem Ergebnis wertvoller wird.`,
    discountedBilling: 'Heute 17,40 € für die ersten 12 Monate', discountedGuarantee: 'Der VIP-Rabatt gilt 48 Stunden und nur für die erste Jahreszahlung.',
    discountedTerms: 'Ich akzeptiere die Nutzungsbedingungen, die heutige Zahlung von 17,40 € für das erste Jahr und danach die jährliche Zahlung von 34,80 €, bis ich kündige.', termsLink: 'Bedingungen',
    discountedCta: 'Erstes Jahr für 17,40 € aktivieren', accessNote: '12 Monate Zugang · sichere Zahlung · vor Verlängerung kündbar',
    exitBadge: 'VIP-Angebot · 48 Stunden', exitTitle: 'Warte — falls der Preis dich aufgehalten hat: Das erste Jahr kostet nur die Hälfte.',
    exitBody: 'Aktiviere Fitliner Health für 17,40 € in den ersten 12 Monaten — etwa 0,05 € pro Tag. Danach 34,80 € jährlich; vor der Verlängerung kündbar.',
    exitAccept: 'Ja, erstes Jahr für 17,40 €', exitClaiming: 'VIP-Angebot wird aktiviert…', exitDecline: 'Nein, danke',
    offerActivationError: 'Das VIP-Angebot konnte nicht aktiviert werden. Bitte versuche es erneut.', discountCheckoutError: 'Der VIP-Rabatt konnte nicht bestätigt werden. Aktualisiere die Seite und aktiviere das Angebot erneut.',
    previewLabResult: 'Laborbefund', previewTotalCholesterol: 'Gesamtcholesterin', previewGlucose: 'Glukose', previewHistory: 'Werteverlauf', previewConfirmed: '3 bestätigte Ergebnisse',
    previewChartAria: 'Beispieldiagramm mit drei Ergebnissen aus 2016, 2021 und 2026', previewDisclaimer: 'Beispielhafte Darstellung. Fitliner diagnostiziert nicht und ersetzt keinen Arzt.',
    phoneAria: 'Vorschau: Ein Blutbefund auf Papier wird in Fitliner Health zu einem übersichtlichen Diagramm', phoneSteps: 'Papier → bestätigte Werte → Diagramm', phoneCaption: 'Vorschau der Verarbeitung in der App',
  };
  if (locale === 'es') return {
    ...sk,
    privacyPrefix: 'Protegemos tus datos y tus derechos conforme al RGPD.', privacyLink: 'Cómo protegemos tus datos', educationBadge: 'Acceso anticipado a Fitliner Health', marketingBonus: 'Bonus gratuito',
    discountedBadge: 'VIP · 50 % el primer año', discountedTitle: 'Tu primer año de Fitliner Health a mitad de precio.',
    standardReasonEyebrow: 'Por qué empezar hoy', standardReasonBody: 'Cada nuevo resultado vale más cuando puedes compararlo. Tu primer gráfico puede empezar hoy.',
    discountedReasonEyebrow: 'Tu oferta VIP está activa', discountedReasonBody: 'El primer año cuesta 17,40 €. La oferta dura 48 horas. Después, la suscripción se renueva al precio fundador estándar.',
    discountedMonthly: '1,45 € / mes el primer año', discountedDaily: '≈ 0,05 € al día', valueSummary: (dailyPrice) => `Por solo ${dailyPrice} al día, construyes un historial que gana valor con cada resultado.`,
    discountedBilling: 'Paga hoy 17,40 € por los primeros 12 meses', discountedGuarantee: 'El descuento VIP dura 48 horas y solo se aplica al primer pago anual.',
    discountedTerms: 'Acepto las Condiciones de uso, el pago de hoy de 17,40 € por el primer año y el pago anual recurrente de 34,80 € hasta que cancele.', termsLink: 'Condiciones',
    discountedCta: 'Activar mi primer año por 17,40 €', accessNote: '12 meses de acceso · pago seguro · cancela antes de renovar',
    exitBadge: 'Oferta VIP · 48 horas', exitTitle: 'Espera: si te frenó el precio, consigue el primer año a mitad de precio.',
    exitBody: 'Activa Fitliner Health por 17,40 € durante los primeros 12 meses, unos 0,05 € al día. Después, 34,80 € al año; cancela antes de renovar.',
    exitAccept: 'Sí, quiero el primer año por 17,40 €', exitClaiming: 'Activando tu oferta VIP…', exitDecline: 'No, gracias',
    offerActivationError: 'No hemos podido activar la oferta VIP. Inténtalo de nuevo.', discountCheckoutError: 'No pudimos confirmar el descuento VIP. Actualiza la página y vuelve a activar la oferta.',
    previewLabResult: 'Resultado de laboratorio', previewTotalCholesterol: 'Colesterol total', previewGlucose: 'Glucosa', previewHistory: 'Historial del valor', previewConfirmed: '3 resultados confirmados',
    previewChartAria: 'Gráfico ilustrativo de tres resultados de 2016, 2021 y 2026', previewDisclaimer: 'Ejemplo ilustrativo. Fitliner no diagnostica ni sustituye a un médico.',
    phoneAria: 'Vista previa de un resultado en papel convertido en un gráfico claro en Fitliner Health', phoneSteps: 'Papel → valores confirmados → gráfico', phoneCaption: 'Vista previa del procesamiento en la app',
  };
  if (locale === 'fr') return {
    ...sk,
    privacyPrefix: 'Nous protégeons vos données et vos droits conformément au RGPD.', privacyLink: 'Comment nous protégeons vos données', educationBadge: 'Accès anticipé à Fitliner Health', marketingBonus: 'Bonus gratuit',
    discountedBadge: 'VIP · −50 % la première année', discountedTitle: 'Votre première année Fitliner Health à moitié prix.',
    standardReasonEyebrow: 'Pourquoi commencer aujourd’hui', standardReasonBody: 'Chaque nouveau résultat devient plus utile lorsque vous pouvez le comparer. Votre premier graphique peut commencer aujourd’hui.',
    discountedReasonEyebrow: 'Votre offre VIP est active', discountedReasonBody: 'La première année coûte 17,40 €. L’offre est valable 48 heures. Ensuite, l’abonnement est renouvelé au tarif fondateur standard.',
    discountedMonthly: '1,45 € / mois la première année', discountedDaily: '≈ 0,05 € par jour', valueSummary: (dailyPrice) => `Pour seulement ${dailyPrice} par jour, vous créez un historique dont la valeur augmente à chaque résultat.`,
    discountedBilling: 'Payez 17,40 € aujourd’hui pour les 12 premiers mois', discountedGuarantee: 'La remise VIP est valable 48 heures et uniquement sur le premier paiement annuel.',
    discountedTerms: 'J’accepte les Conditions d’utilisation, le paiement de 17,40 € aujourd’hui pour la première année, puis le paiement annuel récurrent de 34,80 € jusqu’à résiliation.', termsLink: 'Conditions',
    discountedCta: 'Activer ma première année à 17,40 €', accessNote: '12 mois d’accès · paiement sécurisé · résiliable avant renouvellement',
    exitBadge: 'Offre VIP · 48 heures', exitTitle: 'Attendez — si le prix vous a freiné, profitez de la première année à moitié prix.',
    exitBody: 'Activez Fitliner Health à 17,40 € pour les 12 premiers mois, soit environ 0,05 € par jour. Puis 34,80 € par an ; résiliable avant renouvellement.',
    exitAccept: 'Oui, je veux la première année à 17,40 €', exitClaiming: 'Activation de votre offre VIP…', exitDecline: 'Non merci',
    offerActivationError: 'Impossible d’activer l’offre VIP. Veuillez réessayer.', discountCheckoutError: 'Impossible de confirmer la remise VIP. Actualisez la page et réactivez l’offre.',
    previewLabResult: 'Résultat de laboratoire', previewTotalCholesterol: 'Cholestérol total', previewGlucose: 'Glycémie', previewHistory: 'Historique de la valeur', previewConfirmed: '3 résultats confirmés',
    previewChartAria: 'Graphique illustratif de trois résultats de 2016, 2021 et 2026', previewDisclaimer: 'Exemple d’affichage. Fitliner ne pose aucun diagnostic et ne remplace pas un médecin.',
    phoneAria: 'Aperçu de la transformation d’un bilan papier en graphique clair dans Fitliner Health', phoneSteps: 'Papier → valeurs confirmées → graphique', phoneCaption: 'Aperçu du traitement dans l’application',
  };
  if (locale === 'zh-Hans') return {
    ...sk,
    privacyPrefix: '我们依据 GDPR 保护你的数据与权利。', privacyLink: '我们如何保护数据', educationBadge: 'Fitliner Health 早期体验', marketingBonus: '免费奖励',
    discountedBadge: 'VIP · 首年五折', discountedTitle: 'Fitliner Health 首年半价。',
    standardReasonEyebrow: '为什么今天开始', standardReasonBody: '有历史数据可比较时，每一次新血检都会更有价值。你的第一张趋势图今天就能开始。',
    discountedReasonEyebrow: 'VIP 优惠已激活', discountedReasonBody: '首年仅 €17.40，优惠 48 小时内有效。首年后将按标准创始会员价续订。',
    discountedMonthly: '首年每月 €1.45', discountedDaily: '每天约 €0.05', valueSummary: (dailyPrice) => `每天只需 ${dailyPrice}，即可建立一份随每次结果不断增值的健康历史。`,
    discountedBilling: '今天支付 €17.40，获得前 12 个月', discountedGuarantee: 'VIP 折扣 48 小时内有效，仅适用于首次年度付款。',
    discountedTerms: '我接受使用条款，同意今天支付首年 €17.40，之后每年自动支付 €34.80，直至取消。', termsLink: '条款',
    discountedCta: '以 €17.40 激活首年', accessNote: '12 个月访问权限 · 安全支付 · 续订前可取消',
    exitBadge: 'VIP 优惠 · 48 小时', exitTitle: '等等——如果价格让你犹豫，首年可享五折。',
    exitBody: '首 12 个月仅需 €17.40，约合每天 €0.05。之后每年 €34.80；可在续订前取消。',
    exitAccept: '是的，我要以 €17.40 开通首年', exitClaiming: '正在激活 VIP 优惠…', exitDecline: '不用，谢谢',
    offerActivationError: '无法激活 VIP 优惠，请重试。', discountCheckoutError: '无法确认 VIP 折扣，因此未打开付款页面。请刷新页面并重新激活优惠。',
    previewLabResult: '实验室结果', previewTotalCholesterol: '总胆固醇', previewGlucose: '血糖', previewHistory: '指标历史', previewConfirmed: '3 个已确认结果',
    previewChartAria: '2016、2021 和 2026 年三个结果的示意图', previewDisclaimer: '仅为显示示例。Fitliner 不提供诊断，也不能替代医生。',
    phoneAria: '纸质血检结果在 Fitliner Health 中转换为清晰图表的预览', phoneSteps: '纸质报告 → 已确认数值 → 图表', phoneCaption: '应用内结果处理预览',
  };
  return sk;
}

function Brand() {
  return <div className="inline-flex items-start text-white"><span className="text-[17px] font-extrabold leading-none tracking-[0.24em]">F I T L I N E R</span><span className="ml-1 -translate-y-1 text-[8px] font-bold text-white/55">TM</span></div>;
}

function BloodHistoryPreview({ui}: {ui: BloodHistoryUiCopy}) {
  return <div className="relative mx-auto mt-7 w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-[#A78BFA]/20 bg-[#0B0911] p-4 text-left shadow-[0_24px_90px_rgba(87,43,180,0.2)] sm:rounded-[2rem] sm:p-7">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(124,58,237,0.23),transparent_48%)]" />
    <div className="relative grid items-stretch gap-4 sm:grid-cols-[0.88fr_auto_1.3fr] sm:gap-5">
      <div className="rotate-[-1.5deg] rounded-2xl border border-white/10 bg-[#F3F1EE] p-4 text-[#25222A] shadow-2xl sm:p-5">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/45">{ui.previewLabResult}</p><p className="mt-1 text-sm font-bold">12. 4. 2016</p></div>
          <span className="rounded-md bg-black/5 px-2 py-1 text-[9px] font-bold text-black/40">{ui.previewPdf}</span>
        </div>
        <div className="mt-4 space-y-3 text-[11px]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-black/8 pb-2"><span className="font-semibold">{ui.previewTotalCholesterol}</span><b>5,8</b><span className="text-black/45">mmol/l</span></div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-black/8 pb-2"><span className="font-semibold">{ui.previewGlucose}</span><b>5,1</b><span className="text-black/45">mmol/l</span></div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-3"><span className="font-semibold">ALT</span><b>0,42</b><span className="text-black/45">µkat/l</span></div>
        </div>
      </div>

      <div className="flex items-center justify-center text-2xl text-[#B9A1FF] sm:text-3xl" aria-hidden>→</div>

      <div className="rounded-2xl border border-[#9B73FF]/25 bg-[#111018]/95 p-4 shadow-2xl sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A78BFA]">{ui.previewHistory}</p><p className="mt-1 text-sm font-bold text-white">{ui.previewTotalCholesterol}</p></div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold text-emerald-300">{ui.previewConfirmed}</span>
        </div>
        <svg className="mt-4 h-28 w-full overflow-visible" viewBox="0 0 380 120" role="img" aria-label={ui.previewChartAria}>
          <defs><linearGradient id="healthTrendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35"/><stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/></linearGradient></defs>
          <path d="M22 94 L22 24 M22 94 L360 94" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <path d="M45 36 C110 45 155 60 205 65 S290 75 342 80 L342 94 L45 94 Z" fill="url(#healthTrendFill)" />
          <path d="M45 36 C110 45 155 60 205 65 S290 75 342 80" fill="none" stroke="#A78BFA" strokeWidth="4" strokeLinecap="round" />
          {[[45, 36], [205, 65], [342, 80]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="#0B0911" stroke="#C4B5FD" strokeWidth="4" />)}
          <text x="35" y="114" fill="rgba(255,255,255,0.45)" fontSize="11">2016</text><text x="194" y="114" fill="rgba(255,255,255,0.45)" fontSize="11">2021</text><text x="328" y="114" fill="rgba(255,255,255,0.45)" fontSize="11">2026</text>
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]"><div className="rounded-lg bg-white/[0.045] py-2"><b className="block text-sm text-white">5,8</b><span className="text-white/40">2016</span></div><div className="rounded-lg bg-white/[0.045] py-2"><b className="block text-sm text-white">5,2</b><span className="text-white/40">2021</span></div><div className="rounded-lg bg-white/[0.045] py-2"><b className="block text-sm text-white">4,9</b><span className="text-white/40">2026</span></div></div>
      </div>
    </div>
    <p className="relative mt-4 text-center text-[10px] leading-4 text-white/35">{ui.previewDisclaimer}</p>
  </div>;
}

function ResultsToChartPhonePreview({ui}: {ui: BloodHistoryUiCopy}) {
  return <figure className="relative mx-auto w-full max-w-[220px] sm:max-w-[250px]">
    <div className="pointer-events-none absolute -inset-8 rounded-full bg-[#7C3AED]/24 blur-3xl" />
    <div className="relative rounded-[2.7rem] border border-white/20 bg-gradient-to-b from-[#29252F] via-[#121016] to-[#050506] p-[7px] shadow-[0_28px_90px_rgba(0,0,0,0.58),0_0_0_1px_rgba(167,139,250,0.16)]">
      <div className="pointer-events-none absolute left-1/2 top-[13px] z-10 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-black/90 shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
      <div className="relative aspect-[9/16] overflow-hidden rounded-[2.25rem] bg-[#09090B] ring-1 ring-inset ring-white/10">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/videos/health/results-to-chart-poster.jpg"
          aria-label={ui.phoneAria}
          className="h-full w-full object-cover"
        >
          <source src="/videos/health/results-to-chart.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-center text-[10px] font-semibold leading-4 text-white/88 backdrop-blur-md">
          {ui.phoneSteps}
        </div>
      </div>
    </div>
    <figcaption className="mt-3 text-center text-[10px] leading-4 text-white/38">{ui.phoneCaption}</figcaption>
  </figure>;
}

export default function HealthFunnel({locale}: {locale: string}) {
  const t = useMemo(() => localizedCopy(locale), [locale]);
  const ui = useMemo(() => localizedBloodHistoryUi(locale), [locale]);
  const tracking = useMemo(() => trackingCopy(locale), [locale]);
  const [screen, setScreen] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState('');
  const [healthConsent, setHealthConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [error, setError] = useState('');
  const [attribution, setAttribution] = useState<Attribution>({});
  const [trackingConsent, setTrackingConsent] = useState(false);
  const [trackingChoice, setTrackingChoice] = useState<'accepted' | 'rejected' | ''>('');
  const [showExitOffer, setShowExitOffer] = useState(false);
  const [discountOffer, setDiscountOffer] = useState<DiscountOffer | null>(null);
  const [isClaimingOffer, setIsClaimingOffer] = useState(false);
  const [exitOfferDismissed, setExitOfferDismissed] = useState(false);
  const discountedOffer = Boolean(discountOffer);

  const educationScreen = 1;
  const emailScreen = 2;
  const offerScreen = 3;
  const finalProgressStep = 2;
  const showProgress = screen > 0 && screen < offerScreen;
  const questionIndex = -1;
  const question: Question | null = questionIndex >= 0 ? t.questions[questionIndex] : null;
  const progress = screen === 0 ? 0 : Math.min(100, Math.round((Math.min(screen, finalProgressStep) / finalProgressStep) * 100));
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  useEffect(() => {
    const raw = window.localStorage.getItem('fitliner_health_funnel_v2');
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as {answers?: Answers; email?: string};
      if (saved.answers) setAnswers(saved.answers);
      if (saved.email) setEmail(saved.email);
    } catch {
      window.localStorage.removeItem('fitliner_health_funnel_v2');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedTrackingChoice = window.localStorage.getItem('fitliner_marketing_tracking_consent');
    const trackingAllowed = savedTrackingChoice === 'accepted';
    setAttribution(readAttribution(trackingAllowed));
    if (trackingAllowed) {
      setTrackingChoice('accepted');
      setTrackingConsent(true);
      ensureMetaPixel();
    } else if (savedTrackingChoice === 'rejected') {
      setTrackingChoice('rejected');
    }
    const resumedRequestId = params.get('rid');
    if (validUuid(resumedRequestId)) {
      window.localStorage.setItem('fitliner_health_funnel_request_id', resumedRequestId);
    }
    const offerToken = params.get('offer');
    const currentRequestId = validUuid(resumedRequestId)
      ? resumedRequestId
      : window.localStorage.getItem('fitliner_health_funnel_request_id');
    if (validUuid(offerToken) && validUuid(currentRequestId)) {
      const offer = {
        token: offerToken,
        requestId: currentRequestId,
        expiresAt: new Date(Date.now() + 48 * 3_600_000).toISOString(),
      };
      saveDiscountOffer(offer);
      setDiscountOffer(offer);
      window.history.replaceState({}, '', `${window.location.origin}${window.location.pathname}`);
    } else if (validUuid(currentRequestId)) {
      setDiscountOffer(readDiscountOffer(currentRequestId));
    }
    window.localStorage.removeItem('fitliner_health_funnel_offer_token');
    window.localStorage.removeItem('fitliner_health_funnel_offer_expires_at');
  }, []);

  useEffect(() => {
    window.localStorage.setItem('fitliner_health_funnel_v2', JSON.stringify({answers, email}));
  }, [answers, email]);

  useEffect(() => {
    if (screen !== 8) return;
    const timer = window.setTimeout(() => setScreen(9), ANALYSIS_SCREEN_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== offerScreen || discountedOffer || exitOfferDismissed || showExitOffer) return;
    const onMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0 && !event.relatedTarget) {
        setShowExitOffer(true);
        if (trackingConsent) trackMetaCustom('HealthExitOfferShown');
      }
    };
    document.addEventListener('mouseout', onMouseOut);
    return () => document.removeEventListener('mouseout', onMouseOut);
  }, [discountedOffer, exitOfferDismissed, offerScreen, screen, showExitOffer, trackingConsent]);

  const choose = (value: string) => {
    if (!question) return;
    if (question.multiple) {
      const current = Array.isArray(answers[question.id]) ? answers[question.id] as string[] : [];
      const withoutNone = value === 'none' ? [] : current.filter((item) => item !== 'none');
      const next = value === 'none' ? ['none'] : withoutNone.includes(value) ? withoutNone.filter((item) => item !== value) : [...withoutNone, value];
      setAnswers((old) => ({...old, [question.id]: next}));
      return;
    }
    setAnswers((old) => ({...old, [question.id]: value}));
    window.setTimeout(() => setScreen((current) => current + 1), 220);
  };

  const hasAnswer = question ? (Array.isArray(answers[question.id]) ? (answers[question.id] as string[]).length > 0 : Boolean(answers[question.id])) : false;

  const startQuiz = () => {
    setScreen(1);
    trackMetaCustom('HealthQuizStart');
  };

  const acceptTracking = () => {
    window.localStorage.setItem('fitliner_marketing_tracking_consent', 'accepted');
    setTrackingChoice('accepted');
    setTrackingConsent(true);
    setAttribution(readAttribution(true));
    ensureMetaPixel();
  };

  const rejectTracking = () => {
    window.localStorage.setItem('fitliner_marketing_tracking_consent', 'rejected');
    setTrackingChoice('rejected');
    setTrackingConsent(false);
    setAttribution(readAttribution(false));
  };

  const requestId = () => {
    const key = 'fitliner_health_funnel_request_id';
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(key, created);
    return created;
  };

  const showOffer = async () => {
    if (!emailOk || !healthConsent || isSavingLead) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setIsSavingLead(true);
    try {
      if (supabaseUrl && anonKey) {
        const response = await fetch(`${supabaseUrl}/functions/v1/health-save-web-lead`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}`},
          body: JSON.stringify({
            request_id: requestId(),
            email: email.trim().toLowerCase(),
            locale,
            answers,
            attribution,
            source_url: sourceUrl(trackingConsent),
            health_data_consent: true,
            privacy_consent: true,
            marketing_consent: marketingConsent,
          }),
        });
        if (!response.ok) {
          console.error('Health lead capture failed', await response.text());
        } else if (trackingConsent) {
          const registrationEventId = crypto.randomUUID();
          const id = requestId();
          trackMetaStandard('CompleteRegistration', {content_name: 'Fitliner Health'}, registrationEventId);
          void sendServerRegistrationEvent(registrationEventId, id, email.trim().toLowerCase()).catch((conversionError) => {
            console.error('Meta server registration event failed', conversionError);
          });
        }
      }
    } catch (leadError) {
      console.error('Health lead capture failed', leadError);
    } finally {
      setIsSavingLead(false);
      setScreen(offerScreen);
    }
  };

  const claimExitOffer = async () => {
    if (!emailOk || isClaimingOffer) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      setError(t.checkoutError);
      return;
    }
    setIsClaimingOffer(true);
    setError('');
    try {
      const currentRequestId = requestId();
      const response = await fetch(`${supabaseUrl}/functions/v1/health-save-web-lead`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}`},
        body: JSON.stringify({
          action: 'claim_exit_offer',
          request_id: currentRequestId,
          email: email.trim().toLowerCase(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.offer_token) throw new Error(payload?.error || 'offer_failed');
      const offer = {
        token: String(payload.offer_token),
        requestId: currentRequestId,
        expiresAt: String(payload.expires_at),
      };
      if (!validUuid(offer.token) || !offer.expiresAt) throw new Error('invalid_offer');
      saveDiscountOffer(offer);
      setDiscountOffer(offer);
      setShowExitOffer(false);
      setTermsAccepted(false);
      if (trackingConsent) trackMetaCustom('HealthExitOfferAccepted');
    } catch (offerError) {
      console.error('Health exit offer failed', offerError);
      setError(ui.offerActivationError);
      setShowExitOffer(false);
    } finally {
      setIsClaimingOffer(false);
    }
  };

  const startCheckout = async () => {
    if (!emailOk || !healthConsent || !termsAccepted || isSubmitting) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      setError(t.checkoutError);
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      if (trackingConsent) trackMetaStandard('InitiateCheckout', {value: discountedOffer ? 17.4 : 34.8, currency: 'EUR'});
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-create-health-web-checkout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}`},
        body: JSON.stringify({
          request_id: requestId(),
          email: email.trim().toLowerCase(),
          locale,
          answers,
          attribution,
          source_url: sourceUrl(trackingConsent),
          health_data_consent: healthConsent,
          privacy_consent: healthConsent,
          terms_accepted: termsAccepted,
          marketing_consent: marketingConsent,
          marketing_tracking_consent: trackingConsent,
          offer_token: discountOffer?.token ?? null,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'checkout_failed');
      if (discountOffer && payload?.discount_applied !== true) {
        throw new Error('discount_not_applied');
      }
      if (payload?.already_active) {
        setError(t.alreadyMemberCta);
        return;
      }
      if (!payload?.checkout_url) throw new Error('missing_checkout_url');
      window.location.assign(payload.checkout_url);
    } catch (checkoutError) {
      console.error('Health web checkout failed', checkoutError);
      setError(discountOffer ? ui.discountCheckoutError : t.checkoutError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#070709] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(124,58,237,0.28),transparent_42%)]" />
      <div className={`relative mx-auto flex min-h-screen w-full flex-col px-5 pb-10 pt-6 sm:px-8 ${screen === 0 ? 'max-w-5xl' : 'max-w-3xl'}`}>
        <header className="flex items-center justify-between gap-4">
          <Link href={`/${locale}`} aria-label="Fitliner home"><Brand /></Link>
          {showProgress && <div className="text-xs font-medium text-white/45">{t.stepLabel} {Math.min(screen, finalProgressStep)} / {finalProgressStep}</div>}
        </header>

        {showProgress && <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-[#6D38FF] to-[#B45CFF] transition-all duration-500" style={{width: `${progress}%`}} /></div>}

        <section className="flex flex-1 flex-col justify-center py-8 sm:py-12">
          {screen === 0 && <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{t.introEyebrow}</p>
            <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold leading-[1.04] tracking-[-0.04em] sm:text-6xl">{t.introTitle}</h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/66 sm:text-lg">{t.introBody}</p>
            <button onClick={startQuiz} className="mx-auto mt-7 min-h-14 w-full max-w-2xl rounded-2xl bg-gradient-to-r from-[#6D38FF] to-[#9B5CFF] px-6 py-4 text-base font-bold shadow-[0_18px_50px_rgba(124,58,237,0.32)] transition hover:brightness-110">{t.introCta} <span aria-hidden>→</span></button>
            <div className="mx-auto mt-5 grid max-w-4xl gap-2 text-left sm:grid-cols-3">{t.introTrust.map((item) => <div key={item} className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-3 text-xs text-white/58"><span className="mr-2 text-emerald-400">✓</span>{item}</div>)}</div>
            <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-white/40">{ui.privacyPrefix} <Link className="text-[#B9A1FF] underline" href={`/${locale}/privacy`}>{ui.privacyLink}</Link></p>
            <BloodHistoryPreview ui={ui} />
          </div>}

          {question && <div>
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{question.title}</h1>
            {question.hint && <p className="mt-3 text-sm text-white/55">{question.hint}</p>}
            <div className="mt-7 grid gap-3">{question.options.map((option) => {
              const selected = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]).includes(option.value) : answers[question.id] === option.value;
              return <button key={option.value} onClick={() => choose(option.value)} aria-pressed={selected} className={`group flex min-h-16 w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${selected ? 'border-[#9B73FF] bg-[#7C3AED]/20 shadow-[0_0_0_1px_rgba(167,139,250,0.2)]' : 'border-white/10 bg-white/[0.045] hover:border-white/25 hover:bg-white/[0.07]'}`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${selected ? 'bg-[#8B5CF6] text-white' : 'bg-white/7 text-[#A78BFA]'}`}>{option.icon}</span>
                <span className="flex-1 text-sm font-semibold leading-5 sm:text-base">{option.label}</span>
                <span className={`text-xl ${selected ? 'text-[#B9A1FF]' : 'text-white/25'}`}>{selected ? '✓' : '›'}</span>
              </button>;
            })}</div>
            {question.multiple && <button disabled={!hasAnswer} onClick={() => setScreen((current) => current + 1)} className="mt-6 min-h-14 w-full rounded-2xl bg-[#8B5CF6] px-6 py-4 font-bold disabled:cursor-not-allowed disabled:opacity-35">{t.continue}</button>}
          </div>}

          {screen === educationScreen && <div>
            <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_250px] md:gap-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{t.educationEyebrow}</p>
                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{t.educationTitle}</h1>
                <p className="mt-5 text-base leading-7 text-white/65">{t.educationBody}</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-2 text-xs font-semibold text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />{ui.educationBadge}</div>
              </div>
              <ResultsToChartPhonePreview ui={ui} />
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">{t.educationItems.map((item) => <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"><div className="text-2xl text-[#A78BFA]">{item.icon}</div><h2 className="mt-4 font-bold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-white/55">{item.body}</p></div>)}</div>
            <button onClick={() => setScreen(emailScreen)} className="mt-7 min-h-14 w-full rounded-2xl bg-[#8B5CF6] px-6 py-4 font-bold">{t.educationCta}</button>
          </div>}

          {screen === 8 && <div className="text-center" role="status" aria-live="polite">
            <div className="mx-auto h-24 w-24 animate-spin rounded-full border-[7px] border-white/8 border-t-[#9B73FF]" />
            <h1 className="mx-auto mt-8 max-w-xl text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{t.analysisTitle}</h1>
            <div className="mx-auto mt-7 max-w-md space-y-3 text-left">{t.analysisSteps.map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-white/65"><span className="text-emerald-400">{index < 2 ? '✓' : '✦'}</span>{item}</div>)}</div>
          </div>}

          {screen === 9 && <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{t.resultEyebrow}</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{t.resultTitle}</h1>
            <p className="mt-5 text-base leading-7 text-white/65">{t.resultBody}</p>
            <div className="mt-7 grid gap-3">{t.resultCards.map((item) => <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.055] to-white/[0.025] p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/25 text-2xl text-[#B9A1FF]">{item.icon}</div><div><h2 className="font-bold">{item.title}</h2><p className="mt-1 text-sm leading-6 text-white/56">{item.body}</p></div></div>)}</div>
            <button onClick={() => setScreen(10)} className="mt-7 min-h-14 w-full rounded-2xl bg-[#8B5CF6] px-6 py-4 font-bold">{t.resultCta}</button>
          </div>}

          {screen === emailScreen && <div>
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{t.emailTitle}</h1>
            <p className="mt-5 text-base leading-7 text-white/65">{t.emailBody}</p>
            <label className="mt-7 block text-sm font-semibold" htmlFor="health-email">Email</label>
            <input id="health-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t.emailPlaceholder} className="mt-2 min-h-14 w-full rounded-2xl border border-white/12 bg-white/[0.055] px-4 text-base text-white outline-none placeholder:text-white/28 focus:border-[#9B73FF]" />
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/65"><input type="checkbox" checked={healthConsent} onChange={(event) => setHealthConsent(event.target.checked)} className="mt-1 h-5 w-5 accent-[#8B5CF6]" /><span>{t.healthConsent} <Link className="text-[#B9A1FF] underline" href={`/${locale}/privacy`}>{ui.privacyLink}</Link></span></label>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#9B73FF]/25 bg-[#7C3AED]/10 p-4 text-sm leading-6 text-white/72 transition hover:border-[#9B73FF]/45"><input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#8B5CF6]" /><span><span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-[#B9A1FF]">{ui.marketingBonus}</span>{t.marketingConsent}</span></label>
            <button disabled={!emailOk || !healthConsent || isSavingLead} onClick={showOffer} className="mt-7 min-h-14 w-full rounded-2xl bg-[#8B5CF6] px-6 py-4 font-bold disabled:cursor-not-allowed disabled:opacity-35">{t.emailCta}</button>
          </div>}

          {screen === offerScreen && <div>
            <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{t.offerEyebrow}</p><span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-200">{discountedOffer ? ui.discountedBadge : t.offerBadge}</span></div>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{discountedOffer ? ui.discountedTitle : t.offerTitle}</h1>
            <p className="mt-5 text-base leading-7 text-white/65">{t.offerBody}</p>
            <div className="mt-6 flex gap-4 rounded-2xl border border-amber-300/25 bg-gradient-to-r from-amber-300/10 to-[#7C3AED]/12 p-4 shadow-[0_14px_45px_rgba(251,191,36,0.08)]">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-200/20 bg-amber-200/10 text-lg">⌁</span>
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">{discountedOffer ? ui.discountedReasonEyebrow : ui.standardReasonEyebrow}</p><p className="mt-1 text-sm leading-6 text-white/72">{discountedOffer ? ui.discountedReasonBody : ui.standardReasonBody}</p></div>
            </div>
            <div className="mt-7 rounded-[1.75rem] border border-[#9B73FF]/40 bg-gradient-to-br from-[#7C3AED]/20 via-white/[0.045] to-white/[0.025] p-6 shadow-[0_20px_80px_rgba(124,58,237,0.18)]">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{discountedOffer ? ui.discountedMonthly : t.perMonth}</div><div className="mt-2 text-sm font-semibold text-emerald-300">{discountedOffer ? ui.discountedDaily : t.dailyPrice}</div></div><div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">{t.accessLabel}</div></div>
              <p className="mt-4 text-sm leading-6 text-white/62">{ui.valueSummary(
                locale === 'en' || locale === 'zh-Hans'
                  ? discountedOffer ? '€0.05' : '€0.10'
                  : discountedOffer ? '0,05 €' : '0,10 €'
              )}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white/90">{discountedOffer ? ui.discountedBilling : t.billedYearly}</p><p className="mt-1 text-sm leading-6 text-white/55">{t.renewalNote}</p></div>
              <div className="my-6 h-px bg-white/10" />
              <ul className="space-y-3">{t.included.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-white/75"><span className="text-emerald-400">✓</span><span>{item}</span></li>)}</ul>
              <div className="mt-6 flex gap-3 rounded-2xl border border-[#9B73FF]/25 bg-[#7C3AED]/12 p-4 text-sm leading-6 text-white/70"><span className="text-lg text-[#B9A1FF]">✦</span><span>{discountedOffer ? ui.discountedGuarantee : t.priceGuarantee}</span></div>
            </div>
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/65"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-5 w-5 accent-[#8B5CF6]" /><span>{discountedOffer ? ui.discountedTerms : t.termsConsent} <Link className="text-[#B9A1FF] underline" href={`/${locale}/terms`}>{ui.termsLink}</Link></span></label>
            <button disabled={!termsAccepted || isSubmitting} onClick={startCheckout} className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#6D38FF] to-[#9B5CFF] px-6 py-4 text-base font-bold shadow-[0_18px_50px_rgba(124,58,237,0.3)] disabled:cursor-not-allowed disabled:opacity-40">{isSubmitting ? t.submitting : discountedOffer ? ui.discountedCta : t.subscribe}</button>
            <p className="mt-3 text-center text-xs font-medium text-white/52">{ui.accessNote}</p>
            <p className="mt-3 text-center text-xs text-white/42">🔒 {t.merchantDisclosure}</p>
            {error && <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100" role="alert">{error}</p>}
            <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.035] p-4"><p className="text-sm font-bold">{t.alreadyMember}</p><p className="mt-1 text-sm leading-6 text-white/58">{t.alreadyMemberCta}</p></div>
            <p className="mt-5 text-xs leading-5 text-white/38">{t.medicalNote}</p>
          </div>}
        </section>

        {screen > 0 && screen !== 8 && <button onClick={() => setScreen((current) => Math.max(0, current - 1))} className="self-start rounded-xl px-2 py-2 text-sm text-white/45 transition hover:text-white">← {t.back}</button>}
      </div>

      {!trackingChoice && <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#17141e]/95 p-4 shadow-2xl backdrop-blur-xl md:flex md:items-center md:gap-5">
        <p className="text-xs leading-5 text-white/65">{tracking.body}</p>
        <div className="mt-3 flex shrink-0 gap-2 md:mt-0">
          <button type="button" onClick={rejectTracking} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/65">{tracking.reject}</button>
          <button type="button" onClick={acceptTracking} className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold">{tracking.accept}</button>
        </div>
      </aside>}

      {showExitOffer && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="health-exit-offer-title">
        <div className="w-full max-w-lg rounded-[1.75rem] border border-[#A78BFA]/35 bg-[#15111d] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.65)] sm:p-8">
          <span className="inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200">{ui.exitBadge}</span>
          <h2 id="health-exit-offer-title" className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em]">{ui.exitTitle}</h2>
          <p className="mt-4 text-base leading-7 text-white/68">{ui.exitBody}</p>
          <button type="button" disabled={isClaimingOffer} onClick={claimExitOffer} className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#6D38FF] to-[#9B5CFF] px-5 py-4 font-bold disabled:opacity-50">{isClaimingOffer ? ui.exitClaiming : ui.exitAccept}</button>
          <button type="button" onClick={() => { setShowExitOffer(false); setExitOfferDismissed(true); }} className="mt-3 min-h-11 w-full rounded-xl px-4 py-3 text-sm text-white/48 transition hover:text-white">{ui.exitDecline}</button>
        </div>
      </div>}
    </main>
  );
}
