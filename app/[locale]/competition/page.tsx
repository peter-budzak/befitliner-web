

type Locale = 'en' | 'sk' | 'de' | 'fr' | 'es' | 'zh-hans';

type CompetitionCopy = {
  badge: string;
  title: string;
  intro: string;
  organizerTitle: string;
  organizerBody: string;
  prizeTitle: string;
  prizeBody: string;
  entryTitle: string;
  entryItems: string[];
  drawTitle: string;
  drawItems: string[];
  termsTitle: string;
  termsItems: string[];
  contactTitle: string;
  contactBody: string;
};

const copyByLocale: Record<Locale, CompetitionCopy> = {
  en: {
    badge: 'BeFitliner Competition',
    title: 'Competition rules',
    intro:
      'These rules apply to the BeFitliner Diamond Club competition shown inside the Fitliner app.',
    organizerTitle: 'Organizer',
    organizerBody:
      'The organizer of the competition is BeFitliner. Additional details can be provided by the organizer if needed.',
    prizeTitle: 'Prize',
    prizeBody:
      'The prize is 1 yearly gym membership in a selected participating gym, exactly as shown in the Fitliner app.',
    entryTitle: 'How to enter',
    entryItems: [
      '100 diamonds = 1 competition entry.',
      'A user can collect multiple entries by redeeming more diamonds.',
      'Only entries successfully confirmed in the app count as valid entries.',
    ],
    drawTitle: 'Draw and winner selection',
    drawItems: [
      'The draw will take place on 31.07.2026.',
      'One winner will be selected from all valid entries.',
      'The winner may be contacted using the contact details connected to their account.',
    ],
    termsTitle: 'Important conditions',
    termsItems: [
      'The organizer reserves the right to verify the validity of entries.',
      'Fraudulent or abusive behavior may lead to disqualification.',
      'If the winner cannot be contacted or does not respond in time, the organizer may select another winner.',
      'The organizer reserves the right to modify, pause, or cancel the competition if necessary.',
    ],
    contactTitle: 'Questions',
    contactBody:
      'If you have questions about the competition, please contact support through the Fitliner app or by email at peter@peterbudzak.com.',
  },
  sk: {
    badge: 'BeFitliner Súťaž',
    title: 'Pravidlá súťaže',
    intro:
      'Tieto pravidlá sa vzťahujú na súťaž BeFitliner Diamond Club zobrazenú v aplikácii Fitliner.',
    organizerTitle: 'Organizátor',
    organizerBody:
      'Organizátorom súťaže je BeFitliner. V prípade potreby môže organizátor poskytnúť doplňujúce informácie.',
    prizeTitle: 'Výhra',
    prizeBody:
      'Výhrou je 1 ročná permanentka do vybraného zapojeného gymu, presne tak ako je uvedené v aplikácii Fitliner.',
    entryTitle: 'Ako sa zapojiť',
    entryItems: [
      '100 diamantov = 1 vstup do súťaže.',
      'Používateľ môže získať viac vstupov výmenou väčšieho počtu diamantov.',
      'Ako platné sa počítajú len vstupy úspešne potvrdené v aplikácii.',
    ],
    drawTitle: 'Žrebovanie a výber výhercu',
    drawItems: [
      'Žrebovanie prebehne 31.07.2026.',
      'Jeden výherca bude vybraný zo všetkých platných vstupov.',
      'Výherca môže byť kontaktovaný cez kontaktné údaje priradené k jeho účtu.',
    ],
    termsTitle: 'Dôležité podmienky',
    termsItems: [
      'Organizátor si vyhradzuje právo overiť platnosť vstupov.',
      'Podvodné alebo zneužívajúce správanie môže viesť k diskvalifikácii.',
      'Ak sa výhercu nepodarí kontaktovať alebo neodpovie včas, organizátor môže vybrať náhradného výhercu.',
      'Organizátor si vyhradzuje právo súťaž upraviť, pozastaviť alebo zrušiť, ak to bude potrebné.',
    ],
    contactTitle: 'Otázky',
    contactBody:
      'Ak máte otázky k súťaži, kontaktujte podporu cez aplikáciu Fitliner alebo emailom na peter@peterbudzak.com.',
  },
  de: {
    badge: 'BeFitliner Gewinnspiel',
    title: 'Teilnahmebedingungen',
    intro:
      'Diese Regeln gelten für das im Fitliner App angezeigte BeFitliner Diamond Club Gewinnspiel.',
    organizerTitle: 'Veranstalter',
    organizerBody:
      'Veranstalter des Gewinnspiels ist BeFitliner. Bei Bedarf kann der Veranstalter zusätzliche Informationen bereitstellen.',
    prizeTitle: 'Preis',
    prizeBody:
      'Der Preis ist eine Jahresmitgliedschaft in einem ausgewählten teilnehmenden Fitnessstudio, genau wie in der Fitliner App angegeben.',
    entryTitle: 'So nimmst du teil',
    entryItems: [
      '100 Diamanten = 1 Gewinnspiel-Eintrag.',
      'Ein Nutzer kann mehrere Einträge durch das Einlösen weiterer Diamanten erhalten.',
      'Nur Einträge, die in der App erfolgreich bestätigt wurden, gelten als gültig.',
    ],
    drawTitle: 'Auslosung und Auswahl des Gewinners',
    drawItems: [
      'Die Auslosung findet am 31.07.2026 statt.',
      'Ein Gewinner wird aus allen gültigen Einträgen ausgewählt.',
      'Der Gewinner kann über die mit dem Konto verbundenen Kontaktdaten kontaktiert werden.',
    ],
    termsTitle: 'Wichtige Bedingungen',
    termsItems: [
      'Der Veranstalter behält sich das Recht vor, die Gültigkeit der Einträge zu überprüfen.',
      'Betrügerisches oder missbräuchliches Verhalten kann zur Disqualifikation führen.',
      'Wenn der Gewinner nicht kontaktiert werden kann oder nicht rechtzeitig antwortet, kann der Veranstalter einen Ersatzgewinner auswählen.',
      'Der Veranstalter behält sich das Recht vor, das Gewinnspiel bei Bedarf zu ändern, auszusetzen oder zu beenden.',
    ],
    contactTitle: 'Fragen',
    contactBody:
      'Bei Fragen zum Gewinnspiel kontaktiere bitte den Support über die Fitliner App oder per E-Mail an peter@peterbudzak.com.',
  },
  fr: {
    badge: 'Concours BeFitliner',
    title: 'Règlement du concours',
    intro:
      'Ces règles s’appliquent au concours BeFitliner Diamond Club affiché dans l’application Fitliner.',
    organizerTitle: 'Organisateur',
    organizerBody:
      'L’organisateur du concours est BeFitliner. Des informations complémentaires peuvent être fournies par l’organisateur si nécessaire.',
    prizeTitle: 'Prix',
    prizeBody:
      'Le prix est un abonnement annuel à une salle participante sélectionnée, exactement comme indiqué dans l’application Fitliner.',
    entryTitle: 'Comment participer',
    entryItems: [
      '100 diamants = 1 participation au concours.',
      'Un utilisateur peut obtenir plusieurs participations en échangeant davantage de diamants.',
      'Seules les participations confirmées avec succès dans l’application sont valides.',
    ],
    drawTitle: 'Tirage au sort et sélection du gagnant',
    drawItems: [
      'Le tirage au sort aura lieu le 31.07.2026.',
      'Un gagnant sera sélectionné parmi toutes les participations valides.',
      'Le gagnant pourra être contacté via les coordonnées associées à son compte.',
    ],
    termsTitle: 'Conditions importantes',
    termsItems: [
      'L’organisateur se réserve le droit de vérifier la validité des participations.',
      'Tout comportement frauduleux ou abusif peut entraîner une disqualification.',
      'Si le gagnant ne peut pas être contacté ou ne répond pas à temps, l’organisateur peut sélectionner un autre gagnant.',
      'L’organisateur se réserve le droit de modifier, suspendre ou annuler le concours si nécessaire.',
    ],
    contactTitle: 'Questions',
    contactBody:
      'Si vous avez des questions concernant le concours, contactez le support via l’application Fitliner ou par e-mail à peter@peterbudzak.com.',
  },
  es: {
    badge: 'Concurso BeFitliner',
    title: 'Reglas del concurso',
    intro:
      'Estas reglas se aplican al concurso BeFitliner Diamond Club mostrado dentro de la app Fitliner.',
    organizerTitle: 'Organizador',
    organizerBody:
      'El organizador del concurso es BeFitliner. El organizador puede proporcionar información adicional si es necesario.',
    prizeTitle: 'Premio',
    prizeBody:
      'El premio es una membresía anual en un gimnasio participante seleccionado, exactamente como se muestra en la app Fitliner.',
    entryTitle: 'Cómo participar',
    entryItems: [
      '100 diamantes = 1 participación en el concurso.',
      'Un usuario puede conseguir varias participaciones canjeando más diamantes.',
      'Solo cuentan como válidas las participaciones confirmadas correctamente en la app.',
    ],
    drawTitle: 'Sorteo y selección del ganador',
    drawItems: [
      'El sorteo tendrá lugar el 31.07.2026.',
      'Se seleccionará un ganador entre todas las participaciones válidas.',
      'Se podrá contactar al ganador mediante los datos de contacto asociados a su cuenta.',
    ],
    termsTitle: 'Condiciones importantes',
    termsItems: [
      'El organizador se reserva el derecho de verificar la validez de las participaciones.',
      'El comportamiento fraudulento o abusivo puede dar lugar a descalificación.',
      'Si no es posible contactar con el ganador o no responde a tiempo, el organizador puede seleccionar a otro ganador.',
      'El organizador se reserva el derecho de modificar, pausar o cancelar el concurso si fuera necesario.',
    ],
    contactTitle: 'Preguntas',
    contactBody:
      'Si tienes preguntas sobre el concurso, contacta con soporte a través de la app Fitliner o por correo electrónico en peter@peterbudzak.com.',
  },
  'zh-hans': {
    badge: 'BeFitliner 活动',
    title: '活动规则',
    intro:
      '以下规则适用于 Fitliner 应用内显示的 BeFitliner Diamond Club 活动。',
    organizerTitle: '主办方',
    organizerBody:
      '本次活动的主办方为 BeFitliner。如有需要，主办方可提供更多补充信息。',
    prizeTitle: '奖品',
    prizeBody:
      '奖品为指定参与健身房的一年会员资格，具体以 Fitliner 应用中的说明为准。',
    entryTitle: '参与方式',
    entryItems: [
      '100 颗钻石 = 1 次抽奖资格。',
      '用户可通过兑换更多钻石获得多次参与资格。',
      '只有在应用中成功确认的参与记录才算有效。',
    ],
    drawTitle: '抽奖与获奖者选择',
    drawItems: [
      '抽奖将于 31.07.2026 进行。',
      '将从所有有效参与记录中选出 1 名获奖者。',
      '获奖者可能会通过其账户绑定的联系方式被联系。',
    ],
    termsTitle: '重要条件',
    termsItems: [
      '主办方有权核实参与记录的有效性。',
      '欺诈或滥用行为可能导致取消资格。',
      '如果无法联系到获奖者或获奖者未及时回复，主办方可重新选择其他获奖者。',
      '如有必要，主办方保留修改、暂停或取消活动的权利。',
    ],
    contactTitle: '问题咨询',
    contactBody:
      '如对活动有任何疑问，请通过 Fitliner 应用联系支持团队，或发送邮件至 peter@peterbudzak.com。',
  },
};

function getCopy(locale: string): CompetitionCopy {
  const normalized = locale.toLowerCase();
  return copyByLocale[(normalized as Locale)] ?? copyByLocale.en;
}

export default async function CompetitionPage({
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
            <h2 className="text-xl font-semibold">{copy.organizerTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.organizerBody}
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">{copy.prizeTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.prizeBody}
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">{copy.entryTitle}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.entryItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">{copy.drawTitle}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.drawItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">{copy.termsTitle}</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.termsItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">{copy.contactTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.contactBody}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}