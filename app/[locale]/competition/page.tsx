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
  platformTitle: string;
  platformBody: string;
  contactTitle: string;
  contactBody: string;
};

const copyByLocale: Record<Locale, CompetitionCopy> = {
  en: {
    badge: 'Fitliner Official Rules',
    title: 'Official contest rules',
    intro:
      'These official rules apply to the Fitliner Diamond Club reward draw shown inside the Fitliner app.',
    organizerTitle: 'Organizer',
    organizerBody:
      'The organizer of the promotion is Fitliner (Globalio LLC).',
    prizeTitle: 'Prize',
    prizeBody:
      'The prize is 1 yearly gym membership in a selected participating gym, exactly as shown in the Fitliner app.',
    entryTitle: 'How to participate',
    entryItems: [
      '100 diamonds = 1 valid entry.',
      'Users may collect multiple entries by redeeming more diamonds inside the app.',
      'Only entries successfully confirmed in the app count as valid entries.',
      'No purchase is necessary to participate.',
      'Diamonds are earned through in-app activity and cannot be purchased.',
    ],
    drawTitle: 'Draw and winner selection',
    drawItems: [
      'The draw will take place on 31.07.2026.',
      'One winner will be selected randomly from all valid entries.',
      'The winner may be contacted using the contact details connected to their account.',
    ],
    termsTitle: 'Important conditions',
    termsItems: [
      'Participants must comply with the Fitliner app rules and the competition rules shown in the app.',
      'The organizer reserves the right to verify the validity of entries.',
      'Fraudulent or abusive behavior may lead to disqualification.',
      'If the winner cannot be contacted or does not respond in time, the organizer may select another winner.',
      'The organizer reserves the right to modify, pause, or cancel the competition if necessary or where required by law.',
      'Void where prohibited by law.',
    ],
    platformTitle: 'Platform disclaimer',
    platformBody:
      'Apple is not a sponsor of this promotion and is not involved in the activity in any manner.',
    contactTitle: 'Questions',
    contactBody:
      'If you have questions about the competition, please contact support through the Fitliner app or by email at support@fitliner.eu.',
  },
  sk: {
    badge: 'Fitliner Oficiálne pravidlá',
    title: 'Oficiálne pravidlá súťaže',
    intro:
      'Tieto oficiálne pravidlá sa vzťahujú na odmeňovacie žrebovanie Fitliner Diamond Club zobrazené v aplikácii Fitliner.',
    organizerTitle: 'Organizátor',
    organizerBody:
      'Organizátorom tejto akcie je Fitliner (Globalio LLC).',
    prizeTitle: 'Výhra',
    prizeBody:
      'Výhrou je 1 ročná permanentka do vybraného zapojeného gymu, presne tak ako je uvedené v aplikácii Fitliner.',
    entryTitle: 'Ako sa zapojiť',
    entryItems: [
      '100 diamantov = 1 platný vstup.',
      'Používateľ môže získať viac vstupov výmenou väčšieho počtu diamantov v aplikácii.',
      'Ako platné sa počítajú len vstupy úspešne potvrdené v aplikácii.',
      'Na účasť nie je potrebný nákup.',
      'Diamanty sa získavajú aktivitou v aplikácii a nie je možné ich zakúpiť.',
    ],
    drawTitle: 'Žrebovanie a výber výhercu',
    drawItems: [
      'Žrebovanie prebehne 31.07.2026.',
      'Jeden výherca bude náhodne vybraný zo všetkých platných vstupov.',
      'Výherca môže byť kontaktovaný cez kontaktné údaje priradené k jeho účtu.',
    ],
    termsTitle: 'Dôležité podmienky',
    termsItems: [
      'Účastník musí dodržiavať pravidlá aplikácie Fitliner a pravidlá súťaže zobrazené v aplikácii.',
      'Organizátor si vyhradzuje právo overiť platnosť vstupov.',
      'Podvodné alebo zneužívajúce správanie môže viesť k diskvalifikácii.',
      'Ak sa výhercu nepodarí kontaktovať alebo neodpovie včas, organizátor môže vybrať náhradného výhercu.',
      'Organizátor si vyhradzuje právo súťaž upraviť, pozastaviť alebo zrušiť, ak to bude potrebné alebo ak to vyžaduje zákon.',
      'Neplatí tam, kde je to zakázané zákonom.',
    ],
    platformTitle: 'Vyhlásenie o platforme',
    platformBody:
      'Apple nie je sponzorom tejto akcie a nijakým spôsobom sa nepodieľa na tejto aktivite.',
    contactTitle: 'Otázky',
    contactBody:
      'Ak máte otázky k súťaži, kontaktujte podporu cez aplikáciu Fitliner alebo emailom na support@fitliner.eu.',
  },
  de: {
    badge: 'Fitliner Offizielle Regeln',
    title: 'Offizielle Teilnahmebedingungen',
    intro:
      'Diese offiziellen Regeln gelten für die im Fitliner App angezeigte Fitliner Diamond Club Belohnungsauslosung.',
    organizerTitle: 'Veranstalter',
    organizerBody:
      'Veranstalter der Aktion ist Fitliner (Globalio LLC).',
    prizeTitle: 'Preis',
    prizeBody:
      'Der Preis ist eine Jahresmitgliedschaft in einem ausgewählten teilnehmenden Fitnessstudio, genau wie in der Fitliner App angegeben.',
    entryTitle: 'So nimmst du teil',
    entryItems: [
      '100 Diamanten = 1 gültiger Eintrag.',
      'Nutzer können mehrere Einträge erhalten, indem sie in der App weitere Diamanten einlösen.',
      'Nur Einträge, die in der App erfolgreich bestätigt wurden, gelten als gültig.',
      'Für die Teilnahme ist kein Kauf erforderlich.',
      'Diamanten werden durch Aktivität in der App verdient und können nicht gekauft werden.',
    ],
    drawTitle: 'Auslosung und Auswahl des Gewinners',
    drawItems: [
      'Die Auslosung findet am 31.07.2026 statt.',
      'Ein Gewinner wird zufällig aus allen gültigen Einträgen ausgewählt.',
      'Der Gewinner kann über die mit dem Konto verbundenen Kontaktdaten kontaktiert werden.',
    ],
    termsTitle: 'Wichtige Bedingungen',
    termsItems: [
      'Teilnehmer müssen die Regeln der Fitliner App und die in der App angezeigten Teilnahmebedingungen einhalten.',
      'Der Veranstalter behält sich das Recht vor, die Gültigkeit der Einträge zu überprüfen.',
      'Betrügerisches oder missbräuchliches Verhalten kann zur Disqualifikation führen.',
      'Wenn der Gewinner nicht kontaktiert werden kann oder nicht rechtzeitig antwortet, kann der Veranstalter einen Ersatzgewinner auswählen.',
      'Der Veranstalter behält sich das Recht vor, die Aktion zu ändern, auszusetzen oder zu beenden, wenn dies erforderlich ist oder gesetzlich verlangt wird.',
      'Ungültig, wo gesetzlich verboten.',
    ],
    platformTitle: 'Plattform-Hinweis',
    platformBody:
      'Apple ist kein Sponsor dieser Aktion und in keiner Weise an ihr beteiligt.',
    contactTitle: 'Fragen',
    contactBody:
      'Bei Fragen zur Aktion kontaktiere bitte den Support über die Fitliner App oder per E-Mail an support@fitliner.eu.',
  },
  fr: {
    badge: 'Fitliner Règles officielles',
    title: 'Règles officielles du concours',
    intro:
      'Ces règles officielles s’appliquent au tirage de récompense Fitliner Diamond Club affiché dans l’application Fitliner.',
    organizerTitle: 'Organisateur',
    organizerBody:
      'L’organisateur de la promotion est Fitliner (Globalio LLC).',
    prizeTitle: 'Prix',
    prizeBody:
      'Le prix est un abonnement annuel à une salle participante sélectionnée, exactement comme indiqué dans l’application Fitliner.',
    entryTitle: 'Comment participer',
    entryItems: [
      '100 diamants = 1 participation valide.',
      'Un utilisateur peut obtenir plusieurs participations en échangeant davantage de diamants dans l’application.',
      'Seules les participations confirmées avec succès dans l’application sont valides.',
      'Aucun achat n’est nécessaire pour participer.',
      'Les diamants sont obtenus via l’activité dans l’application et ne peuvent pas être achetés.',
    ],
    drawTitle: 'Tirage au sort et sélection du gagnant',
    drawItems: [
      'Le tirage au sort aura lieu le 31.07.2026.',
      'Un gagnant sera sélectionné aléatoirement parmi toutes les participations valides.',
      'Le gagnant pourra être contacté via les coordonnées associées à son compte.',
    ],
    termsTitle: 'Conditions importantes',
    termsItems: [
      'Les participants doivent respecter les règles de l’application Fitliner et les règles du concours affichées dans l’application.',
      'L’organisateur se réserve le droit de vérifier la validité des participations.',
      'Tout comportement frauduleux ou abusif peut entraîner une disqualification.',
      'Si le gagnant ne peut pas être contacté ou ne répond pas à temps, l’organisateur peut sélectionner un autre gagnant.',
      'L’organisateur se réserve le droit de modifier, suspendre ou annuler la promotion si nécessaire ou si la loi l’exige.',
      'Nul là où la loi l’interdit.',
    ],
    platformTitle: 'Mention relative à la plateforme',
    platformBody:
      'Apple n’est pas sponsor de cette promotion et n’y participe d’aucune manière.',
    contactTitle: 'Questions',
    contactBody:
      'Si vous avez des questions concernant la promotion, contactez le support via l’application Fitliner ou par e-mail à support@fitliner.eu.',
  },
  es: {
    badge: 'Fitliner Reglas oficiales',
    title: 'Reglas oficiales del concurso',
    intro:
      'Estas reglas oficiales se aplican al sorteo de recompensa Fitliner Diamond Club mostrado dentro de la app Fitliner.',
    organizerTitle: 'Organizador',
    organizerBody:
      'El organizador de la promoción es Fitliner (Globalio LLC).',
    prizeTitle: 'Premio',
    prizeBody:
      'El premio es una membresía anual en un gimnasio participante seleccionado, exactamente como se muestra en la app Fitliner.',
    entryTitle: 'Cómo participar',
    entryItems: [
      '100 diamantes = 1 participación válida.',
      'Un usuario puede conseguir varias participaciones canjeando más diamantes dentro de la app.',
      'Solo cuentan como válidas las participaciones confirmadas correctamente en la app.',
      'No es necesario realizar ninguna compra para participar.',
      'Los diamantes se obtienen mediante actividad en la aplicación y no se pueden comprar.',
    ],
    drawTitle: 'Sorteo y selección del ganador',
    drawItems: [
      'El sorteo tendrá lugar el 31.07.2026.',
      'Se seleccionará aleatoriamente un ganador entre todas las participaciones válidas.',
      'Se podrá contactar al ganador mediante los datos de contacto asociados a su cuenta.',
    ],
    termsTitle: 'Condiciones importantes',
    termsItems: [
      'Los participantes deben cumplir las reglas de la app Fitliner y las reglas del concurso mostradas en la aplicación.',
      'El organizador se reserva el derecho de verificar la validez de las participaciones.',
      'El comportamiento fraudulento o abusivo puede dar lugar a descalificación.',
      'Si no es posible contactar con el ganador o no responde a tiempo, el organizador puede seleccionar a otro ganador.',
      'El organizador se reserva el derecho de modificar, pausar o cancelar la promoción si fuera necesario o si lo exige la ley.',
      'No válido donde la ley lo prohíba.',
    ],
    platformTitle: 'Aviso sobre la plataforma',
    platformBody:
      'Apple no es patrocinador de esta promoción ni participa en ella de ninguna manera.',
    contactTitle: 'Preguntas',
    contactBody:
      'Si tienes preguntas sobre la promoción, contacta con soporte a través de la app Fitliner o por correo electrónico en support@fitliner.eu.',
  },
  'zh-hans': {
    badge: 'Fitliner 官方规则',
    title: '活动官方规则',
    intro:
      '以下官方规则适用于 Fitliner 应用内显示的 Fitliner Diamond Club 奖励抽奖活动。',
    organizerTitle: '主办方',
    organizerBody:
      '本次推广活动的主办方为 Fitliner（Globalio LLC）。',
    prizeTitle: '奖品',
    prizeBody:
      '奖品为指定参与健身房的一年会员资格，具体以 Fitliner 应用中的说明为准。',
    entryTitle: '参与方式',
    entryItems: [
      '100 颗钻石 = 1 次有效参与资格。',
      '用户可在应用内兑换更多钻石以获得多次参与资格。',
      '只有在应用中成功确认的参与记录才算有效。',
      '参与无需购买。',
      '钻石通过应用内活动获得，无法购买。',
    ],
    drawTitle: '抽奖与获奖者选择',
    drawItems: [
      '抽奖将于 31.07.2026 进行。',
      '将从所有有效参与记录中随机选出 1 名获奖者。',
      '获奖者可能会通过其账户绑定的联系方式被联系。',
    ],
    termsTitle: '重要条件',
    termsItems: [
      '参与者必须遵守 Fitliner 应用规则以及应用内显示的活动规则。',
      '主办方有权核实参与记录的有效性。',
      '欺诈或滥用行为可能导致取消资格。',
      '如果无法联系到获奖者或获奖者未及时回复，主办方可重新选择其他获奖者。',
      '如有必要或法律要求，主办方保留修改、暂停或取消本活动的权利。',
      '法律禁止地区无效。',
    ],
    platformTitle: '平台免责声明',
    platformBody:
      'Apple 不是本次推广活动的赞助方，也未以任何方式参与本活动。',
    contactTitle: '问题咨询',
    contactBody:
      '如对本次推广活动有任何疑问，请通过 Fitliner 应用联系支持团队，或发送邮件至 support@fitliner.eu。',
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
            <h2 className="text-xl font-semibold">{copy.platformTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
              {copy.platformBody}
            </p>
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