'use client';

import { useCallback, useEffect, useState } from 'react';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

type FunnelCopy = {
  step: string; saving: string; continue: string; yes: string; no: string;
  configError: string; saveError: string; ownerOnly: string;
  introTitle: string; introBody: string;
  ownerTitle: string; ownerBody: string;
  gymTitle: string; gymBody: string; gymPlaceholder: string; addressPlaceholder: string; searching: string; selected: string;
  operationTitle: string; operationBody: string; receptionTitle: string; receptionHint: string;
  accessTitle: string; turnstile: string; door: string; cards: string; other: string; otherPlaceholder: string; systemTitle: string;
  contactTitle: string; contactBody: string; namePlaceholder: string; phonePlaceholder: string; phoneHint: string;
  resultTitle: string; resultBody: string; reserve: string;
};

const COPY: Record<string, FunnelCopy> = {
  en: {
    step: 'Step', saving: 'Saving…', continue: 'Continue', yes: 'Yes', no: 'No',
    configError: 'The form service is temporarily unavailable.', saveError: 'We could not save your details. Please try again.', ownerOnly: 'This offer is intended for gym owners.',
    introTitle: 'See in 60 seconds whether Fitliner can automate your gym', introBody: 'Watch a short video and learn how Fitliner can connect online payments, automatic memberships and gym access without manual approval.',
    ownerTitle: 'Do you currently operate a gym?', ownerBody: 'This assessment is designed for gym owners and operators.',
    gymTitle: 'Tell us about your gym', gymBody: 'We need the name and address to understand your location and current setup.', gymPlaceholder: 'Gym name', addressPlaceholder: 'Start typing the gym address', searching: 'Searching addresses…', selected: 'Selected Google address',
    operationTitle: 'How does your gym operate today?', operationBody: 'Two short steps remain. Your answers help us adapt the access setup to your operation.', receptionTitle: 'Do you have a reception?', receptionHint: 'This helps us compare fully automated and hybrid access.',
    accessTitle: 'Which entrance type do you use?', turnstile: 'Turnstile', door: 'Electromagnetic door', cards: 'Cards or key fobs', other: 'Other', otherPlaceholder: 'Describe how members enter today', systemTitle: 'Do you already use an access-control system?',
    contactTitle: 'Where should we send your gym assessment?', contactBody: 'We will email the assessment and possible next steps. A phone number is optional and is used only if you want a technical call.', namePlaceholder: 'Full name', phonePlaceholder: 'Phone number (optional)', phoneHint: 'If supplied, a Fitliner specialist may call to discuss access automation options.',
    resultTitle: 'Your gym appears to be a good candidate for Fitliner.', resultBody: 'Watch the final short video and reserve a place in the pilot programme.', reserve: 'Reserve Fitliner for €0'
  },
  sk: {
    step: 'Krok', saving: 'Ukladám…', continue: 'Pokračovať', yes: 'Áno', no: 'Nie',
    configError: 'Služba formulára momentálne nie je dostupná.', saveError: 'Údaje sa nepodarilo uložiť. Skúste pokračovať ešte raz.', ownerOnly: 'Táto ponuka je určená len pre majiteľov fitnesscentier.',
    introTitle: 'Zistite za 60 sekúnd, či môže Fitliner automatizovať vaše fitnesscentrum', introBody: 'Pozrite si krátke video a zistite, ako môže Fitliner prepojiť online platby, automatické členstvá a vstup bez ručného schvaľovania.',
    ownerTitle: 'Prevádzkujete momentálne fitnesscentrum?', ownerBody: 'Toto posúdenie je určené pre majiteľov a prevádzkovateľov fitiek.',
    gymTitle: 'Zadajte vaše fitnesscentrum', gymBody: 'Potrebujeme názov a adresu, aby sme vedeli posúdiť lokalitu a súčasné riešenie.', gymPlaceholder: 'Názov fitnesscentra', addressPlaceholder: 'Začnite písať adresu fitnesscentra', searching: 'Vyhľadávam adresy…', selected: 'Vybraná Google adresa',
    operationTitle: 'Ako dnes funguje vaše fitnesscentrum?', operationBody: 'Zostávajú dva krátke kroky. Odpovede nám pomôžu prispôsobiť vstup vašej prevádzke.', receptionTitle: 'Máte recepciu?', receptionHint: 'Pomôže nám to porovnať plne automatický a hybridný vstup.',
    accessTitle: 'Aký typ vstupu používate?', turnstile: 'Turniket', door: 'Dvere (elektromagnet)', cards: 'Karty alebo čipy', other: 'Iné', otherPlaceholder: 'Napíšte, ako sa dnes vstupuje do fitka', systemTitle: 'Používate už nejaký vstupový systém?',
    contactTitle: 'Kam vám máme poslať výsledok analýzy?', contactBody: 'Emailom pošleme vyhodnotenie a možné ďalšie kroky. Telefón je nepovinný a použijeme ho iba na technickú konzultáciu.', namePlaceholder: 'Meno a priezvisko', phonePlaceholder: 'Telefónne číslo (nepovinné)', phoneHint: 'Ak číslo uvediete, technik Fitliner môže zavolať a prejsť možnosti automatizácie vstupu.',
    resultTitle: 'Vaše fitnesscentrum vyzerá ako vhodný kandidát pre Fitliner.', resultBody: 'Pozrite si posledné krátke video a rezervujte si miesto v pilotnom programe.', reserve: 'Rezervovať Fitliner za 0 €'
  },
  de: {
    step: 'Schritt', saving: 'Speichern…', continue: 'Weiter', yes: 'Ja', no: 'Nein',
    configError: 'Der Formulardienst ist vorübergehend nicht verfügbar.', saveError: 'Die Angaben konnten nicht gespeichert werden. Bitte erneut versuchen.', ownerOnly: 'Dieses Angebot richtet sich an Studioinhaber.',
    introTitle: 'Prüfe in 60 Sekunden, ob Fitliner dein Studio automatisieren kann', introBody: 'Sieh dir das kurze Video an und erfahre, wie Online-Zahlungen, Mitgliedschaften und Zutritt ohne manuelle Freigabe verbunden werden.',
    ownerTitle: 'Betreibst du derzeit ein Fitnessstudio?', ownerBody: 'Diese Analyse ist für Inhaber und Betreiber gedacht.',
    gymTitle: 'Angaben zu deinem Studio', gymBody: 'Name und Adresse helfen uns, Standort und aktuelle Einrichtung einzuschätzen.', gymPlaceholder: 'Name des Studios', addressPlaceholder: 'Studioadresse eingeben', searching: 'Adressen werden gesucht…', selected: 'Ausgewählte Google-Adresse',
    operationTitle: 'Wie arbeitet dein Studio heute?', operationBody: 'Noch zwei kurze Schritte. Deine Antworten helfen, den Zugang passend zu planen.', receptionTitle: 'Gibt es eine Rezeption?', receptionHint: 'So vergleichen wir vollautomatischen und hybriden Zutritt.',
    accessTitle: 'Welchen Eingang nutzt ihr?', turnstile: 'Drehkreuz', door: 'Elektromagnetische Tür', cards: 'Karten oder Chips', other: 'Andere', otherPlaceholder: 'Beschreibe den heutigen Zutritt', systemTitle: 'Nutzt ihr bereits ein Zutrittssystem?',
    contactTitle: 'Wohin dürfen wir die Studioanalyse senden?', contactBody: 'Wir senden Analyse und nächste Schritte per E-Mail. Eine Telefonnummer ist optional und dient nur einem technischen Gespräch.', namePlaceholder: 'Vor- und Nachname', phonePlaceholder: 'Telefonnummer (optional)', phoneHint: 'Falls angegeben, kann ein Fitliner-Spezialist die Möglichkeiten zur Zutrittsautomatisierung erläutern.',
    resultTitle: 'Dein Studio scheint gut zu Fitliner zu passen.', resultBody: 'Sieh dir das letzte kurze Video an und reserviere einen Platz im Pilotprogramm.', reserve: 'Fitliner für 0 € reservieren'
  },
  es: {
    step: 'Paso', saving: 'Guardando…', continue: 'Continuar', yes: 'Sí', no: 'No',
    configError: 'El servicio del formulario no está disponible temporalmente.', saveError: 'No pudimos guardar los datos. Inténtalo de nuevo.', ownerOnly: 'Esta oferta está dirigida a propietarios de gimnasios.',
    introTitle: 'Descubre en 60 segundos si Fitliner puede automatizar tu gimnasio', introBody: 'Mira el vídeo y descubre cómo conectar pagos online, membresías automáticas y acceso sin aprobación manual.',
    ownerTitle: '¿Gestionas actualmente un gimnasio?', ownerBody: 'Esta evaluación está pensada para propietarios y operadores.',
    gymTitle: 'Cuéntanos sobre tu gimnasio', gymBody: 'Necesitamos el nombre y la dirección para entender la ubicación y configuración actual.', gymPlaceholder: 'Nombre del gimnasio', addressPlaceholder: 'Empieza a escribir la dirección', searching: 'Buscando direcciones…', selected: 'Dirección de Google seleccionada',
    operationTitle: '¿Cómo funciona hoy tu gimnasio?', operationBody: 'Quedan dos pasos breves. Las respuestas nos ayudan a adaptar el acceso.', receptionTitle: '¿Tienes recepción?', receptionHint: 'Así comparamos acceso totalmente automático e híbrido.',
    accessTitle: '¿Qué tipo de entrada utilizas?', turnstile: 'Torno', door: 'Puerta electromagnética', cards: 'Tarjetas o llaveros', other: 'Otro', otherPlaceholder: 'Describe el acceso actual', systemTitle: '¿Ya utilizas un sistema de acceso?',
    contactTitle: '¿Dónde enviamos la evaluación?', contactBody: 'Enviaremos por correo el resultado y los siguientes pasos. El teléfono es opcional y solo se usa para una consulta técnica.', namePlaceholder: 'Nombre completo', phonePlaceholder: 'Teléfono (opcional)', phoneHint: 'Si lo indicas, un especialista de Fitliner puede comentar las opciones de automatización.',
    resultTitle: 'Tu gimnasio parece un buen candidato para Fitliner.', resultBody: 'Mira el último vídeo y reserva una plaza en el programa piloto.', reserve: 'Reservar Fitliner por 0 €'
  },
  fr: {
    step: 'Étape', saving: 'Enregistrement…', continue: 'Continuer', yes: 'Oui', no: 'Non',
    configError: 'Le service du formulaire est temporairement indisponible.', saveError: 'Impossible d’enregistrer les informations. Veuillez réessayer.', ownerOnly: 'Cette offre est destinée aux propriétaires de salles.',
    introTitle: 'Découvrez en 60 secondes si Fitliner peut automatiser votre salle', introBody: 'Regardez la courte vidéo et découvrez comment relier paiements, abonnements et accès sans validation manuelle.',
    ownerTitle: 'Gérez-vous actuellement une salle de sport ?', ownerBody: 'Cette évaluation est conçue pour les propriétaires et exploitants.',
    gymTitle: 'Présentez-nous votre salle', gymBody: 'Le nom et l’adresse nous aident à comprendre le lieu et l’installation actuelle.', gymPlaceholder: 'Nom de la salle', addressPlaceholder: 'Commencez à saisir l’adresse', searching: 'Recherche des adresses…', selected: 'Adresse Google sélectionnée',
    operationTitle: 'Comment fonctionne votre salle aujourd’hui ?', operationBody: 'Il reste deux étapes. Vos réponses nous aident à adapter l’accès.', receptionTitle: 'Avez-vous un accueil ?', receptionHint: 'Cela permet de comparer accès entièrement automatisé et hybride.',
    accessTitle: 'Quel type d’entrée utilisez-vous ?', turnstile: 'Tourniquet', door: 'Porte électromagnétique', cards: 'Cartes ou badges', other: 'Autre', otherPlaceholder: 'Décrivez l’accès actuel', systemTitle: 'Utilisez-vous déjà un système d’accès ?',
    contactTitle: 'Où envoyer l’évaluation de votre salle ?', contactBody: 'Nous enverrons le résultat et les prochaines étapes par e-mail. Le téléphone est facultatif et réservé à un échange technique.', namePlaceholder: 'Nom complet', phonePlaceholder: 'Téléphone (facultatif)', phoneHint: 'Si renseigné, un spécialiste Fitliner peut présenter les options d’automatisation.',
    resultTitle: 'Votre salle semble être une bonne candidate pour Fitliner.', resultBody: 'Regardez la dernière vidéo et réservez une place dans le programme pilote.', reserve: 'Réserver Fitliner pour 0 €'
  },
  'zh-Hans': {
    step: '步骤', saving: '正在保存…', continue: '继续', yes: '是', no: '否',
    configError: '表单服务暂时不可用。', saveError: '无法保存信息，请重试。', ownerOnly: '此方案面向健身房经营者。',
    introTitle: '60 秒了解 Fitliner 能否帮助你的健身房自动化', introBody: '观看短片，了解如何连接在线付款、自动会员和门禁，无需人工审批。',
    ownerTitle: '你目前在经营健身房吗？', ownerBody: '此评估适用于健身房所有者和经营者。',
    gymTitle: '介绍你的健身房', gymBody: '名称和地址有助于我们了解位置与当前配置。', gymPlaceholder: '健身房名称', addressPlaceholder: '开始输入健身房地址', searching: '正在搜索地址…', selected: '已选择 Google 地址',
    operationTitle: '你的健身房目前如何运营？', operationBody: '还剩两个简短步骤，你的回答有助于我们调整门禁方案。', receptionTitle: '有前台吗？', receptionHint: '这有助于比较全自动和混合门禁。',
    accessTitle: '使用哪种入口？', turnstile: '闸机', door: '电磁门', cards: '卡片或门禁扣', other: '其他', otherPlaceholder: '描述目前的入场方式', systemTitle: '是否已经使用门禁系统？',
    contactTitle: '将健身房评估发送到哪里？', contactBody: '我们会通过电子邮件发送评估和后续步骤。电话号码可选，仅用于技术沟通。', namePlaceholder: '姓名', phonePlaceholder: '电话号码（可选）', phoneHint: '如填写，Fitliner 专员可联系你讨论门禁自动化方案。',
    resultTitle: '你的健身房似乎适合 Fitliner。', resultBody: '观看最后一段短片并预订试点计划名额。', reserve: '以 0 欧元预订 Fitliner'
  }
};

export default function GymsFunnel({ locale }: { locale: string }) {
  const normalizedLocale = locale in COPY ? locale : 'en';
  const t = COPY[normalizedLocale];
  const [step, setStep] = useState<Step>(1);
  const [gymName, setGymName] = useState('');
  const [address, setAddress] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [predictions, setPredictions] = useState<
    Array<{
      place_id: string;
      description: string;
      main_text: string;
      secondary_text: string;
    }>
  >([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState('');
  const [hasReception, setHasReception] = useState('');
  const [accessType, setAccessType] = useState('');
  const [hasSystem, setHasSystem] = useState('');
  const [accessTypeOther, setAccessTypeOther] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [isSavingSubmission, setIsSavingSubmission] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const mediaLocale = 'sk';
  const step1VideoSrc = `/videos/gyms/${mediaLocale}.mp4`;
  const step6VideoSrc = `/videos/gyms/${mediaLocale}-final.mp4`;
  const step1PosterSrc = `/images/gyms/${mediaLocale}-poster.jpg`;
  const step6PosterSrc = `/images/gyms/${mediaLocale}-final-poster.jpg`;

  useEffect(() => {
    const storageKey = 'fitliner_gym_funnel_submission_id';
    const existingId = window.localStorage.getItem(storageKey);

    if (existingId) {
      setSubmissionId(existingId);
      return;
    }

    const newId = crypto.randomUUID();
    window.localStorage.setItem(storageKey, newId);
    setSubmissionId(newId);
  }, []);

  const saveLeadProgress = useCallback(
    async (completedStep: Step) => {
      if (!submissionId) return false;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        setSubmissionError(t.configError);
        return false;
      }

      try {
        setIsSavingSubmission(true);
        setSubmissionError('');

        const accessTypeFinal = accessType === 'Iné' ? accessTypeOther.trim() : accessType;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/gym_funnel_submissions?on_conflict=id`,
          {
            method: 'POST',
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates,return=minimal',
            },
            body: JSON.stringify({
              id: submissionId,
              locale,
              completed_step: completedStep,
              current_step: Math.min(completedStep + 1, 6),
              gym_name: gymName.trim() || null,
              address: address || addressQuery.trim() || null,
              address_query: addressQuery.trim() || null,
              google_place_id: selectedPlaceId || null,
              has_reception: hasReception || null,
              access_type: accessTypeFinal || null,
              access_type_other: accessTypeOther.trim() || null,
              has_system: hasSystem || null,
              contact_name: contactName.trim() || null,
              email: email.trim().toLowerCase() || null,
              phone: phone.trim() || null,
              reached_final_step: completedStep >= 5,
              checkout_clicked: completedStep >= 6,
              checkout_clicked_at: completedStep >= 6 ? new Date().toISOString() : null,
              source_path: typeof window !== 'undefined' ? window.location.pathname : null,
              source_url: typeof window !== 'undefined' ? window.location.href : null,
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('Gym funnel submission save failed', {
            status: response.status,
            errorBody,
          });
          throw new Error(t.saveError);
        }

        return true;
      } catch (error) {
        console.error('Gym funnel submission save error', error);
        setSubmissionError(t.saveError);
        return false;
      } finally {
        setIsSavingSubmission(false);
      }
    },
    [
      accessType,
      accessTypeOther,
      address,
      addressQuery,
      contactName,
      email,
      gymName,
      hasReception,
      hasSystem,
      locale,
      phone,
      selectedPlaceId,
      submissionId,
      t.configError,
      t.saveError,
    ]
  );

  useEffect(() => {
    if (step !== 3) return;

    const query = addressQuery.trim();

    if (query.length < 2) {
      setPredictions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsLoadingPredictions(true);

        const res = await fetch('/api/google-places-autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            language: locale,
          }),
          signal: controller.signal,
        });

        const json = await res.json();

        if (!controller.signal.aborted) {
          setPredictions(Array.isArray(json?.predictions) ? json.predictions : []);
        }
      } catch {
        if (!controller.signal.aborted) {
          setPredictions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPredictions(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [addressQuery, locale, step]);

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between text-xs text-white/50">
        <span>{t.step} {step} / 6</span>
        <span>{locale.toUpperCase()}</span>
      </div>

      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-1 rounded-full bg-[#7C3AED] transition-all duration-300"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:p-6">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {t.introTitle}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
              {t.introBody}
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video
                key={step1VideoSrc}
                controls
                preload="none"
                playsInline
                poster={step1PosterSrc}
                className="aspect-video w-full bg-black object-contain"
              >
                <source src={step1VideoSrc} type="video/mp4" />
              </video>
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 md:text-base"
            >
              {t.continue}
            </button>
          </div>
        )}

        {step === 2 && (
  <div>
    <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
      {t.ownerTitle}
    </h2>

    <p className="mt-3 text-sm text-white/70">
      {t.ownerBody}
    </p>

    <div className="mt-6 grid grid-cols-1 gap-3">
      <button
        onClick={async () => {
          const saved = await saveLeadProgress(2);
          if (saved) setStep(3);
        }}
        disabled={isSavingSubmission || !submissionId}
        className="w-full rounded-2xl bg-[#7C3AED] py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSavingSubmission ? t.saving : t.yes}
      </button>

      <button
        onClick={() => alert(t.ownerOnly)}
        className="w-full rounded-2xl border border-white/20 py-3 font-semibold"
      >
        {t.no}
      </button>
    </div>
  </div>
)}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {t.gymTitle}
            </h2>

            <p className="mt-3 text-sm text-white/70">
              {t.gymBody}
            </p>

            <div className="mt-6 space-y-3">
              <input
                type="text"
                placeholder={t.gymPlaceholder}
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
              />

              <div className="relative">
                <input
                  type="text"
                  placeholder={t.addressPlaceholder}
                  value={addressQuery}
                  onChange={(e) => {
                    setAddressQuery(e.target.value);
                    setAddress('');
                    setSelectedPlaceId('');
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
                />

                {isLoadingPredictions && (
                  <div className="mt-2 text-xs text-white/50">{t.searching}</div>
                )}

                {predictions.length > 0 && (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#111114]">
                    {predictions.map((prediction) => (
                      <button
                        key={prediction.place_id}
                        type="button"
                        onClick={() => {
                          setAddress(prediction.description);
                          setAddressQuery(prediction.description);
                          setSelectedPlaceId(prediction.place_id);
                          setPredictions([]);
                        }}
                        className="block w-full border-b border-white/10 px-4 py-3 text-left last:border-b-0 hover:bg-white/5"
                      >
                        <div className="text-sm font-medium text-white">
                          {prediction.main_text}
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          {prediction.secondary_text || prediction.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {address && selectedPlaceId && (
                  <div className="mt-2 text-xs text-green-400">
                    {t.selected}: {address}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={async () => {
                if (!gymName.trim() || !selectedPlaceId) return;
                const saved = await saveLeadProgress(3);
                if (saved) setStep(4);
              }}
              disabled={!gymName.trim() || !selectedPlaceId || isSavingSubmission}
              className={`mt-6 w-full rounded-2xl py-3 font-semibold transition-opacity ${
                !gymName.trim() || !selectedPlaceId || isSavingSubmission
                  ? 'bg-[#7C3AED]/40 cursor-not-allowed'
                  : 'bg-[#7C3AED] hover:opacity-95'
              }`}
            >
              {isSavingSubmission ? t.saving : t.continue}
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {t.operationTitle}
            </h2>

            <p className="mt-3 text-sm text-white/70">
              {t.operationBody}
            </p>

            <div className="mt-6 mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-base font-semibold text-white md:text-lg">{t.receptionTitle}</div>
              <div className="mt-1 text-xs text-white/50">
                {t.receptionHint}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{value: 'Áno', label: t.yes}, {value: 'Nie', label: t.no}].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setHasReception(option.value)}
                  className={`rounded-2xl py-3 font-semibold ${
                    hasReception === option.value
                      ? 'bg-[#7C3AED]'
                      : 'border border-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {hasReception && (
              <>
                <h3 className="mt-8 text-lg font-semibold text-white">
                  {t.accessTitle}
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    {value: 'Turniket', label: t.turnstile},
                    {value: 'Dvere (elektromagnet)', label: t.door},
                    {value: 'Karty / čipy', label: t.cards},
                    {value: 'Iné', label: t.other}
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setAccessType(option.value);
                        if (option.value !== 'Iné') {
                          setAccessTypeOther('');
                        }
                      }}
                      className={`rounded-2xl py-3 font-semibold ${
                        accessType === option.value
                          ? 'bg-[#7C3AED]'
                          : 'border border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

              {accessType === 'Iné' && (
                <input
                  type="text"
                  placeholder={t.otherPlaceholder}
                  value={accessTypeOther}
                  onChange={(e) => setAccessTypeOther(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
                />
              )}

                <h3 className="mt-8 text-lg font-semibold text-white">
                  {t.systemTitle}
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[{value: 'Áno', label: t.yes}, {value: 'Nie', label: t.no}].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setHasSystem(option.value)}
                      className={`rounded-2xl py-3 font-semibold ${
                        hasSystem === option.value
                          ? 'bg-[#7C3AED]'
                          : 'border border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={async () => {
                    if (
                      !hasReception ||
                      !accessType ||
                      !hasSystem ||
                      (accessType === 'Iné' && !accessTypeOther.trim())
                    ) {
                      return;
                    }
                    const saved = await saveLeadProgress(4);
                    if (saved) setStep(5);
                  }}
                  disabled={
                    !hasReception ||
                    !accessType ||
                    !hasSystem ||
                    (accessType === 'Iné' && !accessTypeOther.trim()) ||
                    isSavingSubmission
                  }
                  className={`mt-6 w-full rounded-2xl py-3 font-semibold transition-opacity ${
                    !hasReception ||
                    !accessType ||
                    !hasSystem ||
                    (accessType === 'Iné' && !accessTypeOther.trim()) ||
                    isSavingSubmission
                      ? 'bg-[#7C3AED]/40 cursor-not-allowed'
                      : 'bg-[#7C3AED] hover:opacity-95'
                  }`}
                >
                  {isSavingSubmission ? t.saving : t.continue}
                </button>
              </>
            )}
          </div>
        )}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {t.contactTitle}
            </h2>

            <p className="mt-3 text-sm text-white/70">
              {t.contactBody}
            </p>

            <div className="mt-6 space-y-3">
              <input
                type="text"
                placeholder={t.namePlaceholder}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
              />

              <div>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
                />
                <p className="mt-2 text-xs leading-5 text-white/50">
                  {t.phoneHint}
                </p>
              </div>
            </div>

            <button
              onClick={async () => {
                const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
                if (!contactName.trim() || !emailOk) return;
                const saved = await saveLeadProgress(5);
                if (saved) setStep(6);
              }}
              disabled={
                !contactName.trim() ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
                isSavingSubmission
              }
              className={`mt-6 w-full rounded-2xl py-3 font-semibold transition-opacity ${
                !contactName.trim() ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
                isSavingSubmission
                  ? 'bg-[#7C3AED]/40 cursor-not-allowed'
                  : 'bg-[#7C3AED] hover:opacity-95'
              }`}
            >
              {isSavingSubmission ? t.saving : t.continue}
            </button>
          </div>
        )}
        {step === 6 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {t.resultTitle}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
              {t.resultBody}
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video
                key={step6VideoSrc}
                controls
                preload="none"
                playsInline
                poster={step6PosterSrc}
                className="aspect-video w-full bg-black object-contain"
              >
                <source src={step6VideoSrc} type="video/mp4" />
              </video>
            </div>

            <a
              href="https://checkout.globaliollc.com/fitliner-system-sk/?coupon=SK10VIP"
              onClick={async (event) => {
                event.preventDefault();
                await saveLeadProgress(6);
                window.location.href = 'https://checkout.globaliollc.com/fitliner-system-sk/?coupon=SK10VIP';
              }}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 md:text-base"
            >
              {t.reserve}
            </a>
          </div>
        )}
        {submissionError && (
          <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {submissionError}
          </p>
        )}
      </div>
    </section>
  );
}
