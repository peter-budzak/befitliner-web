'use client';

import { useEffect, useState } from 'react';

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
  const step1VideoSrc = `/videos/gyms/${locale}.mp4`;
  const step6VideoSrc = `/videos/gyms/${locale}-final.mp4`;
  const step1PosterSrc = `/images/gyms/${locale}-poster.jpg`;
  const step6PosterSrc = `/images/gyms/${locale}-final-poster.jpg`;

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
              Zistite, či je Fitliner vhodný aj pre vaše fitnesscentrum
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
              Pozrite si krátke video a za pár klikov zistíte, či vám Fitliner vie
              priniesť viac klientov, jednoduchšiu prevádzku a vyšší zisk.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video
                key={step1VideoSrc}
                controls
                preload="none"
                playsInline
                className="aspect-[9/16] w-full bg-black object-cover md:aspect-video"
                poster={step1PosterSrc}
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
        onClick={() => setStep(3)}
        className="w-full rounded-2xl bg-[#7C3AED] py-3 font-semibold"
      >
        Áno
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
              onClick={() => {
                if (!gymName.trim() || !selectedPlaceId) return;
                setStep(4);
              }}
              disabled={!gymName.trim() || !selectedPlaceId}
              className={`mt-6 w-full rounded-2xl py-3 font-semibold transition-opacity ${
                !gymName.trim() || !selectedPlaceId
                  ? 'bg-[#7C3AED]/40 cursor-not-allowed'
                  : 'bg-[#7C3AED] hover:opacity-95'
              }`}
            >
              Pokračovať
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Ako dnes funguje vaše fitnesscentrum?
            </h2>

            <p className="mt-3 text-sm text-white/70">
              Stačí pár kliknutí – prispôsobíme vám riešenie na mieru.
            </p>

            <div className="mt-6 text-sm text-white/60 mb-2">Máte recepciu?</div>
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
                  onClick={() => {
                    if (
                      !hasReception ||
                      !accessType ||
                      !hasSystem ||
                      (accessType === 'Iné' && !accessTypeOther.trim())
                    ) {
                      return;
                    }
                    setStep(5);
                  }}
                  disabled={
                    !hasReception ||
                    !accessType ||
                    !hasSystem ||
                    (accessType === 'Iné' && !accessTypeOther.trim())
                  }
                  className={`mt-6 w-full rounded-2xl py-3 font-semibold transition-opacity ${
                    !hasReception ||
                    !accessType ||
                    !hasSystem ||
                    (accessType === 'Iné' && !accessTypeOther.trim())
                      ? 'bg-[#7C3AED]/40 cursor-not-allowed'
                      : 'bg-[#7C3AED] hover:opacity-95'
                  }`}
                >
                  Pokračovať
                </button>
              </>
            )}
          </div>
        )}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Kam vám máme poslať ďalšie informácie?
            </h2>

            <p className="mt-3 text-sm text-white/70">
              Zadajte kontakt na majiteľa alebo zodpovednú osobu fitnesscentra.
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
              onClick={() => {
                const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
                if (!contactName.trim() || !emailOk) return;
                setStep(6);
              }}
              disabled={!contactName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}
              className={`mt-6 w-full rounded-2xl py-3 font-semibold transition-opacity ${
                !contactName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                  ? 'bg-[#7C3AED]/40 cursor-not-allowed'
                  : 'bg-[#7C3AED] hover:opacity-95'
              }`}
            >
              Pokračovať
            </button>
          </div>
        )}
        {step === 6 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Získajte Fitliner pre vaše fitnesscentrum
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
              Pozrite si posledné krátke video a pokračujte na finálne odoslanie.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video
                key={step6VideoSrc}
                controls
                preload="none"
                playsInline
                className="aspect-[9/16] w-full bg-black object-cover md:aspect-video"
                poster={step6PosterSrc}
              >
                <source src={step6VideoSrc} type="video/mp4" />
              </video>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 md:text-base"
            >
              Objednať prístupový systém
            </button>
          </div>
        )}
      </div>
    </section>
  );
}