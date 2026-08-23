'use client';

import Image from 'next/image';
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
    {id: 'goal', title: 'What would you like to understand better?', options: [
      {value: 'lab_results', label: 'Blood results and biomarkers', icon: '◒'},
      {value: 'body_composition', label: 'Weight and body composition', icon: '◉'},
      {value: 'both', label: 'Both in one clear place', icon: '✦'},
      {value: 'prevention', label: 'Long-term prevention and trends', icon: '↗'},
    ]},
    {id: 'sources', title: 'Which results do you have or plan to track?', hint: 'Select all that apply.', multiple: true, options: [
      {value: 'lab_pdf', label: 'Lab PDFs or photos', icon: '▤'},
      {value: 'scale', label: 'Diagnostic scale reports', icon: '⚖'},
      {value: 'manual', label: 'Values I enter manually', icon: '✎'},
      {value: 'none', label: 'I do not have any results yet', icon: '○'},
    ]},
    {id: 'scale_recency', title: 'When was your last diagnostic scale measurement?', options: [
      {value: 'month', label: 'Within the last month', icon: '✓'},
      {value: 'six_months', label: '1–6 months ago', icon: '◷'},
      {value: 'older', label: 'More than 6 months ago', icon: '◴'},
      {value: 'never', label: 'Never', icon: '＋'},
    ]},
    {id: 'lab_recency', title: 'When did you last have blood tests?', options: [
      {value: 'six_months', label: 'Within the last 6 months', icon: '✓'},
      {value: 'year', label: '6–12 months ago', icon: '◷'},
      {value: 'older', label: 'More than a year ago', icon: '◴'},
      {value: 'never', label: 'I do not remember / never', icon: '＋'},
    ]},
    {id: 'barrier', title: 'What makes health tracking difficult today?', options: [
      {value: 'scattered', label: 'Results are scattered across paper and email', icon: '▱'},
      {value: 'understanding', label: 'I do not know what the values mean', icon: '?'},
      {value: 'trends', label: 'I cannot see changes and patterns over time', icon: '⌁'},
      {value: 'routine', label: 'I forget regular measurements and tests', icon: '◷'},
    ]},
    {id: 'priority', title: 'What should your Health Card do for you?', hint: 'Select all that matter.', multiple: true, options: [
      {value: 'archive', label: 'Keep every result securely', icon: '▣'},
      {value: 'charts', label: 'Show clear charts and trends', icon: '↗'},
      {value: 'reminders', label: 'Remind me when to retest', icon: '◷'},
      {value: 'ai', label: 'Give my AI Trainer better context', icon: '✦'},
    ]},
  ] as Question[],
};

const questionTranslations: Record<string, Array<{title: string; hint?: string; labels: string[]}>> = {
  de: [
    {title: 'Was möchtest du besser verstehen?', labels: ['Blutwerte und Biomarker', 'Gewicht und Körperzusammensetzung', 'Beides an einem übersichtlichen Ort', 'Langfristige Prävention und Trends']},
    {title: 'Welche Ergebnisse hast du oder möchtest du verfolgen?', hint: 'Wähle alles Zutreffende.', labels: ['Labor-PDFs oder Fotos', 'Berichte einer Körperanalysewaage', 'Werte, die ich manuell eingebe', 'Ich habe noch keine Ergebnisse']},
    {title: 'Wann war deine letzte Messung auf einer Körperanalysewaage?', labels: ['Im letzten Monat', 'Vor 1–6 Monaten', 'Vor mehr als 6 Monaten', 'Noch nie']},
    {title: 'Wann hattest du zuletzt eine Blutuntersuchung?', labels: ['In den letzten 6 Monaten', 'Vor 6–12 Monaten', 'Vor mehr als einem Jahr', 'Ich weiß es nicht / noch nie']},
    {title: 'Was erschwert dir heute das Gesundheits-Tracking?', labels: ['Ergebnisse liegen verteilt auf Papier und in E-Mails', 'Ich weiß nicht, was die Werte bedeuten', 'Ich sehe Veränderungen und Zusammenhänge nicht', 'Ich vergesse regelmäßige Messungen und Tests']},
    {title: 'Was soll deine Gesundheitskarte für dich tun?', hint: 'Wähle alles, was dir wichtig ist.', labels: ['Alle Ergebnisse sicher aufbewahren', 'Klare Diagramme und Trends zeigen', 'An die nächste Messung erinnern', 'Meinem AI Trainer mehr Kontext geben']},
  ],
  es: [
    {title: '¿Qué te gustaría entender mejor?', labels: ['Resultados de sangre y biomarcadores', 'Peso y composición corporal', 'Todo en un único lugar claro', 'Prevención y tendencias a largo plazo']},
    {title: '¿Qué resultados tienes o piensas seguir?', hint: 'Selecciona todo lo que corresponda.', labels: ['PDF o fotos del laboratorio', 'Informes de báscula diagnóstica', 'Valores que introduciré manualmente', 'Todavía no tengo resultados']},
    {title: '¿Cuándo fue tu última medición en una báscula diagnóstica?', labels: ['Durante el último mes', 'Hace 1–6 meses', 'Hace más de 6 meses', 'Nunca']},
    {title: '¿Cuándo te hiciste el último análisis de sangre?', labels: ['Durante los últimos 6 meses', 'Hace 6–12 meses', 'Hace más de un año', 'No lo recuerdo / nunca']},
    {title: '¿Qué dificulta hoy el seguimiento de tu salud?', labels: ['Mis resultados están dispersos en papeles y correos', 'No sé qué significan los valores', 'No puedo ver los cambios a lo largo del tiempo', 'Olvido las mediciones y pruebas periódicas']},
    {title: '¿Qué debería hacer tu Tarjeta de Salud por ti?', hint: 'Selecciona todo lo importante.', labels: ['Guardar todos mis resultados de forma segura', 'Mostrar gráficos y tendencias claros', 'Recordarme cuándo repetir una prueba', 'Dar más contexto a mi Entrenador IA']},
  ],
  fr: [
    {title: 'Que souhaitez-vous mieux comprendre ?', labels: ['Bilans sanguins et biomarqueurs', 'Poids et composition corporelle', 'Les deux au même endroit', 'Prévention et tendances à long terme']},
    {title: 'Quels résultats avez-vous ou souhaitez-vous suivre ?', hint: 'Sélectionnez toutes les réponses pertinentes.', labels: ['PDF ou photos de laboratoire', 'Rapports d’impédancemètre', 'Valeurs saisies manuellement', 'Je n’ai pas encore de résultats']},
    {title: 'Quand avez-vous utilisé un impédancemètre pour la dernière fois ?', labels: ['Au cours du dernier mois', 'Il y a 1 à 6 mois', 'Il y a plus de 6 mois', 'Jamais']},
    {title: 'Quand avez-vous fait votre dernier bilan sanguin ?', labels: ['Au cours des 6 derniers mois', 'Il y a 6 à 12 mois', 'Il y a plus d’un an', 'Je ne sais plus / jamais']},
    {title: 'Qu’est-ce qui complique votre suivi santé aujourd’hui ?', labels: ['Mes résultats sont dispersés entre papier et e-mails', 'Je ne comprends pas la signification des valeurs', 'Je ne vois pas les évolutions dans le temps', 'J’oublie les mesures et bilans réguliers']},
    {title: 'Que doit faire votre Carte Santé pour vous ?', hint: 'Sélectionnez tout ce qui compte.', labels: ['Conserver tous mes résultats en sécurité', 'Afficher des graphiques et tendances clairs', 'Me rappeler quand refaire un bilan', 'Donner plus de contexte à mon Coach IA']},
  ],
  'zh-Hans': [
    {title: '你最想更好地了解什么？', labels: ['血液检查与生物标志物', '体重与身体成分', '在一个地方同时查看两者', '长期预防与趋势']},
    {title: '你已有或计划追踪哪些结果？', hint: '可多选。', labels: ['化验单 PDF 或照片', '体成分秤报告', '手动输入的数值', '目前还没有结果']},
    {title: '你上次进行体成分测量是什么时候？', labels: ['最近一个月内', '1–6 个月前', '超过 6 个月前', '从未测量']},
    {title: '你上次做血液检查是什么时候？', labels: ['最近 6 个月内', '6–12 个月前', '超过一年前', '不记得 / 从未检查']},
    {title: '目前是什么让健康追踪变得困难？', labels: ['结果散落在纸张和邮件中', '不清楚各项数值的含义', '看不到长期变化和关联', '经常忘记定期测量和检查']},
    {title: '你希望健康档案为你做什么？', hint: '可多选。', labels: ['安全保存所有结果', '显示清晰的图表与趋势', '提醒我何时再次检查', '为 AI 教练提供更多背景']},
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
    language: 'en', introEyebrow: 'Fitliner Health Card', introTitle: 'Your health results, finally made clear.',
    introBody: 'Upload lab or diagnostic scale reports. Fitliner organizes every metric, shows change over time and gives your AI Trainer better context for useful guidance.',
    introCta: 'Build my health overview', introTrust: ['PDF or photo', 'Reports in different languages', 'Review everything before saving'],
    stepLabel: 'Step', continue: 'Continue', back: 'Back', questions: commonQuestions.en,
    educationEyebrow: 'One secure archive', educationTitle: 'Turn scattered reports into a clear timeline in seconds.',
    educationBody: 'Fitliner detects individual metrics, units, dates and reference ranges. You review every value before it is saved, so different reports never get mixed up.',
    educationItems: [
      {title: 'Any common format', body: 'PDF, photo or manual entry.', icon: '▤'},
      {title: 'One timeline per metric', body: 'Cholesterol, vitamin D or body fat stay separate.', icon: '⌁'},
      {title: 'You stay in control', body: 'Nothing is saved without your review.', icon: '✓'},
    ], educationCta: 'Got it, continue', analysisTitle: 'Building your personal health overview',
    analysisSteps: ['Reviewing your goals', 'Setting a useful measurement rhythm', 'Preparing your Health Card'],
    resultEyebrow: 'Your Fitliner Health plan', resultTitle: 'A clear system, not another folder of reports.',
    resultBody: 'Your Health Card brings measurements, blood tests and lifestyle context into one view. See what changes and when it may be useful to repeat a test.',
    resultCards: [
      {title: 'Monthly rhythm', body: 'We recommend a diagnostic scale check about once a month.', icon: '⚖'},
      {title: 'Six-month check-in', body: 'We remind you about blood tests about every six months.', icon: '◒'},
      {title: 'Personal context', body: 'Your AI Trainer connects results with meals, training and profile data.', icon: '✦'},
    ], resultCta: 'Send my plan to email', emailTitle: 'Which account should receive your Health Card?',
    emailBody: 'Use the same email you will use in the Fitliner app. Health is activated for that exact account.',
    emailPlaceholder: 'you@example.com', healthConsent: 'I agree to the processing of my questionnaire answers to prepare and manage my Health Card.',
    marketingConsent: 'Send me my plan, useful tips and a reminder if I do not finish activation. (optional)', emailCta: 'Show my plan',
    offerEyebrow: 'Fitliner Health · annual plan', offerBadge: 'Founding price',
    offerTitle: 'A full year of health context for less than €0.10 a day.',
    offerBody: 'Unlock the complete Health Card at the introductory price for early Fitliner Health members.',
    perMonth: '€2.90 / month', dailyPrice: '≈ €0.10 a day', billedYearly: 'Pay €34.80 today for 12 months',
    renewalNote: 'Then €34.80 every 12 months. Cancel before your next charge.',
    priceGuarantee: 'Keep the €34.80 annual founding price while your subscription remains continuously active.',
    merchantDisclosure: 'Sold through Link. Link is the merchant of record, with payment and transaction support provided by Stripe.', accessLabel: '12 months of access',
    included: ['Scale and laboratory results in one secure place', 'Unlimited PDF and photo imports in multiple languages', 'Clear charts and reference ranges for every metric', 'Monthly scale and six-month blood-test reminders', 'Context for personalized AI Trainer tips'],
    termsConsent: 'I accept the Terms of Use and the recurring annual charge of €34.80 until I cancel.',
    subscribe: 'Activate Fitliner Health', alreadyMember: 'Do you have an active membership at a partner gym?',
    alreadyMemberCta: 'Your Health Card is already included. Open the Fitliner app and do not pay twice.',
    medicalNote: 'Fitliner does not provide a diagnosis or medical advice. Always discuss results and recommendations with a qualified healthcare professional.',
    checkoutError: 'We could not open checkout. Check your email and try again.', submitting: 'Preparing secure checkout…',
  },
};

const localeAliases: Record<string, string> = {de: 'en', es: 'en', fr: 'en', 'zh-Hans': 'en'};

function localizedCopy(locale: string): FunnelCopy {
  const base = copy[locale] ?? copy[localeAliases[locale]] ?? copy.en;
  if (locale === 'de') return {
    ...base, questions: translatedQuestions('de'), language: 'de', introEyebrow: 'Fitliner Gesundheitskarte', introTitle: 'Deine Gesundheitswerte – endlich verständlich.',
    introBody: 'Lade Labor- oder Körperanalyse-Berichte hoch. Fitliner ordnet jede Messgröße, zeigt Veränderungen und gibt deinem AI Trainer besseren Kontext.',
    introCta: 'Meine Gesundheitsübersicht erstellen', introTrust: ['PDF oder Foto', 'Berichte in verschiedenen Sprachen', 'Alles vor dem Speichern prüfen'],
    stepLabel: 'Schritt', continue: 'Weiter', back: 'Zurück',
    emailTitle: 'Welchem Konto sollen wir deine Gesundheitskarte zuordnen?', emailBody: 'Nutze dieselbe E-Mail-Adresse wie in der Fitliner App. Health wird genau für dieses Konto aktiviert.',
    emailPlaceholder: 'du@beispiel.de', marketingConsent: 'Sende mir meinen Plan, nützliche Tipps und eine Erinnerung, falls ich die Aktivierung nicht abschließe. (optional)', emailCta: 'Meinen Plan anzeigen',
    offerEyebrow: 'Fitliner Health · Jahresplan', offerBadge: 'Gründerpreis', offerTitle: 'Ein ganzes Jahr Gesundheitsüberblick für weniger als 0,10 € pro Tag.',
    offerBody: 'Aktiviere die vollständige Gesundheitskarte zum Einführungspreis für frühe Fitliner-Health-Mitglieder.',
    perMonth: '2,90 € / Monat', dailyPrice: '≈ 0,10 € pro Tag', billedYearly: 'Heute 34,80 € für 12 Monate',
    renewalNote: 'Danach 34,80 € alle 12 Monate. Vor der nächsten Zahlung kündbar.',
    priceGuarantee: 'Der Gründerpreis von 34,80 € pro Jahr bleibt bei ununterbrochenem Abo erhalten.',
    merchantDisclosure: 'Verkauft über Link. Link ist der Vertragshändler; Stripe übernimmt Zahlung und Transaktionssupport.', accessLabel: '12 Monate Zugang', subscribe: 'Fitliner Health aktivieren',
    submitting: 'Sichere Zahlung wird vorbereitet…', checkoutError: 'Die Zahlung konnte nicht geöffnet werden. Prüfe deine E-Mail und versuche es erneut.',
  };
  if (locale === 'es') return {...base, questions: translatedQuestions('es'), language: 'es', introEyebrow: 'Tarjeta de Salud Fitliner', introTitle: 'Tus resultados de salud, por fin claros.', introBody: 'Sube análisis de laboratorio o informes de báscula diagnóstica. Fitliner organiza cada métrica, muestra su evolución y da más contexto a tu Entrenador IA.', introCta: 'Crear mi resumen de salud', stepLabel: 'Paso', continue: 'Continuar', back: 'Atrás', emailTitle: '¿A qué cuenta asignamos tu Tarjeta de Salud?', emailBody: 'Usa el mismo correo con el que entrarás en la app Fitliner. Tras el pago, Health se activará para esa cuenta.', emailPlaceholder: 'tu@correo.es', emailCta: 'Ver mi plan y precio', offerEyebrow: 'Fitliner Health · plan anual', offerBadge: 'Precio fundador', offerTitle: 'Un año completo de contexto de salud por menos de 0,10 € al día.', offerBody: 'Activa la Tarjeta de Salud completa con el precio de lanzamiento para los primeros miembros.', perMonth: '2,90 € / mes', dailyPrice: '≈ 0,10 € al día', billedYearly: 'Paga hoy 34,80 € por 12 meses', renewalNote: 'Después, 34,80 € cada 12 meses. Cancela antes del próximo cobro.', priceGuarantee: 'Mantén el precio fundador de 34,80 € al año mientras tu suscripción siga activa.', merchantDisclosure: 'Vendido a través de Link. Link es el vendedor oficial y Stripe gestiona el pago y el soporte de la transacción.', accessLabel: '12 meses de acceso', subscribe: 'Activar Fitliner Health', submitting: 'Preparando pago seguro…'};
  if (locale === 'fr') return {...base, questions: translatedQuestions('fr'), language: 'fr', introEyebrow: 'Carte Santé Fitliner', introTitle: 'Vos résultats de santé, enfin faciles à comprendre.', introBody: 'Importez vos bilans de laboratoire ou d’impédancemètre. Fitliner organise chaque mesure, montre son évolution et donne plus de contexte à votre Coach IA.', introCta: 'Créer mon aperçu santé', stepLabel: 'Étape', continue: 'Continuer', back: 'Retour', emailTitle: 'À quel compte associer votre Carte Santé ?', emailBody: 'Utilisez la même adresse e-mail que dans l’app Fitliner. Après paiement, Health sera activé pour ce compte.', emailPlaceholder: 'vous@exemple.fr', emailCta: 'Voir mon plan et le prix', offerEyebrow: 'Fitliner Health · formule annuelle', offerBadge: 'Prix fondateur', offerTitle: 'Une année complète de suivi santé pour moins de 0,10 € par jour.', offerBody: 'Activez la Carte Santé complète au tarif de lancement réservé aux premiers membres.', perMonth: '2,90 € / mois', dailyPrice: '≈ 0,10 € par jour', billedYearly: 'Payez 34,80 € aujourd’hui pour 12 mois', renewalNote: 'Puis 34,80 € tous les 12 mois. Résiliable avant le prochain paiement.', priceGuarantee: 'Conservez le prix fondateur de 34,80 € par an tant que votre abonnement reste actif.', merchantDisclosure: 'Vendu via Link. Link est le vendeur officiel et Stripe gère le paiement et l’assistance transactionnelle.', accessLabel: '12 mois d’accès', subscribe: 'Activer Fitliner Health', submitting: 'Préparation du paiement sécurisé…'};
  if (locale === 'zh-Hans') return {...base, questions: translatedQuestions('zh-Hans'), language: 'zh-Hans', introEyebrow: 'Fitliner 健康档案', introTitle: '让你的健康数据终于清晰易懂。', introBody: '上传化验单或体成分报告。Fitliner 会整理每项指标、展示长期变化，并为 AI 教练提供更完整的背景。', introCta: '生成我的健康概览', stepLabel: '步骤', continue: '继续', back: '返回', emailTitle: '健康档案应关联到哪个账号？', emailBody: '请使用登录 Fitliner 应用时相同的邮箱。付款后，Health 会自动为该账号开通。', emailPlaceholder: 'you@example.com', emailCta: '查看方案和价格', offerEyebrow: 'Fitliner Health · 年度方案', offerBadge: '创始会员价', offerTitle: '每天不到 €0.10，获得一整年的健康趋势管理。', offerBody: '首批 Fitliner Health 会员可按上线优惠价开通完整健康档案。', perMonth: '每月 €2.90', dailyPrice: '每天约 €0.10', billedYearly: '今天支付 €34.80，使用 12 个月', renewalNote: '之后每 12 个月支付 €34.80，可在下次扣款前取消。', priceGuarantee: '订阅持续有效期间，保留每年 €34.80 的创始会员价。', merchantDisclosure: '通过 Link 销售。Link 是本次交易的法定销售方，Stripe 负责付款及交易支持。', accessLabel: '12 个月访问权限', subscribe: '开通 Fitliner Health', submitting: '正在准备安全支付…'};
  return base;
}

function Brand() {
  return <div className="inline-flex items-start text-white"><span className="text-[17px] font-extrabold leading-none tracking-[0.24em]">F I T L I N E R</span><span className="ml-1 -translate-y-1 text-[8px] font-bold text-white/55">TM</span></div>;
}

function BloodHistoryPreview() {
  return <div className="relative mx-auto mt-7 w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-[#A78BFA]/20 bg-[#0B0911] p-4 text-left shadow-[0_24px_90px_rgba(87,43,180,0.2)] sm:rounded-[2rem] sm:p-7">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(124,58,237,0.23),transparent_48%)]" />
    <div className="relative grid items-stretch gap-4 sm:grid-cols-[0.88fr_auto_1.3fr] sm:gap-5">
      <div className="rotate-[-1.5deg] rounded-2xl border border-white/10 bg-[#F3F1EE] p-4 text-[#25222A] shadow-2xl sm:p-5">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/45">Laboratórny výsledok</p><p className="mt-1 text-sm font-bold">12. 4. 2016</p></div>
          <span className="rounded-md bg-black/5 px-2 py-1 text-[9px] font-bold text-black/40">PDF</span>
        </div>
        <div className="mt-4 space-y-3 text-[11px]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-black/8 pb-2"><span className="font-semibold">Celkový cholesterol</span><b>5,8</b><span className="text-black/45">mmol/l</span></div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-black/8 pb-2"><span className="font-semibold">Glukóza</span><b>5,1</b><span className="text-black/45">mmol/l</span></div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-3"><span className="font-semibold">ALT</span><b>0,42</b><span className="text-black/45">µkat/l</span></div>
        </div>
      </div>

      <div className="flex items-center justify-center text-2xl text-[#B9A1FF] sm:text-3xl" aria-hidden>→</div>

      <div className="rounded-2xl border border-[#9B73FF]/25 bg-[#111018]/95 p-4 shadow-2xl sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A78BFA]">História hodnoty</p><p className="mt-1 text-sm font-bold text-white">Celkový cholesterol</p></div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold text-emerald-300">3 potvrdené výsledky</span>
        </div>
        <svg className="mt-4 h-28 w-full overflow-visible" viewBox="0 0 380 120" role="img" aria-label="Ilustračný graf troch výsledkov v rokoch 2016, 2021 a 2026">
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
    <p className="relative mt-4 text-center text-[10px] leading-4 text-white/35">Ilustračný príklad zobrazenia. Fitliner neposkytuje diagnózu ani nenahrádza lekára.</p>
  </div>;
}

function ResultsToChartPhonePreview() {
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
          aria-label="Ukážka premeny papierového krvného výsledku na prehľadný graf vo Fitliner Health"
          className="h-full w-full object-cover"
        >
          <source src="/videos/health/results-to-chart.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-center text-[10px] font-semibold leading-4 text-white/88 backdrop-blur-md">
          Papier → potvrdené hodnoty → graf
        </div>
      </div>
    </div>
    <figcaption className="mt-3 text-center text-[10px] leading-4 text-white/38">Ukážka spracovania výsledku v aplikácii</figcaption>
  </figure>;
}

export default function HealthFunnel({locale}: {locale: string}) {
  const t = useMemo(() => localizedCopy(locale), [locale]);
  const tracking = useMemo(() => trackingCopy(locale), [locale]);
  const isSkBloodHistory = locale === 'sk';
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

  const educationScreen = isSkBloodHistory ? 1 : 3;
  const emailScreen = isSkBloodHistory ? 2 : 10;
  const offerScreen = isSkBloodHistory ? 3 : 11;
  const finalProgressStep = isSkBloodHistory ? 2 : 9;
  const showProgress = screen > 0 && screen < offerScreen;
  const questionIndex = isSkBloodHistory ? -1 : screen === 1 ? 0 : screen === 2 ? 1 : screen >= 4 && screen <= 7 ? screen - 2 : -1;
  const question = questionIndex >= 0 ? t.questions[questionIndex] : null;
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
    if (!isSkBloodHistory || screen !== offerScreen || discountedOffer || exitOfferDismissed || showExitOffer) return;
    const onMouseOut = (event: MouseEvent) => {
      if (event.clientY <= 0 && !event.relatedTarget) {
        setShowExitOffer(true);
        if (trackingConsent) trackMetaCustom('HealthExitOfferShown');
      }
    };
    document.addEventListener('mouseout', onMouseOut);
    return () => document.removeEventListener('mouseout', onMouseOut);
  }, [discountedOffer, exitOfferDismissed, isSkBloodHistory, offerScreen, screen, showExitOffer, trackingConsent]);

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
      setError('VIP ponuku sa nepodarilo aktivovať. Skús to, prosím, znova.');
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
      setError(discountOffer
        ? 'VIP zľavu sa nepodarilo potvrdiť, preto sme platbu neotvorili. Obnov stránku a skús ponuku aktivovať znova.'
        : t.checkoutError);
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
            {isSkBloodHistory && <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-white/40">Ochranu údajov a tvoje práva nastavujeme podľa pravidiel GDPR. <Link className="text-[#B9A1FF] underline" href="/sk/privacy">Ako chránime údaje</Link></p>}
            {isSkBloodHistory ? <BloodHistoryPreview /> : <div className="relative mx-auto mt-7 w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-[#A78BFA]/15 bg-[#0B0911] shadow-[0_24px_90px_rgba(87,43,180,0.2)] sm:rounded-[2rem]">
              <Image src="/images/health/fitliner-health-paper-to-history-hero.jpg" alt="" width={1600} height={900} priority sizes="(max-width: 640px) 100vw, 896px" className="h-auto w-full" />
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/[0.035]" />
            </div>}
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
            <div className={isSkBloodHistory ? 'grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_250px] md:gap-10' : ''}>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{t.educationEyebrow}</p>
                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{t.educationTitle}</h1>
                <p className="mt-5 text-base leading-7 text-white/65">{t.educationBody}</p>
                {isSkBloodHistory && <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-2 text-xs font-semibold text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />Včasný prístup k Fitliner Health</div>}
              </div>
              {isSkBloodHistory && <ResultsToChartPhonePreview />}
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">{t.educationItems.map((item) => <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"><div className="text-2xl text-[#A78BFA]">{item.icon}</div><h2 className="mt-4 font-bold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-white/55">{item.body}</p></div>)}</div>
            <button onClick={() => setScreen(isSkBloodHistory ? emailScreen : 4)} className="mt-7 min-h-14 w-full rounded-2xl bg-[#8B5CF6] px-6 py-4 font-bold">{t.educationCta}</button>
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
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/65"><input type="checkbox" checked={healthConsent} onChange={(event) => setHealthConsent(event.target.checked)} className="mt-1 h-5 w-5 accent-[#8B5CF6]" /><span>{t.healthConsent} <Link className="text-[#B9A1FF] underline" href={`/${locale}/privacy`}>Privacy</Link></span></label>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#9B73FF]/25 bg-[#7C3AED]/10 p-4 text-sm leading-6 text-white/72 transition hover:border-[#9B73FF]/45"><input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#8B5CF6]" /><span>{isSkBloodHistory && <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-[#B9A1FF]">Bonus zdarma</span>}{t.marketingConsent}</span></label>
            <button disabled={!emailOk || !healthConsent || isSavingLead} onClick={showOffer} className="mt-7 min-h-14 w-full rounded-2xl bg-[#8B5CF6] px-6 py-4 font-bold disabled:cursor-not-allowed disabled:opacity-35">{t.emailCta}</button>
          </div>}

          {screen === offerScreen && <div>
            <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{t.offerEyebrow}</p><span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-200">{discountedOffer && isSkBloodHistory ? 'VIP · −50 % na prvý rok' : t.offerBadge}</span></div>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{discountedOffer && isSkBloodHistory ? 'Prvý rok Fitliner Health za polovicu.' : t.offerTitle}</h1>
            <p className="mt-5 text-base leading-7 text-white/65">{t.offerBody}</p>
            {isSkBloodHistory && <div className="mt-6 flex gap-4 rounded-2xl border border-amber-300/25 bg-gradient-to-r from-amber-300/10 to-[#7C3AED]/12 p-4 shadow-[0_14px_45px_rgba(251,191,36,0.08)]">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-200/20 bg-amber-200/10 text-lg">⌁</span>
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">{discountedOffer ? 'VIP ponuka je aktívna' : 'Prečo začať dnes'}</p><p className="mt-1 text-sm leading-6 text-white/72">{discountedOffer ? 'Prvý rok máš za 17,40 €. Ponuka platí 48 hodín. Po prvom roku sa predplatné obnoví za štandardnú zakladateľskú cenu.' : 'Každý ďalší krvný výsledok má väčšiu hodnotu, keď ho máš s čím porovnať. Tvoj prvý graf môže vzniknúť ešte dnes.'}</p></div>
            </div>}
            <div className="mt-7 rounded-[1.75rem] border border-[#9B73FF]/40 bg-gradient-to-br from-[#7C3AED]/20 via-white/[0.045] to-white/[0.025] p-6 shadow-[0_20px_80px_rgba(124,58,237,0.18)]">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{discountedOffer && isSkBloodHistory ? '1,45 € / mesiac prvý rok' : t.perMonth}</div><div className="mt-2 text-sm font-semibold text-emerald-300">{discountedOffer && isSkBloodHistory ? '≈ 0,05 € denne' : t.dailyPrice}</div></div><div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">{t.accessLabel}</div></div>
              {isSkBloodHistory && <p className="mt-4 text-sm leading-6 text-white/62">Za symbolických {discountedOffer ? '0,05 €' : '0,10 €'} denne si buduješ prehľad, ktorého hodnota rastie s každým výsledkom.</p>}
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white/90">{discountedOffer && isSkBloodHistory ? 'Dnes zaplatíš 17,40 € za prvých 12 mesiacov' : t.billedYearly}</p><p className="mt-1 text-sm leading-6 text-white/55">{t.renewalNote}</p></div>
              <div className="my-6 h-px bg-white/10" />
              <ul className="space-y-3">{t.included.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-white/75"><span className="text-emerald-400">✓</span><span>{item}</span></li>)}</ul>
              <div className="mt-6 flex gap-3 rounded-2xl border border-[#9B73FF]/25 bg-[#7C3AED]/12 p-4 text-sm leading-6 text-white/70"><span className="text-lg text-[#B9A1FF]">✦</span><span>{discountedOffer && isSkBloodHistory ? 'VIP zľava platí 48 hodín a uplatní sa iba na prvú ročnú platbu.' : t.priceGuarantee}</span></div>
            </div>
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/65"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-5 w-5 accent-[#8B5CF6]" /><span>{discountedOffer && isSkBloodHistory ? 'Súhlasím s Podmienkami používania, dnešnou platbou 17,40 € za prvý rok a následnou opakovanou ročnou platbou 34,80 €, kým predplatné nezruším.' : t.termsConsent} <Link className="text-[#B9A1FF] underline" href={`/${locale}/terms`}>{isSkBloodHistory ? 'Podmienky' : 'Terms'}</Link></span></label>
            <button disabled={!termsAccepted || isSubmitting} onClick={startCheckout} className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#6D38FF] to-[#9B5CFF] px-6 py-4 text-base font-bold shadow-[0_18px_50px_rgba(124,58,237,0.3)] disabled:cursor-not-allowed disabled:opacity-40">{isSubmitting ? t.submitting : discountedOffer && isSkBloodHistory ? 'Aktivovať prvý rok za 17,40 €' : t.subscribe}</button>
            {isSkBloodHistory && <p className="mt-3 text-center text-xs font-medium text-white/52">12 mesiacov prístupu · bezpečná platba · zrušenie pred obnovením</p>}
            <p className="mt-3 text-center text-xs text-white/42">🔒 {t.merchantDisclosure}</p>
            {error && <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100" role="alert">{error}</p>}
            <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.035] p-4"><p className="text-sm font-bold">{t.alreadyMember}</p><p className="mt-1 text-sm leading-6 text-white/58">{t.alreadyMemberCta}</p></div>
            <p className="mt-5 text-xs leading-5 text-white/38">{t.medicalNote}</p>
          </div>}
        </section>

        {screen > 0 && screen !== 8 && <button onClick={() => setScreen((current) => current === 4 && !isSkBloodHistory ? 3 : Math.max(0, current - 1))} className="self-start rounded-xl px-2 py-2 text-sm text-white/45 transition hover:text-white">← {t.back}</button>}
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
          <span className="inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200">VIP ponuka · 48 hodín</span>
          <h2 id="health-exit-offer-title" className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em]">Počkaj — ak ťa zastavila cena, prvý rok máš za polovicu.</h2>
          <p className="mt-4 text-base leading-7 text-white/68">Aktivuj Fitliner Health za <strong className="text-white">17,40 € na prvých 12 mesiacov</strong>, teda približne 0,05 € denne. Potom 34,80 € ročne; zrušiť môžeš pred obnovením.</p>
          <button type="button" disabled={isClaimingOffer} onClick={claimExitOffer} className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#6D38FF] to-[#9B5CFF] px-5 py-4 font-bold disabled:opacity-50">{isClaimingOffer ? 'Aktivujem VIP ponuku…' : 'Áno, chcem prvý rok za 17,40 €'}</button>
          <button type="button" onClick={() => { setShowExitOffer(false); setExitOfferDismissed(true); }} className="mt-3 min-h-11 w-full rounded-xl px-4 py-3 text-sm text-white/48 transition hover:text-white">Nie, ďakujem</button>
        </div>
      </div>}
    </main>
  );
}
