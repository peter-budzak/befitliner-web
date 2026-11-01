"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import TrainerAppHandoff from "./trainer-app-handoff";
import TrainerSitePreview from "./trainer-site-preview";
import { TrainerIntro, TrainerValue } from "./trainer-value";
import {
  fieldKeys,
  fieldLabel,
  joinCopy,
  locales,
} from "@/lib/trainer-join-copy";
const KEY = "fitliner-trainer-web-v1";
const TTL = 7 * 24 * 60 * 60 * 1000;
type Fields = Record<string, string>;
type Draft = {
  version: 1;
  at: number;
  locale: string;
  step: number;
  fields: Fields;
  offers: Fields[];
  email: string;
  request: string;
  fees: boolean;
};
const blank = (): Draft => ({
  version: 1,
  at: Date.now(),
  locale: "sk",
  step: -1,
  fields: { country: "SK", service_type: "personal", service_tax: "0" },
  offers: [],
  email: "",
  request: crypto.randomUUID(),
  fees: false,
});
export default function TrainerJoin({
  locale,
  callback = false,
}: {
  locale: string;
  callback?: boolean;
}) {
  const [draft, setDraft] = useState<Draft | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false),
    [userEmail, setUserEmail] = useState(""),
    [done, setDone] = useState(false),
    [existing, setExisting] = useState(false),
    [slugConflict, setSlugConflict] = useState(false);
  const [demo, setDemo] = useState<"booking" | "clients" | "messages" | null>(
    null,
  );
  const [slugStatus, setSlugStatus] = useState<{
    slug: string;
    state: "checking" | "available" | "taken" | "error";
  }>({ slug: "", state: "checking" });
  const slugValue = (draft?.fields.slug ?? "").trim().toLowerCase();
  useEffect(() => {
    if (draft?.step !== 1 && !slugConflict) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const { data } = await client.current!.auth.getSession();
        const response = await fetch(
          `/api/trainer-onboarding?slug=${encodeURIComponent(slugValue)}`,
          {
            cache: "no-store",
            signal: controller.signal,
            headers: data.session
              ? { Authorization: `Bearer ${data.session.access_token}` }
              : {},
          },
        );
        if (!response.ok) throw Error("check");
        const result = await response.json();
        if (!controller.signal.aborted)
          setSlugStatus({
            slug: slugValue,
            state: result.available === true ? "available" : "taken",
          });
      } catch {
        if (!controller.signal.aborted)
          setSlugStatus({ slug: slugValue, state: "error" });
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [slugValue, draft?.step, slugConflict]);
  const slugReady =
    slugStatus.slug === slugValue && slugStatus.state === "available";
  const slugMessage =
    slugStatus.slug !== slugValue
      ? "Overujem dostupnosť…"
      : slugStatus.state === "available"
        ? "Táto adresa je dostupná. Potvrdíme ju pri uložení profilu."
        : slugStatus.state === "taken"
          ? "Táto adresa je obsadená alebo nepovolená. Vyber inú."
          : slugStatus.state === "error"
            ? "Dostupnosť sa nepodarilo overiť. Skús upraviť adresu alebo obnoviť stránku."
            : "Overujem dostupnosť…";
  const [callbackReady, setCallbackReady] = useState(false);
  const autoSaveRequest = useRef<string | null>(null);
  const saving = useRef(false);
  const client = useRef<SupabaseClient | null>(null);
  const l = draft?.locale ?? locale;
  const t = joinCopy(l);
  useEffect(() => {
    let initial = blank();
    initial.locale = locale;
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (
        raw?.version === 1 &&
        Number.isFinite(raw.at) &&
        raw.at <= Date.now() &&
        Date.now() - raw.at < TTL &&
        Number.isInteger(raw.step) &&
        raw.step >= -1 &&
        raw.step <= 19 &&
        locales.includes(raw.locale) &&
        typeof raw.email === "string" &&
        typeof raw.fees === "boolean" &&
        raw.fields &&
        Array.isArray(raw.offers) &&
        raw.offers.length <= 12 &&
        typeof raw.request === "string"
      )
        initial = raw;
      else localStorage.removeItem(KEY);
    } catch {
      localStorage.removeItem(KEY);
    }
    if (!callback) initial.locale = locale;
    setDraft(initial);
    const api = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    client.current = api;
    let active = true;
    async function restore(
      session: Awaited<
        ReturnType<typeof api.auth.getSession>
      >["data"]["session"],
    ) {
      if (!active) return;
      setUserEmail(session?.user.email ?? "");
      const token = new URL(window.location.href).searchParams.get("draft");
      if (callback && token && session) {
        try {
          const r = await fetch("/api/trainer-onboarding", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ action: "web_resume", token }),
          });
          if (!r.ok) throw Error("resume");
          const result = await r.json();
          if (active && result.draft) {
            initial = result.draft;
            localStorage.setItem(KEY, JSON.stringify(result.draft));
            setDraft(result.draft);
            window.history.replaceState({}, "", window.location.pathname);
            setCallbackReady(true);
          }
        } catch {
          if (active) setError(joinCopy(locale).error);
        }
      } else if (callback && session && !token) {
        if (
          initial.offers.length &&
          initial.email.trim().toLowerCase() ===
            session.user.email?.toLowerCase()
        ) {
          setCallbackReady(true);
        } else if (
          sessionStorage.getItem("fitliner-trainer-saved-email") ===
          session.user.email?.toLowerCase()
        ) {
          setDraft({ ...initial, email: session.user.email ?? "" });
          setDone(true);
        } else {
          setError(
            "Rozpracovaný profil sa nepodarilo načítať. Otvor pôvodný odkaz z e-mailu alebo sa vráť k registrácii.",
          );
        }
      }
    }
    api.auth.getSession().then(({ data }) => restore(data.session));
    const { data } = api.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => void restore(session), 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [locale, callback]);
  function update(patch: Partial<Draft>) {
    if (!draft) return;
    const next = { ...draft, ...patch, at: Date.now() };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setDraft(next);
      setError("");
    } catch {
      setError(t.error);
    }
  }
  async function send() {
    if (!draft || !client.current) return;
    setBusy(true);
    setError("");
    try {
      const prepared = await fetch("/api/trainer-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "web_prepare",
          draft: l === "sk" ? { ...draft, fees: true } : draft,
        }),
      });
      if (!prepared.ok) throw Error("prepare");
      const { token } = await prepared.json();
      const { error } = await client.current.auth.signInWithOtp({
        email: draft.email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/trainers/join/verify?draft=${encodeURIComponent(token)}`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }
  const finish = useCallback(async () => {
    if (!draft || !client.current || saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const { data } = await client.current.auth.getSession();
      if (
        !data.session ||
        data.session.user.email?.toLowerCase() !==
          draft.email.trim().toLowerCase()
      )
        throw Error("account");
      const f = draft.fields;
      const offers = draft.offers.map((o) => ({
        name: o.service_name,
        description: o.service_description ?? "",
        price_minor: Math.round(
          Number(o.service_price.replace(",", ".")) * 100,
        ),
        currency: "eur",
        tax_rate_bps: f.vat_id
          ? Math.round(Number((o.service_tax ?? "0").replace(",", ".")) * 100)
          : 0,
        interval: o.service_type === "month" ? "month" : "once",
        booking_kind: o.service_type === "month" ? "none" : o.service_type,
      }));
      const result = await fetch("/api/trainer-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          request_id: draft.request,
          profile: {
            display_name: f.display_name,
            slug: f.slug,
            bio: f.bio ?? "",
            billing: {
              legal_name: f.legal_name,
              email: draft.email,
              country: f.country,
              address: f.address,
              city: f.city,
              postal_code: f.postal_code,
              registration_id: f.registration_id ?? "",
              tax_id: f.tax_id ?? "",
              vat_id: f.vat_id ?? "",
            },
          },
          offers,
        }),
      });
      if (!result.ok) {
        if (result.status === 409) {
          setSlugConflict(true);
          setError(t.slugError);
          return;
        }
        throw Error("save");
      }
      const payload = await result.json();
      if (!payload.complete && !payload.existing) throw Error("save");
      setExisting(payload.existing === true);
      setDone(true);
      try {
        sessionStorage.setItem(
          "fitliner-trainer-saved-email",
          draft.email.trim().toLowerCase(),
        );
        localStorage.removeItem(KEY);
      } catch {
        /* Saved on server even if local storage is unavailable. */
      }
    } catch {
      setError(t.error);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }, [draft, t.error, t.slugError]);
  useEffect(() => {
    if (
      !callback ||
      !callbackReady ||
      !draft ||
      done ||
      slugConflict ||
      !draft.offers.length ||
      userEmail.toLowerCase() !== draft.email.trim().toLowerCase() ||
      autoSaveRequest.current === draft.request
    )
      return;
    autoSaveRequest.current = draft.request;
    void finish();
  }, [callback, callbackReady, draft, done, slugConflict, userEmail, finish]);
  if (!draft)
    return (
      <main
        className="min-h-screen bg-[#111015] text-white p-10"
        aria-busy="true"
      >
        FITLINER
      </main>
    );
  const questions = fieldKeys.filter(
    (k) => k !== "service_tax" || Boolean(draft.fields.vat_id),
  );
  const key = questions[draft.step];
  const serviceStep = questions.length;
  const feeStep = serviceStep + 1;
  const emailStep = serviceStep + 2;
  const addressStep = l === "sk" && draft.step >= 3 && draft.step <= 10;
  const visibleTotal = emailStep + 1 - (l === "sk" ? 9 : 0);
  const visibleStep = Math.min(
    l === "sk"
      ? draft.step < 3
        ? draft.step + 1
        : draft.step <= 10
          ? 4
          : draft.step <= 12
            ? 5
            : draft.step - 7
      : draft.step + 1,
    visibleTotal,
  );
  const serviceDetailsStep =
    l === "sk" && (draft.step === 11 || draft.step === 12);
  const serviceNames: Record<string, string> = {
    personal: "Osobný tréning",
    none: "Online tréning",
    group: "Skupinový osobný tréning",
    month: "Mesačné predplatné – koučing",
  };
  const serviceTitle = draft.fields.service_name?.trim() || "tvoja služba";
  const billingText = (type: string) =>
    type === "month"
      ? "Účtované automaticky každý mesiac."
      : "Účtované jednorazovo.";
  const emailMatches =
    userEmail && userEmail.toLowerCase() === draft.email.trim().toLowerCase();
  const optional = [
    "bio",
    "registration_id",
    "tax_id",
    "vat_id",
    "service_description",
  ].includes(key);
  function next() {
    if (!draft) return;
    if (l === "sk" && key === "bio") {
      setDemo("clients");
      return;
    }
    if (draft.step === questions.length - 1) {
      update({
        offers: [
          ...draft.offers,
          Object.fromEntries(
            Object.entries(draft.fields).filter(([k]) =>
              k.startsWith("service_"),
            ),
          ),
        ],
        step: serviceStep,
      });
    } else update({ step: draft.step + 1 });
  }
  const control =
    "w-full rounded-2xl border border-white/20 bg-[#24202e] px-5 py-4 text-lg outline-none focus:border-[#ac85ff] focus:ring-2 focus:ring-[#ac85ff]/30";
  const button =
    "min-h-14 w-full rounded-2xl bg-[#7947ff] px-6 py-4 font-bold text-white transition hover:bg-[#8c60ff] disabled:opacity-50";
  return (
    <main className="min-h-screen bg-[#111015] text-[#f4f0ff] px-6 py-8">
      <div className="mx-auto max-w-xl">
        <header className="flex items-center justify-between gap-5">
          <Link href={`/${l}`} className="font-extrabold tracking-[.22em]">
            FITLINER
          </Link>
          <select
            aria-label="Language"
            value={l}
            onChange={(e) => update({ locale: e.target.value })}
            className="rounded-lg bg-[#24202e] p-2"
          >
            {locales.map((x) => (
              <option key={x} value={x}>
                {x === "zh-Hans" ? "中文" : x.toUpperCase()}
              </option>
            ))}
          </select>
        </header>
        <section className="pt-12 pb-10">
          {!done && !callback && draft.step >= 0 && (
            <>
              <p className="text-sm text-[#bfaaff]">
                {t.step} {visibleStep} / {visibleTotal}
              </p>
              <div
                role="progressbar"
                aria-label={t.step}
                aria-valuemin={0}
                aria-valuemax={visibleTotal}
                aria-valuenow={visibleStep}
                className="mt-3 mb-9 h-1 w-full overflow-hidden rounded-full bg-white/15"
              >
                <div
                  className="h-full bg-[#9d76ff] transition-all"
                  style={{
                    width: `${(visibleStep / visibleTotal) * 100}%`,
                  }}
                />
              </div>
            </>
          )}
          {done && l === "sk" ? (
            <TrainerAppHandoff email={draft.email} verified />
          ) : callback && l === "sk" && !slugConflict ? (
            <>
              <p role="status" className="mb-5 text-[#62dfc8]">
                {error
                  ? "Profil sa zatiaľ nepodarilo uložiť."
                  : "Overujeme e-mail a automaticky ukladáme tvoj profil…"}
              </p>
              {error && (
                <button
                  className={button}
                  disabled={busy}
                  onClick={() =>
                    callbackReady ? void finish() : window.location.reload()
                  }
                >
                  Skúsiť znova
                </button>
              )}
              <TrainerAppHandoff email={draft.email || userEmail} pendingSave />
            </>
          ) : sent && l === "sk" ? (
            <TrainerAppHandoff email={draft.email} />
          ) : done ? (
            <>
              <div className="mb-5 text-5xl text-[#62dfc8]">✓</div>
              <h1 className="text-4xl font-extrabold">{t.done}</h1>
              <p className="my-6 leading-8 text-white/70">
                {existing ? t.existing : t.doneBody}
              </p>
              <p className="mb-8 font-semibold">{draft.email}</p>
              <a
                className={`${button} block text-center`}
                href="https://apps.apple.com/app/id6760855966"
              >
                {t.download}
              </a>
              <a
                className="block py-6 text-center text-[#bfaaff]"
                href="befitliner://"
              >
                {t.open}
              </a>
              <p className="text-center text-white/45">{t.androidSoon}</p>
            </>
          ) : demo ? (
            <TrainerValue
              key={demo}
              kind={demo}
              onNext={() => {
                update({
                  step:
                    demo === "booking"
                      ? 0
                      : demo === "clients"
                        ? draft.step + 1
                        : emailStep,
                });
                setDemo(null);
              }}
            />
          ) : draft.step < 0 && l === "sk" ? (
            <TrainerIntro onNext={() => setDemo("booking")} />
          ) : draft.step < 0 ? (
            <>
              <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7c4dff]/20 text-3xl text-[#bc9cff]">
                ✦
              </div>
              <h1 className="text-4xl font-extrabold leading-tight">
                {t.intro}
              </h1>
              <p className="my-7 text-lg leading-8 text-white/65">
                {t.introBody}
              </p>
              <button className={button} onClick={() => update({ step: 0 })}>
                {t.start} →
              </button>
            </>
          ) : addressStep ? (
            <form
              autoComplete="on"
              onChange={(event) => {
                const values = Object.fromEntries(
                  new FormData(event.currentTarget).entries(),
                ) as Fields;
                update({
                  fields: {
                    ...draft.fields,
                    ...values,
                    country: (
                      values.country ?? draft.fields.country
                    ).toUpperCase(),
                  },
                });
              }}
              onSubmit={(event) => {
                event.preventDefault();
                const values = Object.fromEntries(
                  new FormData(event.currentTarget).entries(),
                ) as Fields;
                update({
                  fields: {
                    ...draft.fields,
                    ...values,
                    country: values.country.trim().toUpperCase(),
                  },
                  step: questions.indexOf("service_name"),
                });
              }}
            >
              <h1 className="text-3xl font-extrabold leading-tight">
                Vyplň svoju adresu
              </h1>
              <p className="mb-8 mt-3 text-white/60">
                V budúcnosti to môžeš zmeniť v profile.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  {
                    name: "legal_name",
                    label: "Meno a priezvisko / obchodné meno",
                    auto: "billing organization",
                    max: 150,
                    wide: true,
                  },
                  {
                    name: "address",
                    label: "Ulica a číslo",
                    auto: "billing address-line1",
                    max: 200,
                    wide: true,
                  },
                  {
                    name: "city",
                    label: "Mesto",
                    auto: "billing address-level2",
                    max: 100,
                    wide: false,
                  },
                  {
                    name: "postal_code",
                    label: "PSČ",
                    auto: "billing postal-code",
                    max: 20,
                    wide: false,
                  },
                  {
                    name: "country",
                    label: "Kód krajiny",
                    auto: "billing country",
                    max: 2,
                    wide: false,
                  },
                ].map((field) => (
                  <div
                    key={field.name}
                    className={field.wide ? "sm:col-span-2" : ""}
                  >
                    <label
                      htmlFor={`billing-${field.name}`}
                      className="mb-2 block text-sm font-medium text-white/80"
                    >
                      {field.label}
                    </label>
                    <input
                      id={`billing-${field.name}`}
                      name={field.name}
                      autoComplete={field.auto}
                      required
                      maxLength={field.max}
                      defaultValue={draft.fields[field.name] ?? ""}
                      className={control}
                      pattern={
                        field.name === "country" ? "[A-Za-z]{2}" : undefined
                      }
                      placeholder={field.name === "country" ? "SK" : undefined}
                    />
                    {field.name === "country" && (
                      <p className="mt-2 text-xs text-white/45">
                        Napr. SK — Slovensko, CZ — Česko.
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <fieldset className="mt-8 rounded-2xl border border-white/10 p-5">
                <legend className="px-2 text-sm font-semibold text-[#c3a6ff]">
                  Firemné údaje · voliteľné
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["registration_id", "IČO"],
                    ["tax_id", "DIČ"],
                    ["vat_id", "IČ DPH"],
                  ].map(([name, label]) => (
                    <div key={name}>
                      <label
                        htmlFor={`billing-${name}`}
                        className="mb-2 block text-sm text-white/80"
                      >
                        {label}
                      </label>
                      <input
                        id={`billing-${name}`}
                        name={name}
                        autoComplete="off"
                        maxLength={50}
                        defaultValue={draft.fields[name] ?? ""}
                        className={control}
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
              <button className={`${button} mt-8`}>{t.next} →</button>
            </form>
          ) : serviceDetailsStep ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                update({ step: questions.indexOf("service_type") });
              }}
            >
              <h1 className="mb-6 text-3xl font-extrabold">
                <label htmlFor="service-name">
                  {draft.offers.length
                    ? "Ako sa bude volať tvoja ďalšia služba?"
                    : "Ako sa bude volať tvoja prvá služba?"}
                </label>
              </h1>
              <input
                id="service-name"
                autoFocus
                required
                maxLength={120}
                className={control}
                placeholder="Napr.: Osobný tréning"
                value={draft.fields.service_name ?? ""}
                onChange={(event) =>
                  update({
                    fields: {
                      ...draft.fields,
                      service_name: event.target.value,
                    },
                  })
                }
              />
              <label
                htmlFor="service-description"
                className="mb-3 mt-8 block text-xl font-semibold"
              >
                Čo klient za túto službu získa?
              </label>
              <textarea
                id="service-description"
                rows={5}
                maxLength={1500}
                className={control}
                placeholder="60 minút môjho osobného dohľadu vo fitnesscentre."
                value={draft.fields.service_description ?? ""}
                onChange={(event) =>
                  update({
                    fields: {
                      ...draft.fields,
                      service_description: event.target.value,
                    },
                  })
                }
              />
              <button className={`${button} mt-8`}>{t.next} →</button>
            </form>
          ) : key ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (key !== "slug" || slugReady) next();
              }}
            >
              <h1 className="mb-7 text-3xl font-extrabold leading-tight">
                <label htmlFor="answer">
                  {l === "sk" && key === "service_type"
                    ? `Ako bude ${serviceTitle} fungovať?`
                    : l === "sk" && key === "service_price"
                      ? `Koľko bude ${serviceTitle} stáť?`
                      : fieldLabel(l, key)}
                </label>
              </h1>
              {key === "bio" && l === "sk" && (
                <div className="mb-6 space-y-2">
                  <p className="text-white/75">
                    Tento text sa zobrazí na tvojom webe{" "}
                    <span className="break-all font-medium text-[#c3a5ff]">
                      befitliner.com/{draft.fields.slug || "tvojemeno"}
                    </span>
                    .
                  </p>
                  <p className="text-sm text-white/50">
                    Tento text môžeš kedykoľvek meniť v nastaveniach.
                  </p>
                </div>
              )}
              {optional && <p className="mb-3 text-white/50">{t.optional}</p>}
              {key === "service_type" ? (
                <div className="grid gap-3" aria-label={fieldLabel(l, key)}>
                  {(l === "sk"
                    ? ["personal", "none", "group", "month"]
                    : ["personal", "group", "none", "month"]
                  ).map((value, i) => (
                    <button
                      type="button"
                      key={value}
                      className={`${control} text-left hover:border-[#ac85ff]`}
                      onClick={() =>
                        update({
                          fields: { ...draft.fields, service_type: value },
                          step: draft.step + 1,
                        })
                      }
                    >
                      {l === "sk"
                        ? serviceNames[value]
                        : [t.personal, t.group, t.online, t.monthly][i]}{" "}
                      →
                    </button>
                  ))}
                </div>
              ) : l === "sk" && key === "service_price" ? (
                <>
                  <div className="relative">
                    <input
                      id="answer"
                      autoFocus
                      required
                      type="number"
                      min={0.5}
                      max={100000}
                      step="0.01"
                      inputMode="decimal"
                      className={`${control} pr-14`}
                      value={draft.fields.service_price ?? ""}
                      onChange={(event) =>
                        update({
                          fields: {
                            ...draft.fields,
                            service_price: event.target.value,
                          },
                        })
                      }
                      aria-describedby="service-billing"
                    />
                    <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl text-[#c6a6ff]">
                      €
                    </span>
                  </div>
                  <p
                    id="service-billing"
                    className="mt-4 text-sm text-white/60"
                  >
                    {billingText(draft.fields.service_type)}
                  </p>
                </>
              ) : ["bio", "service_description"].includes(key) ? (
                <textarea
                  id="answer"
                  autoFocus
                  rows={5}
                  placeholder={
                    l === "sk" && key === "bio"
                      ? "Som Peter, osobný tréner. Pomáham ľuďom získať silu, zlepšiť kondíciu a cítiť sa lepšie. Špecializujem sa na silový tréning a zdravý pohyb. Tréning prispôsobím tvojim cieľom aj skúsenostiam. Spolu nájdeme cestu, ktorá ti bude vyhovovať."
                      : undefined
                  }
                  maxLength={key === "bio" ? 3000 : 1500}
                  className={control}
                  value={draft.fields[key] ?? ""}
                  onChange={(e) =>
                    update({
                      fields: { ...draft.fields, [key]: e.target.value },
                    })
                  }
                />
              ) : (
                <input
                  key={key}
                  id="answer"
                  autoFocus
                  required={!optional}
                  className={control}
                  value={draft.fields[key] ?? ""}
                  onChange={(e) =>
                    update({
                      fields: {
                        ...draft.fields,
                        [key]:
                          key === "country"
                            ? e.target.value.toUpperCase()
                            : e.target.value,
                      },
                    })
                  }
                  type={
                    ["service_price", "service_tax"].includes(key)
                      ? "number"
                      : "text"
                  }
                  step="0.01"
                  min={key === "service_price" ? 0.5 : 0}
                  max={
                    key === "service_price"
                      ? 100000
                      : key === "service_tax"
                        ? 30
                        : undefined
                  }
                  minLength={key === "slug" ? 3 : undefined}
                  maxLength={
                    key === "country"
                      ? 2
                      : key === "slug"
                        ? 64
                        : ["display_name", "city"].includes(key)
                          ? 100
                          : key === "postal_code"
                            ? 20
                            : key === "address"
                              ? 200
                              : key === "service_name"
                                ? 120
                                : [
                                      "registration_id",
                                      "tax_id",
                                      "vat_id",
                                    ].includes(key)
                                  ? 50
                                  : 150
                  }
                  pattern={
                    key === "country"
                      ? "[A-Z]{2}"
                      : key === "slug"
                        ? "[a-z][a-z0-9]+(?:-[a-z0-9]+)*"
                        : undefined
                  }
                  placeholder={
                    key === "slug"
                      ? "peterkocis"
                      : key === "country"
                        ? "SK / CZ / DE"
                        : undefined
                  }
                />
              )}
              {key === "bio" && l === "sk" && (
                <TrainerSitePreview
                  name={draft.fields.display_name ?? ""}
                  slug={draft.fields.slug ?? ""}
                  bio={draft.fields.bio ?? ""}
                />
              )}
              {key === "slug" && (
                <p className="mt-3 break-all text-sm text-[#bfaaff]">
                  befitliner.com/{draft.fields.slug || "…"}
                  <span role="status" className="mt-2 block">
                    {slugMessage}
                  </span>
                </p>
              )}
              {key !== "service_type" && (
                <div className="mt-9">
                  <button
                    className={button}
                    disabled={key === "slug" && !slugReady}
                  >
                    {t.next} →
                  </button>
                </div>
              )}
            </form>
          ) : draft.step === serviceStep ? (
            <>
              <h1 className="mb-7 text-3xl font-extrabold">{t.services}</h1>
              {l === "sk" && (
                <p className="mb-6 leading-7 text-white/60">
                  Vo Fitlineri si môžeš kedykoľvek pridať neobmedzený počet
                  svojich služieb, ktoré sa zobrazia na tvojej stránke. V tomto
                  úvodnom nastavení môžeš pripraviť najviac 12 služieb.
                </p>
              )}
              <div className="space-y-3">
                {draft.offers.map((o, i) => (
                  <div key={i} className="rounded-2xl bg-[#24202e] p-5">
                    <strong>{o.service_name}</strong>
                    {l === "sk" && (
                      <>
                        <p className="mt-2 text-sm text-[#c5a5ff]">
                          {serviceNames[o.service_type]}
                        </p>
                        {o.service_description && (
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-white/65">
                            {o.service_description}
                          </p>
                        )}
                      </>
                    )}
                    <p className="mt-4 text-xl font-bold text-[#bfaaff]">
                      {o.service_price} €
                      {o.service_type === "month" && l === "sk" && (
                        <span className="text-sm font-normal"> / mesiac</span>
                      )}
                    </p>
                    {l === "sk" && (
                      <>
                        <p className="mt-2 text-sm text-white/60">
                          {billingText(o.service_type)}
                        </p>
                        {draft.fields.vat_id && (
                          <p className="mt-1 text-xs text-white/45">
                            DPH: {o.service_tax || "0"} %
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              <button
                disabled={draft.offers.length >= 12}
                className="my-5 w-full rounded-2xl border border-white/20 p-4"
                onClick={() =>
                  update({
                    fields: {
                      ...draft.fields,
                      service_name: "",
                      service_description: "",
                      service_price: "",
                      service_type: "personal",
                      service_tax: "0",
                    },
                    step: questions.indexOf("service_name"),
                  })
                }
              >
                + {t.add}
              </button>
              <button
                className={button}
                onClick={() =>
                  l === "sk" ? setDemo("messages") : update({ step: feeStep })
                }
              >
                {t.next} →
              </button>
            </>
          ) : draft.step === feeStep && l !== "sk" ? (
            <>
              <h1 className="text-3xl font-extrabold">{t.fees}</h1>
              <p className="my-7 leading-8 text-white/70">{t.feesBody}</p>
              <label className="mb-7 flex gap-4">
                <input
                  type="checkbox"
                  checked={draft.fees}
                  onChange={(e) => update({ fees: e.target.checked })}
                />
                {t.confirm}
              </label>
              <button
                className={button}
                disabled={!draft.fees}
                onClick={() => update({ step: emailStep })}
              >
                {t.next} →
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold">
                {emailMatches ? t.confirmed : t.email}
              </h1>
              <p className="my-6 leading-7 text-white/65">
                {emailMatches && l === "sk"
                  ? "Tvoj e-mail je overený. Údaje z dotazníka sú pripravené — už len ulož svoj trénerský profil."
                  : t.emailBody}
              </p>
              {emailMatches ? (
                <>
                  <p className="mb-6 text-[#62dfc8]">{userEmail}</p>
                  {slugConflict && (
                    <label className="mb-6 block">
                      {l === "sk"
                        ? "Vybraná adresa už nie je dostupná. Zvoľ náhradnú:"
                        : fieldLabel(l, "slug")}
                      <input
                        className={control}
                        value={draft.fields.slug ?? ""}
                        onChange={(e) =>
                          update({
                            fields: { ...draft.fields, slug: e.target.value },
                          })
                        }
                      />
                      <span role="status" className="mt-2 block text-sm">
                        {slugMessage}
                      </span>
                    </label>
                  )}
                  {!slugConflict && (
                    <p className="mb-5 break-all text-sm text-white/65">
                      Tvoja stránka:{" "}
                      <strong>befitliner.com/{draft.fields.slug}</strong>
                    </p>
                  )}
                  <button
                    disabled={
                      busy ||
                      (l !== "sk" && !draft.fees) ||
                      !draft.offers.length ||
                      (slugConflict && !slugReady)
                    }
                    className={button}
                    onClick={finish}
                  >
                    {busy ? "…" : t.finish}
                  </button>
                  {l === "sk" && (
                    <p className="mt-4 text-center text-xs leading-5 text-white/45">
                      Registráciou súhlasíš s{" "}
                      <Link
                        href="/sk/terms"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#bfaaff] underline"
                      >
                        VOP
                      </Link>{" "}
                      a berieš na vedomie{" "}
                      <Link
                        href="/sk/privacy"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#bfaaff] underline"
                      >
                        zásady ochrany osobných údajov (GDPR)
                      </Link>
                      .
                    </p>
                  )}
                  {l === "sk" && (
                    <div className="mt-10 border-t border-white/10 pt-8">
                      <TrainerAppHandoff email={draft.email} pendingSave />
                    </div>
                  )}
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <input
                    aria-label={t.email}
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                    className={control}
                    value={draft.email}
                    onChange={(e) => {
                      setSent(false);
                      update({ email: e.target.value });
                    }}
                  />
                  <button
                    disabled={busy || sent || (l !== "sk" && !draft.fees)}
                    className={`${button} mt-6`}
                  >
                    {busy ? "…" : t.send}
                  </button>
                  {l === "sk" && (
                    <p className="mt-4 text-center text-xs leading-5 text-white/45">
                      Registráciou súhlasíš s{" "}
                      <Link
                        href="/sk/terms"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#bfaaff] underline"
                      >
                        VOP
                      </Link>{" "}
                      a berieš na vedomie{" "}
                      <Link
                        href="/sk/privacy"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#bfaaff] underline"
                      >
                        zásady ochrany osobných údajov (GDPR)
                      </Link>
                      .
                    </p>
                  )}
                  {sent && (
                    <>
                      <p role="status" className="mt-6 text-[#62dfc8]">
                        {t.sent}
                      </p>
                      <p className="mt-3 text-white/60">{t.sameBrowser}</p>
                    </>
                  )}
                </form>
              )}
              {userEmail && (
                <button
                  className="mt-5 text-[#bfaaff]"
                  onClick={async () => {
                    await client.current?.auth.signOut();
                    setSent(false);
                  }}
                >
                  {t.signOut}
                </button>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="mt-5 text-red-300">
              {error}
            </p>
          )}
          {!done && !callback && (draft.step > 0 || demo) && (
            <button
              disabled={busy}
              className="mt-7 py-3 text-white/60"
              onClick={() => {
                setSent(false);
                if (demo) {
                  setDemo(null);
                  return;
                }
                if (draft.step === serviceStep) {
                  const last = draft.offers.at(-1);
                  update({
                    fields: { ...draft.fields, ...last },
                    offers: draft.offers.slice(0, -1),
                    step: questions.length - 1,
                  });
                } else
                  update({
                    step:
                      l === "sk" && draft.step >= emailStep
                        ? serviceStep
                        : l === "sk" && draft.step === feeStep
                          ? serviceStep
                          : addressStep
                            ? 2
                            : serviceDetailsStep
                              ? 3
                              : l === "sk" && draft.step === 13
                                ? 11
                                : draft.step - 1,
                  });
              }}
            >
              ← {t.back}
            </button>
          )}
        </section>
        <footer className="border-t border-white/10 pt-6 text-xs leading-6 text-white/45">
          {!done && !callback && draft.step >= 0 && !demo && <p>{t.saved}</p>}
          <div className="flex justify-between gap-4">
            <Link href={`/${l}/privacy`}>{t.privacy}</Link>
            <button
              onClick={() => {
                localStorage.removeItem(KEY);
                const next = blank();
                next.locale = l;
                setDraft(next);
                setDone(false);
                setSent(false);
                setDemo(null);
              }}
            >
              {t.clear}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
