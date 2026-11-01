"use client";
import {
  useMemo,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type FormEvent,
} from "react";
const countryLabels = [
  ["PL", "Poland", "Poľsko", 120],
  ["CZ", "Czech Republic", "Česko", 70],
  ["SK", "Slovakia", "Slovensko", 40],
  ["HU", "Hungary", "Maďarsko", 70],
  ["RO", "Romania", "Rumunsko", 100],
  ["DE", "Germany", "Nemecko", 200],
  ["AT", "Austria", "Rakúsko", 60],
  ["GB", "United Kingdom", "Spojené kráľovstvo", 180],
  ["FR", "France", "Francúzsko", 170],
  ["ES", "Spain", "Španielsko", 130],
  ["IT", "Italy", "Taliansko", 150],
  ["NL", "Netherlands", "Holandsko", 90],
  ["BE", "Belgium", "Belgicko", 65],
  ["PT", "Portugal", "Portugalsko", 60],
  ["HR", "Croatia", "Chorvátsko", 40],
  ["SI", "Slovenia", "Slovinsko", 30],
  ["BG", "Bulgaria", "Bulharsko", 50],
  ["SE", "Sweden", "Švédsko", 70],
  ["IE", "Ireland", "Írsko", 40],
] as const;
const euro = (n: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
export type PartnerCountry = {
  code: string;
  name: string;
  public_status: string;
  annual_new_gyms_target: number | null;
  target_approved: boolean;
};
export default function PartnerInteractive({
  locale,
  countrySettings,
  children,
}: {
  children?: ReactNode;
  locale: "sk" | "en";
  countrySettings: PartnerCountry[];
}) {
  const countries = countrySettings.map(
    (c) =>
      [
        c.code,
        c.name,
        countryLabels.find((l) => l[0] === c.code)?.[2] || c.name,
        c.annual_new_gyms_target,
        c.target_approved,
        c.public_status,
      ] as const,
  );
  const requestId = useRef("");
  const startedAt = useRef(0);
  useEffect(() => {
    requestId.current = crypto.randomUUID();
    startedAt.current = Date.now();
  }, []);
  const sk = locale === "sk";
  const [country, setCountry] = useState(countrySettings[0]?.code || "");
  const [gyms, setGyms] = useState(5),
    [volume, setVolume] = useState(5000),
    [newGyms, setNewGyms] = useState(1),
    [cost, setCost] = useState(120);
  const [errorCode, setErrorCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const row = countries.find((c) => c[0] === country);
  const available = !!row && ["open", "qualifying"].includes(row[5]);
  const calc = useMemo(() => {
    const monthly = gyms * volume * 0.02 * 0.5;
    const oneoff = newGyms * Math.max(0, 297 - cost) * 0.5;
    return { monthly, oneoff, total: monthly + oneoff };
  }, [gyms, volume, newGyms, cost]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    form.set("request_id", requestId.current);
    form.set("started_at", String(startedAt.current));
    try {
      const resp = await fetch("/api/partner-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      if (!resp.ok) {
        const error = await resp.json();
        setErrorCode(error.error || "unknown");
        throw Error("Not submitted");
      }
      setStatus("success");
      (e.target as HTMLFormElement).reset();
      requestId.current = crypto.randomUUID();
      startedAt.current = Date.now();
    } catch {
      setStatus("error");
    }
  }
  return (
    <>
      <section className="partner-container partner-section" id="countries">
        <p className="partner-kicker">{sk ? "VÁŠ TRH" : "YOUR MARKET"}</p>
        <h2>
          {sk
            ? "Kde chcete zastupovať Fitliner?"
            : "Where do you want to represent Fitliner?"}
        </h2>
        <label className="partner-field">
          {sk ? "Krajina" : "Country"}
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((c) => (
              <option value={c[0]} key={c[0]}>
                {sk ? c[2] : c[1]}
              </option>
            ))}
          </select>
        </label>
        <div className="partner-country-note">
          <strong>
            {row
              ? sk
                ? row[2]
                : row[1]
              : sk
                ? "Krajiny momentálne nie sú dostupné."
                : "Countries are temporarily unavailable."}
          </strong>
          <span>
            {row?.[4]
              ? sk
                ? "Ročný cieľ"
                : "Annual target"
              : sk
                ? "Návrh ročného cieľa"
                : "Proposed annual target"}
            : {row?.[3] ?? "—"}{" "}
            {sk ? "nových aktivovaných fitiek" : "new activated gyms"}
          </span>
          <small>
            {sk
              ? "Ciele sú orientačné, nie schválené. Dostupnosť exkluzivity overujeme individuálne."
              : "Targets are illustrative and not approved. Exclusivity availability is verified individually."}
          </small>
        </div>
      </section>
      <section className="partner-calculator" id="calculator">
        <div className="partner-container partner-section">
          <p className="partner-kicker">
            {sk ? "KALKULAČKA PRÍJMOV" : "EARNINGS CALCULATOR"}
          </p>
          <h2>
            {sk
              ? "Aký príjem môže váš trh vytvárať?"
              : "What could your market generate?"}
          </h2>
          <p className="partner-muted">
            {sk
              ? "Model pri 50 % podiele z dohodnutého čistého základu. Predpokladá, že uvedené 2 % platformového poplatku sú disponibilné na delenie; skutočné náklady môžu výsledok znížiť."
              : "Illustration assuming 50% of agreed net distributable revenue. The 2% platform fee is assumed distributable; actual costs may reduce the result."}
          </p>
          <div
            className="partner-scenarios"
            role="group"
            aria-label={sk ? "Modelové scenáre" : "Illustrative scenarios"}
          >
            {[5, 10, 25].map((n, i) => (
              <button
                key={n}
                type="button"
                aria-pressed={
                  gyms === n &&
                  volume === 5000 &&
                  newGyms === [1, 2, 3][i] &&
                  cost === 120
                }
                onClick={() => {
                  setGyms(n);
                  setVolume(5000);
                  setNewGyms([1, 2, 3][i]);
                  setCost(120);
                }}
              >
                <span>
                  {sk
                    ? ["Prvé fitká", "Rozvoj siete", "Väčšia sieť"][i]
                    : ["First gyms", "Growing network", "Larger network"][i]}
                </span>
                <strong>
                  {n} {sk ? "fitiek" : "gyms"}
                </strong>
              </button>
            ))}
          </div>
          <p className="partner-scenario-note">
            {sk
              ? "Scenáre sú príklady výpočtu, nie prognóza predaja. Predpokladajú 5 000 € mesačných platieb na fitko; všetky vstupy môžete upraviť."
              : "These scenarios illustrate the calculation, not a sales forecast. They assume €5,000 in monthly payments per gym; you can change every input."}
          </p>
          <div className="partner-calc-grid">
            <div className="partner-inputs">
              {(
                [
                  [
                    sk ? "Aktívne fitness centrá" : "Active gyms",
                    gyms,
                    setGyms,
                    0,
                    10000,
                  ],
                  [
                    sk
                      ? "Mesačný objem platieb na fitko (€)"
                      : "Monthly payments per gym (€)",
                    volume,
                    setVolume,
                    0,
                    100000,
                  ],
                  [
                    sk ? "Nové predaje za mesiac" : "New gym sales per month",
                    newGyms,
                    setNewGyms,
                    0,
                    1000,
                  ],
                  [
                    sk
                      ? "Priame náklady na jeden predaj (€)"
                      : "Direct cost per sale (€)",
                    cost,
                    setCost,
                    0,
                    297,
                  ],
                ] as const
              ).map(([label, value, setter, min, max]) => (
                <label key={label} className="partner-field">
                  {label}
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) =>
                      setter(
                        Math.max(
                          min,
                          Math.min(max, Number(e.target.value) || 0),
                        ),
                      )
                    }
                  />
                </label>
              ))}
            </div>
            <div className="partner-result">
              <small>
                {sk
                  ? "Modelový príjem partnera za mesiac"
                  : "Illustrative partner income per month"}
              </small>
              <strong key={calc.total} className="partner-total">
                {euro(calc.total)}
              </strong>
              <p>
                {sk ? "Z transakcií" : "From transaction fees"}:{" "}
                {euro(calc.monthly)}
              </p>
              <p>
                {sk ? "Z jednorazových predajov" : "From one-time sales"}:{" "}
                {euro(calc.oneoff)}
              </p>
              <small>
                {sk
                  ? "Nejde o garanciu výnosu. Kalkulačka nepočíta dane, ďalšie poplatky a zmluvné úpravy."
                  : "Not guaranteed earnings. Taxes, other costs and contractual adjustments excluded."}
              </small>
            </div>
          </div>
        </div>
      </section>
      {children}
      <section className="partner-container partner-section" id="apply">
        <p className="partner-kicker">{sk ? "PRIHLÁŠKA" : "APPLICATION"}</p>
        <h2>
          {sk
            ? "Začnime rozhovorom o vašej krajine."
            : "Let’s talk about your country."}
        </h2>
        <p className="partner-muted partner-apply-intro">
          {sk
            ? "Povedzte nám, aký trh poznáte a aké skúsenosti prinášate. Prihlášku posúdime a ozveme sa s ďalším postupom. Odoslanie nie je záväzkom uzavrieť zmluvu."
            : "Tell us which market you know and what experience you bring. We’ll review your application and contact you about next steps. Submitting does not commit you to an agreement."}
        </p>
        <form onSubmit={submit} className="partner-form">
          <label className="partner-field partner-wide">
            {sk ? "Krajina prihlášky" : "Application country"}
            <select
              name="country_code"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            >
              {countries.map((c) => (
                <option
                  key={c[0]}
                  value={c[0]}
                  disabled={!["open", "qualifying"].includes(c[5])}
                >
                  {sk ? c[2] : c[1]}
                </option>
              ))}
            </select>
          </label>
          <div
            aria-hidden="true"
            style={{ position: "absolute", left: "-10000px" }}
          >
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="partner-field">
            {sk ? "Meno a priezvisko" : "Full name"}
            <input name="contact_name" minLength={2} required maxLength={120} />
          </label>
          <label className="partner-field">
            {sk ? "Spoločnosť" : "Company"}
            <input name="company" maxLength={160} />
          </label>
          <label className="partner-field">
            Email
            <input name="email" type="email" required maxLength={254} />
          </label>
          <label className="partner-field">
            {sk ? "Telefón" : "Phone"}
            <input
              name="phone"
              type="tel"
              minLength={5}
              required
              maxLength={40}
            />
          </label>
          <label className="partner-field partner-wide">
            {sk
              ? "Vaše skúsenosti s predajom / fitness"
              : "Your sales / fitness experience"}
            <textarea
              name="experience"
              minLength={10}
              required
              maxLength={2000}
              rows={4}
            />
          </label>
          <label className="partner-field partner-wide">
            {sk ? "Správa (nepovinné)" : "Message (optional)"}
            <textarea name="message" maxLength={2000} rows={3} />
          </label>
          <label className="partner-check partner-wide">
            <input
              type="checkbox"
              name="privacy_consent"
              value="yes"
              required
            />
            <span>
              {sk
                ? "Súhlasím so spracovaním poskytnutých údajov na účel vybavenia žiadosti."
                : "I agree to the processing of submitted information for handling my application."}{" "}
              <a
                href={`/${locale}/privacy`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sk ? "Ochrana osobných údajov" : "Privacy policy"}
              </a>
            </span>
          </label>
          <div className="partner-wide">
            <button
              className="partner-cta"
              disabled={status === "loading" || !available}
            >
              {status === "loading"
                ? sk
                  ? "Odosielam…"
                  : "Sending…"
                : sk
                  ? "Odoslať prihlášku"
                  : "Submit application"}{" "}
              ↗
            </button>
            {status === "success" && (
              <p role="status">
                {sk
                  ? "Ďakujeme, prihláška je uložená. Posúdime ju a ozveme sa na uvedený e-mail."
                  : "Thank you — your application is saved. We’ll review it and contact you at the email provided."}
              </p>
            )}
            {status === "error" && (
              <p role="alert">
                {errorCode === "rate_limited"
                  ? sk
                    ? "Príliš veľa prihlášok. Skúste to neskôr alebo nás kontaktujte."
                    : "Too many applications. Please try later or contact us."
                  : errorCode === "country_unavailable"
                    ? sk
                      ? "Táto krajina momentálne neprijíma prihlášky. Vyberte inú krajinu."
                      : "This country is not accepting applications. Please choose another country."
                    : errorCode === "invalid_fields"
                      ? sk
                        ? "Skontrolujte polia a súhlas, potom skúste odoslanie znova."
                        : "Please check your details and consent, then try again."
                      : sk
                        ? "Prihlášku sa nepodarilo odoslať. Skúste to neskôr."
                        : "Application could not be submitted. Please try again later."}
              </p>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
