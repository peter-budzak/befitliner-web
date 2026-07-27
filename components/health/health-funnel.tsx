'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';

type AnswerValue = string | string[];
type Answers = Record<string, AnswerValue>;
type Attribution = Record<string, string>;
type Question = {
  id: string;
  title: string;
  hint?: string;
  multiple?: boolean;
  options: Array<{value: string; label: string; icon: string}>;
};

const ANALYSIS_SCREEN_DURATION_MS = 5200;

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
    {id: 'goal', title: 'Čo chceš mať lepšie pod kontrolou?', options: [
      {value: 'lab_results', label: 'Krvné výsledky a biomarkery', icon: '◒'},
      {value: 'body_composition', label: 'Hmotnosť a zloženie tela', icon: '◉'},
      {value: 'both', label: 'Oboje na jednom mieste', icon: '✦'},
      {value: 'prevention', label: 'Dlhodobú prevenciu a trendy', icon: '↗'},
    ]},
    {id: 'sources', title: 'Aké výsledky už máš alebo plánuješ sledovať?', hint: 'Vyber všetko, čo platí.', multiple: true, options: [
      {value: 'lab_pdf', label: 'Laboratórne PDF alebo fotografie', icon: '▤'},
      {value: 'scale', label: 'Výsledky z diagnostickej váhy', icon: '⚖'},
      {value: 'manual', label: 'Hodnoty, ktoré zadám ručne', icon: '✎'},
      {value: 'none', label: 'Zatiaľ nemám žiadne výsledky', icon: '○'},
    ]},
    {id: 'scale_recency', title: 'Kedy si bol naposledy na diagnostickej váhe?', options: [
      {value: 'month', label: 'Počas posledného mesiaca', icon: '✓'},
      {value: 'six_months', label: 'Pred 1–6 mesiacmi', icon: '◷'},
      {value: 'older', label: 'Pred viac ako 6 mesiacmi', icon: '◴'},
      {value: 'never', label: 'Ešte nikdy', icon: '＋'},
    ]},
    {id: 'lab_recency', title: 'Kedy si absolvoval posledné krvné testy?', options: [
      {value: 'six_months', label: 'Počas posledných 6 mesiacov', icon: '✓'},
      {value: 'year', label: 'Pred 6–12 mesiacmi', icon: '◷'},
      {value: 'older', label: 'Pred viac ako rokom', icon: '◴'},
      {value: 'never', label: 'Nepamätám si / nikdy', icon: '＋'},
    ]},
    {id: 'barrier', title: 'Čo ti dnes najviac bráni sledovať svoje zdravie?', options: [
      {value: 'scattered', label: 'Výsledky mám rozhádzané v papieroch a e-mailoch', icon: '▱'},
      {value: 'understanding', label: 'Neviem, čo hodnoty znamenajú', icon: '?'},
      {value: 'trends', label: 'Nevidím vývoj a súvislosti v čase', icon: '⌁'},
      {value: 'routine', label: 'Zabúdam na pravidelné merania a testy', icon: '◷'},
    ]},
    {id: 'priority', title: 'Čo má pre teba Zdravotná karta robiť?', hint: 'Vyber všetko, čo je pre teba dôležité.', multiple: true, options: [
      {value: 'archive', label: 'Bezpečne uchovať všetky výsledky', icon: '▣'},
      {value: 'charts', label: 'Ukázať prehľadné grafy a trendy', icon: '↗'},
      {value: 'reminders', label: 'Pripomenúť ďalšie meranie alebo test', icon: '◷'},
      {value: 'ai', label: 'Dať AI trénerovi lepší kontext', icon: '✦'},
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
    language: 'sk', introEyebrow: 'Fitliner Zdravotná karta',
    introTitle: 'Tvoje zdravotné výsledky konečne dávajú zmysel.',
    introBody: 'Nahraj výsledky krvných testov z laboratória alebo výsledky z diagnostickej váhy. Fitliner ich usporiada, ukáže vývoj v čase a dá AI trénerovi kontext pre užitočnejšie odporúčania.',
    introCta: 'Zistiť, čo hovoria moje výsledky',
    introTrust: ['PDF alebo fotografia', 'Výsledky v rôznych jazykoch', 'Pred uložením všetko skontroluješ'],
    stepLabel: 'Krok', continue: 'Pokračovať', back: 'Späť', questions: commonQuestions.sk,
    educationEyebrow: 'Jeden bezpečný archív', educationTitle: 'Z papiera na prehľadný vývoj za pár sekúnd.',
    educationBody: 'Fitliner rozpozná jednotlivé metriky, jednotky, dátum aj referenčné rozpätie. Pred uložením ti nájdené hodnoty ukáže na kontrolu, aby sa nič nepomiešalo.',
    educationItems: [
      {title: 'Ľubovoľný formát', body: 'PDF, fotografia alebo ručné zadanie.', icon: '▤'},
      {title: 'Každá metrika zvlášť', body: 'Cholesterol, vitamín D či telesný tuk majú vlastnú históriu.', icon: '⌁'},
      {title: 'Ty rozhoduješ', body: 'Žiadny údaj sa neuloží bez tvojej kontroly.', icon: '✓'},
    ], educationCta: 'Rozumiem, pokračovať',
    analysisTitle: 'Pripravujeme tvoj osobný zdravotný prehľad',
    analysisSteps: ['Vyhodnocujeme tvoje ciele', 'Nastavujeme vhodnú frekvenciu meraní', 'Pripravujeme Zdravotnú kartu'],
    resultEyebrow: 'Tvoj Fitliner Health plán', resultTitle: 'Máš jasný systém, nie ďalšiu zložku s výsledkami.',
    resultBody: 'Zdravotná karta spojí merania, krvné testy a tvoj životný štýl do jedného prehľadu. Uvidíš, čo sa mení a kedy má zmysel výsledky zopakovať.',
    resultCards: [
      {title: 'Mesačný rytmus', body: 'Diagnostickú váhu odporučíme približne raz mesačne.', icon: '⚖'},
      {title: 'Polročný check-in', body: 'Krvné testy pripomenieme približne každých 6 mesiacov.', icon: '◒'},
      {title: 'Osobný kontext', body: 'AI tréner spojí výsledky s jedlom, tréningom a profilom.', icon: '✦'},
    ], resultCta: 'Poslať môj plán na e-mail',
    emailTitle: 'Kam ti máme priradiť Zdravotnú kartu?',
    emailBody: 'Použi rovnaký e-mail, ktorým sa prihlásiš do aplikácie Fitliner. Health sa aktivuje práve tomuto účtu.',
    emailPlaceholder: 'tvoj@email.sk',
    healthConsent: 'Súhlasím so spracovaním odpovedí z dotazníka na prípravu a správu mojej Zdravotnej karty.',
    marketingConsent: 'Chcem dostať svoj plán, užitočné tipy a pripomenutie, ak aktiváciu nedokončím. (nepovinné)',
    emailCta: 'Zobraziť môj plán',
    offerEyebrow: 'Fitliner Health · ročný plán', offerBadge: 'Zakladateľská cena',
    offerTitle: 'Celý rok zdravia pod kontrolou za menej než 0,10 € denne.',
    offerBody: 'Aktivuj si kompletnú Zdravotnú kartu za uvádzaciu cenu pre prvých používateľov Fitliner Health.',
    perMonth: '2,90 € / mesiac', dailyPrice: '≈ 0,10 € denne', billedYearly: 'Dnes zaplatíš 34,80 € za 12 mesiacov',
    renewalNote: 'Potom 34,80 € každých 12 mesiacov. Zrušiť môžeš pred ďalšou platbou.',
    priceGuarantee: 'Zakladateľskú cenu 34,80 € ročne si zachováš, kým zostane predplatné nepretržite aktívne.',
    merchantDisclosure: 'Predané cez Link. Link je oficiálnym predajcom transakcie a Stripe zabezpečuje platbu aj transakčnú podporu.', accessLabel: '12 mesiacov prístupu',
    included: ['Výsledky z váhy a laboratórií na jednom bezpečnom mieste', 'Neobmedzený import PDF a fotografií v rôznych jazykoch', 'Jasné grafy a referenčné rozpätia pre každú metriku', 'Mesačné pripomienky váhy a polročné pripomienky krvných testov', 'Kontext pre personalizované tipy AI trénera'],
    termsConsent: 'Súhlasím s Podmienkami používania a s opakovanou ročnou platbou 34,80 €, kým predplatné nezruším.',
    subscribe: 'Aktivovať Fitliner Health', alreadyMember: 'Máš aktívne členstvo v partnerskom gyme?',
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

export default function HealthFunnel({locale}: {locale: string}) {
  const t = useMemo(() => localizedCopy(locale), [locale]);
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

  const educationScreen = 3;
  const questionIndex = screen === 1 ? 0 : screen === 2 ? 1 : screen >= 4 && screen <= 7 ? screen - 2 : -1;
  const question = questionIndex >= 0 ? t.questions[questionIndex] : null;
  const progress = screen === 0 ? 0 : Math.min(100, Math.round((Math.min(screen, 9) / 9) * 100));
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  useEffect(() => {
    const raw = window.localStorage.getItem('fitliner_health_funnel_v1');
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as {answers?: Answers; email?: string};
      if (saved.answers) setAnswers(saved.answers);
      if (saved.email) setEmail(saved.email);
    } catch {
      window.localStorage.removeItem('fitliner_health_funnel_v1');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next: Attribution = {};
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const value = params.get(key)?.trim();
      if (value) next[key] = value.slice(0, 200);
    }
    setAttribution(next);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('fitliner_health_funnel_v1', JSON.stringify({answers, email}));
  }, [answers, email]);

  useEffect(() => {
    if (screen !== 8) return;
    const timer = window.setTimeout(() => setScreen(9), ANALYSIS_SCREEN_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [screen]);

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
            source_url: `${window.location.origin}${window.location.pathname}`,
            health_data_consent: true,
            privacy_consent: true,
            marketing_consent: marketingConsent,
          }),
        });
        if (!response.ok) console.error('Health lead capture failed', await response.text());
      }
    } catch (leadError) {
      console.error('Health lead capture failed', leadError);
    } finally {
      setIsSavingLead(false);
      setScreen(11);
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
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-create-health-web-checkout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}`},
        body: JSON.stringify({
          request_id: requestId(),
          email: email.trim().toLowerCase(),
          locale,
          answers,
          attribution,
          source_url: `${window.location.origin}${window.location.pathname}`,
          health_data_consent: healthConsent,
          privacy_consent: healthConsent,
          terms_accepted: termsAccepted,
          marketing_consent: marketingConsent,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'checkout_failed');
      if (payload?.already_active) {
        setError(t.alreadyMemberCta);
        return;
      }
      if (!payload?.checkout_url) throw new Error('missing_checkout_url');
      window.location.assign(payload.checkout_url);
    } catch (checkoutError) {
      console.error('Health web checkout failed', checkoutError);
      setError(t.checkoutError);
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
          {screen > 0 && screen < 11 && <div className="text-xs font-medium text-white/45">{t.stepLabel} {Math.min(screen, 9)} / 9</div>}
        </header>

        {screen > 0 && screen < 11 && <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-[#6D38FF] to-[#B45CFF] transition-all duration-500" style={{width: `${progress}%`}} /></div>}

        <section className="flex flex-1 flex-col justify-center py-8 sm:py-12">
          {screen === 0 && <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{t.introEyebrow}</p>
            <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold leading-[1.04] tracking-[-0.04em] sm:text-6xl">{t.introTitle}</h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/66 sm:text-lg">{t.introBody}</p>
            <button onClick={startQuiz} className="mx-auto mt-7 min-h-14 w-full max-w-2xl rounded-2xl bg-gradient-to-r from-[#6D38FF] to-[#9B5CFF] px-6 py-4 text-base font-bold shadow-[0_18px_50px_rgba(124,58,237,0.32)] transition hover:brightness-110">{t.introCta} <span aria-hidden>→</span></button>
            <div className="mx-auto mt-5 grid max-w-4xl gap-2 text-left sm:grid-cols-3">{t.introTrust.map((item) => <div key={item} className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-3 text-xs text-white/58"><span className="mr-2 text-emerald-400">✓</span>{item}</div>)}</div>
            <div className="relative mx-auto mt-7 w-full max-w-4xl overflow-hidden rounded-[1.5rem] border border-[#A78BFA]/15 bg-[#0B0911] shadow-[0_24px_90px_rgba(87,43,180,0.2)] sm:rounded-[2rem]">
              <Image src="/images/health/fitliner-health-paper-to-history-hero.jpg" alt="" width={1600} height={900} priority sizes="(max-width: 640px) 100vw, 896px" className="h-auto w-full" />
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/[0.035]" />
            </div>
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{t.educationEyebrow}</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{t.educationTitle}</h1>
            <p className="mt-5 text-base leading-7 text-white/65">{t.educationBody}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">{t.educationItems.map((item) => <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5"><div className="text-2xl text-[#A78BFA]">{item.icon}</div><h2 className="mt-4 font-bold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-white/55">{item.body}</p></div>)}</div>
            <button onClick={() => setScreen(4)} className="mt-7 min-h-14 w-full rounded-2xl bg-[#8B5CF6] px-6 py-4 font-bold">{t.educationCta}</button>
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

          {screen === 10 && <div>
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{t.emailTitle}</h1>
            <p className="mt-5 text-base leading-7 text-white/65">{t.emailBody}</p>
            <label className="mt-7 block text-sm font-semibold" htmlFor="health-email">Email</label>
            <input id="health-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t.emailPlaceholder} className="mt-2 min-h-14 w-full rounded-2xl border border-white/12 bg-white/[0.055] px-4 text-base text-white outline-none placeholder:text-white/28 focus:border-[#9B73FF]" />
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/65"><input type="checkbox" checked={healthConsent} onChange={(event) => setHealthConsent(event.target.checked)} className="mt-1 h-5 w-5 accent-[#8B5CF6]" /><span>{t.healthConsent} <Link className="text-[#B9A1FF] underline" href={`/${locale}/privacy`}>Privacy</Link></span></label>
            <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/55"><input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} className="mt-1 h-5 w-5 accent-[#8B5CF6]" /><span>{t.marketingConsent}</span></label>
            <button disabled={!emailOk || !healthConsent || isSavingLead} onClick={showOffer} className="mt-7 min-h-14 w-full rounded-2xl bg-[#8B5CF6] px-6 py-4 font-bold disabled:cursor-not-allowed disabled:opacity-35">{t.emailCta}</button>
          </div>}

          {screen === 11 && <div>
            <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A78BFA]">{t.offerEyebrow}</p><span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-200">{t.offerBadge}</span></div>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">{t.offerTitle}</h1>
            <p className="mt-5 text-base leading-7 text-white/65">{t.offerBody}</p>
            <div className="mt-7 rounded-[1.75rem] border border-[#9B73FF]/40 bg-gradient-to-br from-[#7C3AED]/20 via-white/[0.045] to-white/[0.025] p-6 shadow-[0_20px_80px_rgba(124,58,237,0.18)]">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{t.perMonth}</div><div className="mt-2 text-sm font-semibold text-emerald-300">{t.dailyPrice}</div></div><div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">{t.accessLabel}</div></div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white/90">{t.billedYearly}</p><p className="mt-1 text-sm leading-6 text-white/55">{t.renewalNote}</p></div>
              <div className="my-6 h-px bg-white/10" />
              <ul className="space-y-3">{t.included.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-white/75"><span className="text-emerald-400">✓</span><span>{item}</span></li>)}</ul>
              <div className="mt-6 flex gap-3 rounded-2xl border border-[#9B73FF]/25 bg-[#7C3AED]/12 p-4 text-sm leading-6 text-white/70"><span className="text-lg text-[#B9A1FF]">✦</span><span>{t.priceGuarantee}</span></div>
            </div>
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/65"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-5 w-5 accent-[#8B5CF6]" /><span>{t.termsConsent} <Link className="text-[#B9A1FF] underline" href={`/${locale}/terms`}>Terms</Link></span></label>
            <button disabled={!termsAccepted || isSubmitting} onClick={startCheckout} className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-[#6D38FF] to-[#9B5CFF] px-6 py-4 text-base font-bold shadow-[0_18px_50px_rgba(124,58,237,0.3)] disabled:cursor-not-allowed disabled:opacity-40">{isSubmitting ? t.submitting : t.subscribe}</button>
            <p className="mt-3 text-center text-xs text-white/42">🔒 {t.merchantDisclosure}</p>
            {error && <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100" role="alert">{error}</p>}
            <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.035] p-4"><p className="text-sm font-bold">{t.alreadyMember}</p><p className="mt-1 text-sm leading-6 text-white/58">{t.alreadyMemberCta}</p></div>
            <p className="mt-5 text-xs leading-5 text-white/38">{t.medicalNote}</p>
          </div>}
        </section>

        {screen > 0 && screen !== 8 && <button onClick={() => setScreen((current) => current === 4 ? 3 : Math.max(0, current - 1))} className="self-start rounded-xl px-2 py-2 text-sm text-white/45 transition hover:text-white">← {t.back}</button>}
      </div>
    </main>
  );
}
