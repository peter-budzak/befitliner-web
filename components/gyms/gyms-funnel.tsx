'use client';

import { useCallback, useEffect, useState } from 'react';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function GymsFunnel({ locale }: { locale: string }) {
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
  const [submissionId, setSubmissionId] = useState('');
  const [isSavingSubmission, setIsSavingSubmission] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const step1VideoSrc = `/videos/gyms/${locale}.mp4`;
  const step6VideoSrc = `/videos/gyms/${locale}-final.mp4`;
  const step1PosterSrc = `/images/gyms/${locale}-poster.jpg`;
  const step6PosterSrc = `/images/gyms/${locale}-final-poster.jpg`;

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
        setSubmissionError('Supabase konfigurácia nie je dostupná.');
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
              reached_final_step: completedStep >= 5,
              checkout_clicked: completedStep >= 6,
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
          throw new Error('Nepodarilo sa uložiť údaje.');
        }

        return true;
      } catch (error) {
        console.error('Gym funnel submission save error', error);
        setSubmissionError('Údaje sa nepodarilo uložiť. Skúste pokračovať ešte raz.');
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
      selectedPlaceId,
      submissionId,
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
        <span>Step {step} of 6</span>
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
              Zistite za 60 sekúnd, či môže Fitliner automatizovať vaše fitnesscentrum
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
              Pozrite si krátke video a zistite, ako môže Fitliner prepojiť online platby,
              automatické členstvá a vstup do fitka bez ručného schvaľovania.
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
              Pokračovať
            </button>
          </div>
        )}

        {step === 2 && (
  <div>
    <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
      Prevádzkujete momentálne fitnesscentrum?
    </h2>

    <p className="mt-3 text-sm text-white/70">
      Táto ponuka je určená len pre majiteľov fitnesscentier.
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
        {isSavingSubmission ? 'Ukladám…' : 'Áno'}
      </button>

      <button
        onClick={() => alert('Táto ponuka je určená len pre fitnesscentrá')}
        className="w-full rounded-2xl border border-white/20 py-3 font-semibold"
      >
        Nie
      </button>
    </div>
  </div>
)}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Zadajte vaše fitnesscentrum
            </h2>

            <p className="mt-3 text-sm text-white/70">
              Potrebujeme názov a adresu, aby sme vedeli posúdiť vašu lokalitu.
            </p>

            <div className="mt-6 space-y-3">
              <input
                type="text"
                placeholder="Názov fitnesscentra"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
              />

              <div className="relative">
                <input
                  type="text"
                  placeholder="Začnite písať adresu fitnesscentra"
                  value={addressQuery}
                  onChange={(e) => {
                    setAddressQuery(e.target.value);
                    setAddress('');
                    setSelectedPlaceId('');
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
                />

                {isLoadingPredictions && (
                  <div className="mt-2 text-xs text-white/50">Vyhľadávam adresy…</div>
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
                    Vybraná Google adresa: {address}
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
              {isSavingSubmission ? 'Ukladám…' : 'Pokračovať'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Ako dnes funguje vaše fitnesscentrum?
            </h2>

            <p className="mt-3 text-sm text-white/70">
              Už len 2 kroky do rezervácie pilotného programu. Stačí pár kliknutí –
              prispôsobíme vám riešenie na mieru.
            </p>

            <div className="mt-6 mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-base font-semibold text-white md:text-lg">Máte recepciu?</div>
              <div className="mt-1 text-xs text-white/50">
                Toto nám pomôže odhadnúť, či je vhodnejší plne automatický alebo hybridný vstup.
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Áno', 'Nie'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setHasReception(option)}
                  className={`rounded-2xl py-3 font-semibold ${
                    hasReception === option
                      ? 'bg-[#7C3AED]'
                      : 'border border-white/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {hasReception && (
              <>
                <h3 className="mt-8 text-lg font-semibold text-white">
                  Aký typ vstupu používate?
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {['Turniket', 'Dvere (elektromagnet)', 'Karty / čipy', 'Iné'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setAccessType(option);
                        if (option !== 'Iné') {
                          setAccessTypeOther('');
                        }
                      }}
                      className={`rounded-2xl py-3 font-semibold ${
                        accessType === option
                          ? 'bg-[#7C3AED]'
                          : 'border border-white/20'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

              {accessType === 'Iné' && (
                <input
                  type="text"
                  placeholder="Napíšte, ako sa dnes vstupuje do fitka"
                  value={accessTypeOther}
                  onChange={(e) => setAccessTypeOther(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/40"
                />
              )}

                <h3 className="mt-8 text-lg font-semibold text-white">
                  Používate už nejaký vstupový systém?
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {['Áno', 'Nie'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setHasSystem(option)}
                      className={`rounded-2xl py-3 font-semibold ${
                        hasSystem === option
                          ? 'bg-[#7C3AED]'
                          : 'border border-white/20'
                      }`}
                    >
                      {option}
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
                  {isSavingSubmission ? 'Ukladám…' : 'Pokračovať'}
                </button>
              </>
            )}
          </div>
        )}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Kam vám máme poslať výsledok analýzy vášho fitnesscentra?
            </h2>

            <p className="mt-3 text-sm text-white/70">
              Na tento kontakt vám pošleme vyhodnotenie a ďalšie kroky k rezervácii pilotného programu.
            </p>

            <div className="mt-6 space-y-3">
              <input
                type="text"
                placeholder="Meno a priezvisko"
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
              {isSavingSubmission ? 'Ukladám…' : 'Pokračovať'}
            </button>
          </div>
        )}
        {step === 6 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Gratulujeme. Vaše fitnesscentrum je vhodným kandidátom pre Fitliner.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
              Pozrite si posledné krátke video a rezervujte si miesto medzi prvými 10 fitnesscentrami.
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
              onClick={() => {
                void saveLeadProgress(6);
              }}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 md:text-base"
            >
              Rezervovať Fitliner za 0 €
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