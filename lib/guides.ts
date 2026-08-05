export const GUIDE_LOCALES = ['en', 'sk'] as const;
export type GuideLocale = (typeof GUIDE_LOCALES)[number];
export const GUIDE_SLUGS = ['phone-gym-access', 'gym-management-software-checklist', 'health-report-timeline'] as const;
export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: GuideSlug;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  readingTime: string;
  takeaways: string[];
  sections: GuideSection[];
  relatedProduct: {label: string; href: string};
};

export const GUIDES: Record<GuideLocale, Record<GuideSlug, Guide>> = {
  en: {
    'phone-gym-access': {
      slug: 'phone-gym-access',
      eyebrow: 'Gym access guide',
      title: 'How phone-based gym access works—and what happens when technology fails',
      description: 'A practical explanation of mobile gym keys, access permissions, smart locks, security logs and the backup plan every gym should have.',
      intro: 'A phone can replace a plastic access card only when the membership system, app and physical lock agree that a person may enter. The useful question is not simply whether a door can open from an app, but how eligibility, security, privacy and failure scenarios are handled from end to end.',
      readingTime: '7 min read',
      takeaways: [
        'A mobile key is a time-bound entitlement, not just a button on a screen.',
        'Bluetooth or nearby-device access can operate a supported lock without continuous precise location tracking.',
        'The gym remains responsible for its premises and needs an alternative process when hardware or connectivity fails.',
        'Access logs help support and security, but estimated traffic is not a safety-critical occupancy counter.'
      ],
      sections: [
        {
          heading: 'The five parts of a mobile gym entry',
          paragraphs: ['A reliable entry flow connects the member account, an active membership or pass, the app session, a supported access provider and the physical door. When the member requests entry, the system checks the entitlement and sends the minimum technical instruction needed to the configured lock.'],
          bullets: [
            'Identity: the app must know which verified account is requesting entry.',
            'Entitlement: the membership, pass, gym and validity period must match.',
            'Device communication: Bluetooth, nearby-device access or an internet request reaches the supported controller.',
            'Physical action: the lock or access controller decides whether the door can release.',
            'Audit event: time, gym, lock, result and relevant error information are recorded for support and security.'
          ]
        },
        {
          heading: 'What the phone permission does',
          paragraphs: ['Modern operating systems may describe Bluetooth or nearby-device permission as sensitive. Its purpose in this flow is to communicate with supported door hardware. A well-designed gym-access app does not need continuous precise GPS tracking merely to unlock a nearby door.', 'Members should still read the permission prompt and can change permissions in device settings. Turning the permission off may prevent mobile entry from working.']
        },
        {
          heading: 'Security responsibilities are shared',
          paragraphs: ['The platform should protect sessions, limit service credentials and prevent one member from using another member’s entitlement. Members should protect their email, login links and unlocked phone and must not lend a personal e-key. The gym controls the building, lock installation, emergency exits, staff procedures and who should have access.', 'No access technology removes the need for physical security. A phone key is one control within a larger system.']
        },
        {
          heading: 'Plan for the failure before installation',
          paragraphs: ['Phones run out of battery, mobile data drops, Bluetooth can be disabled, cloud providers can have an incident and a lock battery or controller can fail. A gym should document who members contact, how staff verify an active membership and which lawful alternative entry method is available.', 'Never force a door or bypass a lock. If an exit or another safety system is affected, follow the gym’s emergency procedure and local emergency guidance rather than waiting for an app response.'],
          bullets: ['Display a support route at the entrance.', 'Test the fallback regularly, including outside staffed hours.', 'Keep lock ownership and emergency procedures with the gym.', 'Retain technical logs only for a defined support, security and legal period.']
        },
        {
          heading: 'How Fitliner approaches the flow',
          paragraphs: ['Fitliner can connect a verified account and valid gym entitlement to supported smart-lock access. Technical unlock events help diagnose a failed attempt and protect against misuse. The app can also show traffic estimates based on available access activity.', 'Traffic estimates can omit people, include delayed events or differ from actual occupancy. They are useful for choosing a quieter training time, not for fire-code or safety-critical capacity decisions.']
        }
      ],
      relatedProduct: {label: 'Explore Fitliner gym access', href: '/en'}
    },
    'gym-management-software-checklist': {
      slug: 'gym-management-software-checklist',
      eyebrow: 'Guide for gym owners',
      title: 'How to choose gym management software: a practical evaluation checklist',
      description: 'Evaluate access control, memberships, payments, member experience, privacy, migration, support and total cost before choosing a gym platform.',
      intro: 'Gym software affects the front door, revenue collection and the daily experience of every member. A polished demo is not enough. The safest selection process starts with your real member journeys, tests the failure cases and makes ownership of data, payments and hardware explicit before signing.',
      readingTime: '9 min read',
      takeaways: [
        'Write down the real operating journeys before comparing feature lists.',
        'Test door, payment and membership failures—not only the happy path.',
        'Confirm who is the seller, who controls member data and how you can export it.',
        'Pilot one location or entrance with measurable success criteria before a full migration.'
      ],
      sections: [
        {
          heading: '1. Start with workflows, not vendor terminology',
          paragraphs: ['List what happens when a new member buys online, arrives for the first time, renews, misses a payment, changes phone, requests a refund, brings a guest or cancels. Add the staff workflows for granting access, correcting a membership and handling a locked door.', 'A system fits when it reduces manual handoffs across those journeys. A long feature list can still leave staff copying data between screens.']
        },
        {
          heading: '2. Evaluate access as a physical system',
          paragraphs: ['Ask which locks and controllers are supported, who installs and owns them, what happens without internet and what evidence is available after a failed entry. Confirm opening hours, anti-passback or guest rules if you need them and the alternative entry process during an outage.'],
          bullets: ['Can an entitlement be revoked promptly?', 'Are access events attributable and protected from ordinary staff edits?', 'Who replaces lock batteries and supports physical hardware?', 'Is the member experience clear on both iOS and Android?']
        },
        {
          heading: '3. Trace the money and membership state',
          paragraphs: ['The checkout should identify the seller or merchant of record, recurring price, tax handling, cancellation method and refund support. The membership state should respond predictably to successful payment, cancellation, refund, dispute and failed renewal.', 'Ask whether the platform takes a fee, whether payouts go directly to your connected account and which records are available for accounting. Never assume that deleting an app account automatically cancels an externally managed subscription.']
        },
        {
          heading: '4. Check data control, privacy and portability',
          paragraphs: ['Map which party controls member, access, message and payment data. Request the data-processing agreement, subprocessor list, international-transfer safeguards, retention periods and incident process. Confirm that health-revealing or public profile fields are not exposed by default.', 'You should be able to export the operational data you are entitled to keep and fulfil access, correction and deletion requests without relying on an informal support promise.']
        },
        {
          heading: '5. Compare total cost and migration risk',
          paragraphs: ['Include setup, hardware, payment fees, platform fees, support, contract minimums, replacement devices, staff time and the cost of running two systems during migration. Ask what happens to hardware and data when the agreement ends.', 'A small pilot is more informative than another presentation. Define success before the pilot: entry success rate, staff time saved, completed online purchases, member support volume and a tested outage procedure.']
        },
        {
          heading: 'Questions to take into every vendor call',
          paragraphs: [],
          bullets: ['Show us a failed-payment and failed-door scenario live.', 'Who is legally the seller for each product and who handles refunds?', 'Which member data can be public, and what are the defaults?', 'How do we export data and remove access at contract end?', 'Which support response is contractual and which is only a target?', 'Which product commitments depend on a third-party provider?']
        }
      ],
      relatedProduct: {label: 'Evaluate Fitliner for your gym', href: '/en/gyms'}
    },
    'health-report-timeline': {
      slug: 'health-report-timeline',
      eyebrow: 'Fitliner Health guide',
      title: 'How to build a useful health-report timeline without losing the original context',
      description: 'Organize laboratory and diagnostic-scale reports over time, verify extracted values and keep the original report and professional advice authoritative.',
      intro: 'A timeline can make scattered reports easier to compare, but it does not turn an app into a doctor. Useful tracking begins with accurate source documents, careful review of every extracted value and respect for the units, reference interval and clinical context shown by the original laboratory.',
      readingTime: '8 min read',
      takeaways: [
        'Keep the original report; an extracted value or chart is only a convenience copy.',
        'Verify value, unit, date and reference interval before saving.',
        'A trend can be useful context but does not diagnose a condition or explain its cause.',
        'Discuss abnormal results, symptoms, medication and major health decisions with a qualified professional.'
      ],
      sections: [
        {
          heading: 'Prepare the source before upload',
          paragraphs: ['Use a complete, readable PDF or photograph with the measurement, unit, report date and reference interval visible. Avoid glare, cropped columns and overlapping pages. If the system does not need a patient identifier, redact names, addresses or identification numbers before upload.', 'Upload only a report you are entitled to use. A shared family device or forwarded document does not automatically give authority to process another person’s health information.']
        },
        {
          heading: 'Review extraction like a transcription',
          paragraphs: ['Automated extraction can misread decimals, units, dates or row labels. Treat the result as a draft transcription. Compare each field with the source before confirmation, especially where a comma and decimal point have different meanings across languages.', 'If a report uses a different unit or laboratory method, two numbers may not be directly comparable. Do not silently change the source to make a chart look continuous.']
        },
        {
          heading: 'Keep context attached to the number',
          paragraphs: ['A useful record includes the date, source, unit and laboratory reference interval. Reference ranges can vary by laboratory, method, age and individual circumstances. A flag in one report does not by itself explain the cause or the appropriate response.', 'Diagnostic-scale measurements are also estimates influenced by device method, hydration, timing and conditions. Consistent measurement conditions can improve comparability, but they do not make the result medically definitive.']
        },
        {
          heading: 'Use trends for better questions, not self-diagnosis',
          paragraphs: ['A timeline can help you notice which reports to discuss and prepare a clearer appointment. It should not be used to start or stop medication, ignore symptoms or delay care. AI-generated summaries can be incomplete or confidently wrong, even when they sound plausible.', 'Seek qualified medical advice for abnormal results, pregnancy, medication, symptoms or a significant diet or exercise change. For urgent symptoms, call the local emergency number; Fitliner does not monitor emergencies.']
        },
        {
          heading: 'Protect a sensitive long-term record',
          paragraphs: ['Health history is sensitive. Use a protected email account and device, review who can see a profile or shared feature and withdraw optional consent when you no longer want health-dependent processing. Deleting an import should remove the source and derived records according to the service’s stated retention and legal obligations.', 'Before using any health timeline, read the privacy notice for the controller, processors, international transfers, retention, account deletion and the way AI providers handle submitted data.']
        },
        {
          heading: 'What Fitliner Health is designed to do',
          paragraphs: ['Fitliner Health can extract structured measurements from an uploaded report, let you review them before confirmation and display confirmed metrics over time. It may provide contextual summaries and recommendations with explicit limitations.', 'The original report and advice of a qualified healthcare professional remain authoritative. Fitliner Health is not intended to diagnose, treat, cure, monitor or prevent disease and is not an emergency service.']
        }
      ],
      relatedProduct: {label: 'See how Fitliner Health works', href: '/en/health'}
    }
  },
  sk: {
    'phone-gym-access': {
      slug: 'phone-gym-access',
      eyebrow: 'Návod k vstupu do fitka',
      title: 'Ako funguje vstup do fitka cez telefón — a čo sa stane pri výpadku',
      description: 'Praktické vysvetlenie mobilného kľúča, oprávnení, smart zámkov, bezpečnostných záznamov a záložného postupu.',
      intro: 'Telefón dokáže nahradiť plastovú kartu iba vtedy, keď sa členský systém, aplikácia a fyzický zámok zhodnú, že konkrétna osoba môže vstúpiť. Dôležité preto nie je len tlačidlo „otvoriť“, ale celý proces oprávnenia, bezpečnosti, súkromia a riešenia porúch.',
      readingTime: '7 min čítania',
      takeaways: ['Mobilný kľúč je časovo obmedzené oprávnenie, nie iba tlačidlo.', 'Bluetooth alebo nearby-device prístup môže obslúžiť podporovaný zámok bez neustáleho presného GPS sledovania.', 'Za priestory a záložný vstup pri poruche zodpovedá fitko.', 'Záznamy pomáhajú podpore, ale odhad návštevnosti nie je bezpečnostné počítadlo osôb.'],
      sections: [
        {heading: 'Päť častí mobilného vstupu', paragraphs: ['Spoľahlivý vstup prepája účet člena, aktívne členstvo alebo vstup, prihlásenie v aplikácii, podporovaného access providera a fyzické dvere. Pri pokuse o otvorenie systém overí oprávnenie a pošle zámku iba technický pokyn potrebný na vykonanie vstupu.'], bullets: ['Identita: systém musí vedieť, ktorý overený účet žiada o vstup.', 'Oprávnenie: členstvo, gym, typ vstupu a platnosť sa musia zhodovať.', 'Komunikácia: Bluetooth, nearby devices alebo internetový request dosiahne podporovaný kontrolér.', 'Fyzická akcia: zámok alebo kontrolér rozhodne, či dvere uvoľní.', 'Audit: čas, gym, zámok, výsledok a relevantná chyba pomáhajú podpore a bezpečnosti.']},
        {heading: 'Na čo slúži oprávnenie telefónu', paragraphs: ['Operačný systém môže Bluetooth alebo nearby-device oprávnenie označiť ako citlivé. V tomto flowe slúži na komunikáciu s podporovaným hardvérom pri dverách. Samotné otvorenie blízkych dverí nepotrebuje nepretržité presné GPS sledovanie.', 'Člen môže oprávnenie zmeniť v nastaveniach zariadenia, no po jeho vypnutí nemusí mobilný vstup fungovať.']},
        {heading: 'Bezpečnosť je spoločná zodpovednosť', paragraphs: ['Platforma má chrániť sessions, servisné credentials a cudzie oprávnenia. Člen má chrániť email, prihlasovacie odkazy a odomknutý telefón a nesmie požičiavať osobný e-key. Gym zodpovedá za budovu, montáž zámku, núdzové východy, personál a pravidlá vstupu.', 'Žiadna access technológia nenahrádza fyzickú bezpečnosť. Mobilný kľúč je iba jedna vrstva.']},
        {heading: 'Záložný postup navrhnite pred montážou', paragraphs: ['Telefón sa môže vybiť, mobilné dáta alebo Bluetooth vypadnúť, cloud môže mať incident a batéria zámku sa môže pokaziť. Gym má vopred určiť kontakt, spôsob overenia členstva a zákonnú alternatívu vstupu.', 'Dvere nikdy nevynucujte ani neobchádzajte zámok. Pri ohrození použite núdzový postup fitka a miestne tiesňové číslo, nie podporu aplikácie.'], bullets: ['Viditeľne uveďte support kontakt pri vstupe.', 'Záložný postup pravidelne testujte aj mimo hodín recepcie.', 'Vlastníctvo hardvéru a núdzové procesy ponechajte jasne na strane gymu.', 'Logy uchovávajte iba počas definovanej support, bezpečnostnej a zákonnej doby.']},
        {heading: 'Ako k tomu pristupuje Fitliner', paragraphs: ['Fitliner môže prepojiť overený účet a platné oprávnenie s podporovaným smart zámkom. Technické udalosti pomáhajú vysvetliť zlyhaný pokus a chrániť systém pred zneužitím. Aplikácia môže z dostupnej aktivity zobrazovať odhad návštevnosti.', 'Odhad môže vynechať ľudí, obsahovať oneskorené udalosti alebo sa líšiť od skutočnej obsadenosti. Slúži na výber pokojnejšieho času, nie na bezpečnostné rozhodovanie.']}
      ],
      relatedProduct: {label: 'Pozrieť vstup cez Fitliner', href: '/sk'}
    },
    'gym-management-software-checklist': {
      slug: 'gym-management-software-checklist',
      eyebrow: 'Návod pre majiteľov fitiek',
      title: 'Ako vybrať systém pre fitnesscentrum: praktický checklist',
      description: 'Porovnajte vstup, členstvá, platby, členský zážitok, súkromie, migráciu, podporu a celkové náklady.',
      intro: 'Systém pre fitko ovplyvňuje vchod, inkaso aj každodenný zážitok člena. Pekná prezentácia nestačí. Bezpečný výber začína reálnymi používateľskými scenármi, testom porúch a jasnou odpoveďou, kto vlastní dáta, platby a hardvér.',
      readingTime: '9 min čítania',
      takeaways: ['Pred porovnaním funkcií spíšte reálne prevádzkové scenáre.', 'Otestujte zlyhanie dverí, platby aj členstva, nielen ideálny priebeh.', 'Potvrďte rolu predajcu, správcu dát a možnosť exportu.', 'Pred úplnou migráciou spustite pilot s merateľnými cieľmi.'],
      sections: [
        {heading: '1. Začnite procesmi, nie názvami funkcií', paragraphs: ['Spíšte, čo sa stane pri online nákupe nového člena, prvom vstupe, obnove, nezaplatenej platbe, zmene telefónu, refunde, hosťovskom vstupe a zrušení. Pridajte procesy zamestnanca pri oprave členstva alebo nefunkčných dverách.', 'Systém je vhodný vtedy, keď znižuje ručné prepisovanie a odovzdávanie úloh medzi týmito scenármi.']},
        {heading: '2. Vstup hodnotte ako fyzický systém', paragraphs: ['Pýtajte sa na podporované zámky, montáž, vlastníctvo, fungovanie bez internetu a dôkazy pri zlyhanom pokuse. Potvrďte otváracie hodiny, pravidlá hostí a alternatívny vstup pri výpadku.'], bullets: ['Dá sa oprávnenie rýchlo odobrať?', 'Sú logy priraditeľné a chránené pred bežnou editáciou?', 'Kto mení batérie a podporuje fyzický hardvér?', 'Je flow jasný na iOS aj Androide?']},
        {heading: '3. Sledujte peniaze aj stav členstva', paragraphs: ['Checkout má pomenovať predajcu alebo merchant of record, opakovanú cenu, dane, zrušenie a refund support. Členstvo má predvídateľne reagovať na platbu, zrušenie, refund, spor aj neúspešnú obnovu.', 'Overte platformový poplatok, spôsob payoutov a dostupné účtovné záznamy. Vymazanie app účtu automaticky neruší externé predplatné.']},
        {heading: '4. Skontrolujte dáta, súkromie a prenositeľnosť', paragraphs: ['Zmapujte, kto riadi členské, vstupné, správové a platobné dáta. Vyžiadajte DPA, zoznam subprocessorov, transfer safeguards, retention a incident proces. Citlivé alebo zdravotné polia nemajú byť verejné predvolene.', 'Musíte vedieť exportovať oprávnené prevádzkové dáta a vybaviť prístup, opravu či vymazanie bez neformálneho prísľubu podpory.']},
        {heading: '5. Porovnajte celkové náklady a migráciu', paragraphs: ['Zahrňte setup, hardvér, platobné a platformové poplatky, support, minimum kontraktu, výmeny zariadení, čas tímu a dočasnú prevádzku dvoch systémov. Zistite, čo sa stane s dátami a hardvérom po skončení.', 'Pilot jednej lokality alebo vstupu povie viac než ďalšia prezentácia. Vopred určte mieru úspešných vstupov, ušetrený čas, online nákupy, počet support prípadov a otestovaný outage postup.']},
        {heading: 'Otázky pre každého dodávateľa', paragraphs: [], bullets: ['Ukážte naživo zlyhanú platbu aj zlyhané dvere.', 'Kto je predajca produktu a kto rieši refund?', 'Ktoré dáta môžu byť verejné a aké sú defaulty?', 'Ako exportujeme dáta a odoberieme prístup po skončení?', 'Ktorý support čas je zmluvný a ktorý iba cieľ?', 'Ktoré záväzky závisia od tretej strany?']}
      ],
      relatedProduct: {label: 'Posúdiť Fitliner pre vaše fitko', href: '/sk/gyms'}
    },
    'health-report-timeline': {
      slug: 'health-report-timeline',
      eyebrow: 'Návod k Fitliner Health',
      title: 'Ako vytvoriť užitočný prehľad zdravotných výsledkov bez straty kontextu',
      description: 'Usporiadajte laboratórne reporty a výsledky diagnostickej váhy, overte rozpoznané hodnoty a zachovajte autoritu originálu.',
      intro: 'Časová os dokáže sprehľadniť roztrúsené reporty, ale z aplikácie nerobí lekára. Užitočné sledovanie začína kvalitným zdrojom, kontrolou každej rozpoznanej hodnoty a rešpektovaním jednotiek, referenčného intervalu a klinického kontextu originálneho laboratória.',
      readingTime: '8 min čítania',
      takeaways: ['Originálny report si ponechajte; extrahovaná hodnota alebo graf je iba pracovná kópia.', 'Pred uložením overte hodnotu, jednotku, dátum a referenčný interval.', 'Trend môže byť užitočný kontext, no neurčuje diagnózu ani príčinu.', 'Abnormálne výsledky, symptómy, lieky a zásadné rozhodnutia konzultujte s odborníkom.'],
      sections: [
        {heading: 'Pripravte kvalitný zdroj', paragraphs: ['Použite úplný a čitateľný PDF alebo fotografiu, na ktorej vidno hodnotu, jednotku, dátum a referenčný interval. Vyhnite sa odleskom, odrezaným stĺpcom a prekrývajúcim sa stranám. Nepotrebné meno, adresu či identifikátor pred uploadom začiernite.', 'Nahrávajte iba report, ktorý ste oprávnení použiť. Rodinné zariadenie alebo preposlaný súbor automaticky neznamená oprávnenie spracovať zdravotné údaje inej osoby.']},
        {heading: 'Extrakciu kontrolujte ako prepis', paragraphs: ['Automatizácia môže zle prečítať desatinné miesto, jednotku, dátum alebo názov riadku. Výsledok berte ako draft prepisu a pred potvrdením porovnajte každé pole s originálom.', 'Pri inej jednotke alebo laboratórnej metóde nemusia byť dve čísla priamo porovnateľné. Zdroj neupravujte len preto, aby graf vyzeral plynulo.']},
        {heading: 'K číslu ponechajte kontext', paragraphs: ['Užitočný záznam obsahuje dátum, zdroj, jednotku a referenčný interval laboratória. Rozsahy sa môžu líšiť podľa laboratória, metódy, veku a osobných okolností. Označenie mimo rozsahu samo nevysvetľuje príčinu ani správny postup.', 'Výsledky diagnostickej váhy sú tiež odhady ovplyvnené metódou, hydratáciou, časom a podmienkami. Rovnaké podmienky zlepšia porovnateľnosť, nie medicínsku definitívnosť.']},
        {heading: 'Trend používajte na lepšie otázky, nie samodiagnostiku', paragraphs: ['Časová os môže ukázať, čo chcete prediskutovať, a pripraviť lepšiu konzultáciu. Nemá slúžiť na začatie alebo vysadenie liekov, ignorovanie symptómov či odklad starostlivosti. AI zhrnutie môže byť neúplné alebo presvedčivo nesprávne.', 'Abnormálne výsledky, tehotenstvo, lieky, symptómy a zásadnú zmenu stravy či tréningu riešte s kvalifikovaným odborníkom. Pri urgentných príznakoch volajte miestne tiesňové číslo; Fitliner nemonitoruje núdzové situácie.']},
        {heading: 'Chráňte citlivý dlhodobý záznam', paragraphs: ['Zdravotná história je citlivá. Chráňte email a zariadenie, kontrolujte viditeľnosť profilu a odvolajte voliteľný súhlas, keď už nechcete health-dependent spracovanie. Vymazanie importu sa má riadiť zverejnenou retention a zákonnými povinnosťami.', 'Pred použitím si prečítajte identitu controllera, processorov, transfery, retention, vymazanie účtu a spôsob, akým AI provider spracúva odoslané dáta.']},
        {heading: 'Na čo je navrhnutý Fitliner Health', paragraphs: ['Fitliner Health môže z reportu extrahovať štruktúrované merania, umožniť ich kontrolu a zobraziť potvrdené metriky v čase. Môže poskytnúť kontextové zhrnutia a odporúčania s jasnými obmedzeniami.', 'Autoritatívny ostáva originálny report a rada kvalifikovaného zdravotníka. Fitliner Health nie je určený na diagnostiku, liečbu, vyliečenie, monitorovanie alebo prevenciu choroby a nie je núdzová služba.']}
      ],
      relatedProduct: {label: 'Pozrieť, ako funguje Fitliner Health', href: '/sk/health'}
    }
  }
};

export function isGuideLocale(value: string): value is GuideLocale {
  return GUIDE_LOCALES.includes(value as GuideLocale);
}

export function isGuideSlug(value: string): value is GuideSlug {
  return GUIDE_SLUGS.includes(value as GuideSlug);
}
