"use client";
import type { PartnerCopy } from "@/lib/partners/copy";
import type { PartnerLocale } from "@/lib/partners/locales";

import {
  useMemo,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type FormEvent,
} from "react";
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
  copy,
}: {
  copy: PartnerCopy;
  children?: ReactNode;
  locale: PartnerLocale;
  countrySettings: PartnerCountry[];
}) {
  const t = (key: keyof PartnerCopy) => copy[key];
  const euro = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  const countries = countrySettings.map(
    (c) =>
      [
        c.code,
        c.name,
        c.name,
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
  const [country, setCountry] = useState(countrySettings[0]?.code || "");
  const [gyms, setGyms] = useState(10),
    [volume, setVolume] = useState(15000),
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
        <p className="partner-kicker">{t("YOUR MARKET")}</p>
        <h2>{t("Where do you want to represent Fitliner?")}</h2>
        <label className="partner-field">
          {t("Country")}
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((c) => (
              <option value={c[0]} key={c[0]}>
                {c[1]}
              </option>
            ))}
          </select>
        </label>
        <div className="partner-country-note">
          <strong>
            {row ? row[1] : t("Countries are temporarily unavailable.")}
          </strong>
          <span>
            {row?.[4] ? t("Annual target") : t("Proposed annual target")}:{" "}
            {row?.[3] ?? "—"} {t("new activated gyms")}
          </span>
          <small>
            {t(
              "Targets are illustrative and not approved. Exclusivity availability is verified individually.",
            )}
          </small>
        </div>
      </section>
      <section className="partner-calculator" id="calculator">
        <div className="partner-container partner-section">
          <p className="partner-kicker">{t("EARNINGS CALCULATOR")}</p>
          <h2>{t("What could your market generate?")}</h2>
          <p className="partner-muted">
            {t(
              "Illustration assuming 50% of agreed net distributable revenue. The 2% platform fee is assumed distributable; actual costs may reduce the result.",
            )}
          </p>
          <div
            className="partner-scenarios"
            role="group"
            aria-label={t("Illustrative scenarios")}
          >
            {[10, 50, 100].map((n, i) => (
              <button
                key={n}
                type="button"
                aria-pressed={
                  gyms === n &&
                  volume === 15000 &&
                  newGyms === [1, 2, 3][i] &&
                  cost === 120
                }
                onClick={() => {
                  setGyms(n);
                  setVolume(15000);
                  setNewGyms([1, 2, 3][i]);
                  setCost(120);
                }}
              >
                <span>
                  {
                    [
                      t("First gyms"),
                      t("Growing network"),
                      t("Larger network"),
                    ][i]
                  }
                </span>
                <strong>
                  {n} {t("gyms")}
                </strong>
              </button>
            ))}
          </div>
          <p className="partner-scenario-note">
            {t(
              "Scenarios use an illustrative average monthly revenue of €15,000 per gym, not a verified regional average. The calculation assumes these payments are processed through Fitliner. You can change every input.",
            )}
          </p>
          <div className="partner-calc-grid">
            <div className="partner-inputs">
              {(
                [
                  [t("Active gyms"), gyms, setGyms, 0, 10000],
                  [
                    t("Illustrative average monthly gym revenue (€)"),
                    volume,
                    setVolume,
                    0,
                    100000,
                  ],
                  [t("New gym sales per month"), newGyms, setNewGyms, 0, 1000],
                  [t("Direct cost per sale (€)"), cost, setCost, 0, 297],
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
              <small>{t("Illustrative partner income per month")}</small>
              <strong key={calc.total} className="partner-total">
                {euro(calc.total)}
              </strong>
              <p>
                {t("From transaction fees")}: {euro(calc.monthly)}
              </p>
              <p>
                {t("From one-time sales")}: {euro(calc.oneoff)}
              </p>
              <small>
                {t(
                  "Not guaranteed earnings. Taxes, other costs and contractual adjustments excluded.",
                )}
              </small>
            </div>
          </div>
        </div>
      </section>
      {children}
      <section className="partner-container partner-section" id="apply">
        <p className="partner-kicker">{t("APPLICATION")}</p>
        <h2>{t("Let’s talk about your country.")}</h2>
        <p className="partner-muted partner-apply-intro">
          {t(
            "Tell us which market you know and what experience you bring. We’ll review your application and contact you about next steps. Submitting does not commit you to an agreement.",
          )}
        </p>
        <form onSubmit={submit} className="partner-form">
          <label className="partner-field partner-wide">
            {t("Application country")}
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
                  {c[1]}
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
            {t("Full name")}
            <input name="contact_name" minLength={2} required maxLength={120} />
          </label>
          <label className="partner-field">
            {t("Company")}
            <input name="company" maxLength={160} />
          </label>
          <label className="partner-field">
            {t("Email")}
            <input name="email" type="email" required maxLength={254} />
          </label>
          <label className="partner-field">
            {t("Phone")}
            <input
              name="phone"
              type="tel"
              minLength={5}
              required
              maxLength={40}
            />
          </label>
          <label className="partner-field partner-wide">
            {t("Your sales / fitness experience")}
            <textarea
              name="experience"
              minLength={10}
              required
              maxLength={2000}
              rows={4}
            />
          </label>
          <label className="partner-field partner-wide">
            {t("Message (optional)")}
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
              {t(
                "I agree to the processing of submitted information for handling my application.",
              )}{" "}
              <a
                href={`/${locale === "pl" || locale === "hu" ? "en" : locale}/privacy`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Privacy policy")}
                {(locale === "pl" || locale === "hu") && (
                  <> ({t("In English")})</>
                )}
              </a>
            </span>
          </label>
          <div className="partner-wide">
            <button
              className="partner-cta"
              disabled={status === "loading" || !available}
            >
              {status === "loading" ? t("Sending…") : t("Submit application")}{" "}
              ↗
            </button>
            {status === "success" && (
              <p role="status">
                {t(
                  "Thank you — your application is saved. We’ll review it and contact you at the email provided.",
                )}
              </p>
            )}
            {status === "error" && (
              <p role="alert">
                {errorCode === "rate_limited"
                  ? t("Too many applications. Please try later or contact us.")
                  : errorCode === "country_unavailable"
                    ? t(
                        "This country is not accepting applications. Please choose another country.",
                      )
                    : errorCode === "invalid_fields"
                      ? t(
                          "Please check your details and consent, then try again.",
                        )
                      : t(
                          "Application could not be submitted. Please try again later.",
                        )}
              </p>
            )}
          </div>
        </form>
      </section>
    </>
  );
}
