"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { ADMIN_EMAIL, adminClient } from "@/lib/admin/client";
import {
  currentMonth,
  date,
  downloadCsv,
  money,
  needsShipping,
  PAYMENT_LABELS,
  SHIPPING_LABELS,
  totals,
} from "@/lib/admin/metrics";
import type { Dashboard, Gym, ModuleOrder } from "@/lib/admin/types";

type Tab = "overview" | "gyms" | "orders" | "finance" | "leads" | "activity";
const NAV: [Tab, string, string][] = [
  ["overview", "Prehľad", "grid"],
  ["gyms", "Gymy", "gym"],
  ["orders", "Objednávky", "box"],
  ["finance", "Financie", "chart"],
  ["leads", "Záujemcovia", "users"],
  ["activity", "História zmien", "clock"],
];
function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    gym: (
      <>
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h1m4 0h1M9 12h1m4 0h1" />
      </>
    ),
    box: (
      <>
        <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4M12 11v10M7 5l10 4" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v18h17M8 16v-5m5 5V7m5 9V4" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H4v16h5M9 12h12m-4-4 4 4-4 4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.grid}
    </svg>
  );
}
function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className={`ad-badge ad-${tone}`}>
      <i />
      {children}
    </span>
  );
}
function PaymentBadge({ status }: { status: string }) {
  return (
    <Badge
      tone={
        status === "paid"
          ? "green"
          : ["refunded", "disputed"].includes(status)
            ? "red"
            : "amber"
      }
    >
      {PAYMENT_LABELS[status] || status}
    </Badge>
  );
}
function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="ad-empty">
      <Icon name="box" />
      <p>{children}</p>
    </div>
  );
}
function Stat({
  title,
  value,
  hint,
  icon,
  accent,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: string;
  accent?: boolean;
}) {
  return (
    <div className={`ad-stat ${accent ? "ad-stat-accent" : ""}`}>
      <div className="ad-stat-top">
        {title}
        <Icon name={icon} />
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}
function Login({
  message,
  onSession,
}: {
  message: string;
  onSession: (session: Session) => void;
}) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(message);
  const [sent, setSent] = useState(false);
  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data, error } = await adminClient().auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });
      if (error || !data.session)
        throw new Error(
          "Prihlásenie sa nepodarilo. Skontrolujte heslo svojho Fitliner účtu.",
        );
      onSession(data.session);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function magicLink() {
    setBusy(true);
    setError("");
    try {
      const { error } = await adminClient().auth.signInWithOtp({
        email: ADMIN_EMAIL,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error)
        throw new Error(
          "Odkaz sa nepodarilo odoslať. Skúste to o chvíľu alebo použite heslo.",
        );
      setSent(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="ad-login">
      <section className="ad-login-story">
        <a href="https://www.befitliner.com" className="ad-brand">
          <span className="ad-logo">f</span>fitliner
          <span className="ad-brand-tag">ADMIN</span>
        </a>
        <div>
          <span className="ad-eyebrow">FITLINER CONTROL CENTER</span>
          <h1>
            Všetky gymy.
            <br />
            Jeden prehľad.
          </h1>
          <p>
            Od prvej objednávky až po aktívny gym.
            <br />
            Miesto, kde máte Fitliner pod kontrolou.
          </p>
          <div className="ad-login-features">
            <span>
              <Icon name="gym" />
              Gymy a moduly
            </span>
            <span>
              <Icon name="box" />
              Objednávky a expedícia
            </span>
            <span>
              <Icon name="chart" />
              Obrat a provízie
            </span>
          </div>
        </div>
        <small>Interné rozhranie · Fitliner</small>
      </section>
      <section className="ad-login-panel">
        <div className="ad-login-form">
          <span className="ad-eyebrow">VITAJTE SPÄŤ</span>
          <h2>Prihlásenie do administrácie</h2>
          <p>Použite svoj existujúci Fitliner účet.</p>
          <form onSubmit={signIn}>
            <label>
              E-mail
              <input
                type="email"
                value={ADMIN_EMAIL}
                readOnly
                autoComplete="username"
              />
            </label>
            <label>
              Heslo
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="Vaše heslo"
              />
            </label>
            {error && (
              <p role="alert" className="ad-error">
                {error}
              </p>
            )}
            <button className="ad-button ad-primary" disabled={busy}>
              {busy ? "Prihlasujem…" : "Prihlásiť sa"}
              <Icon name="arrow" />
            </button>
          </form>
          <div className="ad-login-divider">alebo</div>
          <button
            className="ad-button ad-wide"
            onClick={magicLink}
            disabled={busy || sent}
          >
            {sent
              ? "Prihlasovací odkaz bol odoslaný"
              : "Poslať prihlasovací odkaz e-mailom"}
          </button>
          {sent && (
            <p role="status">
              Otvorte odkaz v tomto prehliadači. Platnosť odkazu je obmedzená.
            </p>
          )}
          <small className="ad-login-note">
            Prístup je vyhradený pre overený administrátorský účet.
          </small>
        </div>
      </section>
    </main>
  );
}

export default function AdminConsole() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [month, setMonth] = useState(currentMonth);
  const [currency, setCurrency] = useState("EUR");
  const [query, setQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [gymId, setGymId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    try {
      const client = adminClient();
      client.auth
        .getSession()
        .then(({ data }) => {
          setSession(data.session);
          setInitializing(false);
        })
        .catch(() => {
          setError("Prihlásenie sa nepodarilo načítať.");
          setInitializing(false);
        });
      const { data: listener } = client.auth.onAuthStateChange(
        (_event, value) => {
          setSession(value);
          if (!value) {
            generation.current++;
            setData(null);
          }
        },
      );
      return () => listener.subscription.unsubscribe();
    } catch (e) {
      setError((e as Error).message);
      setInitializing(false);
    }
  }, []);
  const load = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const { data, error } = await adminClient().rpc("gym_admin_dashboard", {
        p_month: month + "-01",
      });
      if (error)
        throw new Error(
          error.code === "42501"
            ? "Tento účet nemá prístup do administrácie."
            : "Údaje sa nepodarilo načítať. Skontrolujte pripojenie a skúste obnoviť.",
        );
      if (generation.current === request) setData(data as Dashboard);
    } catch (e) {
      if (generation.current === request) setError((e as Error).message);
    } finally {
      if (generation.current === request) setLoading(false);
    }
  }, [month]);
  useEffect(() => {
    if (session) void load();
  }, [session, load]);
  async function signOut() {
    generation.current++;
    setData(null);
    setSession(null);
    await adminClient().auth.signOut({ scope: "local" });
  }
  async function sync() {
    setSyncing(true);
    setError("");
    setNotice("");
    try {
      const { data, error } = await adminClient().functions.invoke(
        "admin-gym-orders",
        { body: { action: "sync" } },
      );
      if (error || data?.error)
        throw new Error(
          data?.error ||
            "Stripe synchronizácia sa nepodarila. Skúste to znova.",
        );
      setNotice(
        data.has_more
          ? `Načítaných ${data.imported} checkoutov. Pokračujte ďalšou synchronizáciou; zostávajú staršie záznamy.`
          : `Synchronizácia dokončená. Spracovaných checkoutov: ${data.imported}.`,
      );
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSyncing(false);
    }
  }
  function navigate(next: Tab) {
    setTab(next);
    setGymId(null);
    setOrderId(null);
    setQuery("");
    setPage(1);
    setOrderFilter("all");
    setNotice("");
  }
  function openOrders(filter: string) {
    navigate("orders");
    setOrderFilter(filter);
  }
  async function saved() {
    setNotice("Zmeny boli uložené.");
    await load();
  }
  if (initializing)
    return (
      <div className="ad-loading" role="status">
        Načítavam administráciu…
      </div>
    );
  if (!session)
    return (
      <div className="ad-root">
        <Login message={error} onSession={setSession} />
      </div>
    );
  const currencies = Array.from(
    new Set([
      "EUR",
      ...(data
        ? [...data.finance, ...data.module_finance]
            .map((r) => r.currency)
            .filter((c) => /^[A-Z]{3}$/.test(c))
        : []),
    ]),
  ).sort();
  const selected = data ? totals(data.finance, currency, month) : null;
  const lifetime = data ? totals(data.finance, currency) : null;
  const moduleSales = (data?.module_finance || [])
    .filter((r) => r.currency === currency && r.month.startsWith(month))
    .reduce((sum, r) => sum + r.gross_minor - r.refunded_minor, 0);
  const allModuleSales = (data?.module_finance || [])
    .filter((r) => r.currency === currency)
    .reduce((sum, r) => sum + r.gross_minor - r.refunded_minor, 0);
  const waiting = data?.orders.filter(needsShipping) || [];
  const gym = data?.gyms.find((g) => g.id === gymId);
  const order = data?.orders.find((o) => o.id === orderId);
  const filteredGyms =
    data?.gyms.filter((g) =>
      `${g.name} ${g.address || ""} ${g.owner_email || ""} ${g.contact_email || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ) || [];
  const filteredOrders =
    data?.orders.filter((o) => {
      const match =
        `${o.customer_name || ""} ${o.customer_email || ""} ${o.tracking_number} ${o.stripe_session_id} ${data.gyms.find((g) => g.id === o.gym_id)?.name || ""}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return (
        match &&
        (orderFilter === "all" ||
          (orderFilter === "shipping"
            ? needsShipping(o)
            : orderFilter === "unassigned"
              ? !o.gym_id
              : o.payment_status === orderFilter ||
                o.fulfillment_status === orderFilter))
      );
    }) || [];
  function exportFinance() {
    if (!data) return;
    downloadCsv(`fitliner-financie-${month}-${currency}.csv`, [
      [
        "Gym",
        "Mesiac",
        "Mena",
        "Obrat",
        "Vrátené",
        "Provízia",
        "Vrátená provízia",
        "Platby bez provízie",
      ],
      ...data.finance
        .filter((r) => r.currency === currency && r.month.startsWith(month))
        .map((r) => [
          data.gyms.find((g) => g.id === r.gym_id)?.name || r.gym_id,
          r.month,
          r.currency,
          r.gross_minor / 100,
          r.refunds_minor / 100,
          r.fee_minor / 100,
          r.fee_refunds_minor / 100,
          r.unknown_fee_count,
        ]),
    ]);
  }
  return (
    <div className="ad-root ad-shell">
      <aside className="ad-sidebar">
        <Link href="/admin" className="ad-brand">
          <span className="ad-logo">f</span>fitliner
          <span className="ad-brand-tag">ADMIN</span>
        </Link>
        <span className="ad-nav-caption">PRACOVNÝ PRIESTOR</span>
        <nav aria-label="Administrácia">
          {NAV.map(([key, label, icon]) => (
            <button
              key={key}
              className={tab === key ? "is-active" : ""}
              onClick={() => navigate(key)}
              aria-current={tab === key ? "page" : undefined}
            >
              <Icon name={icon} />
              {label}
              {key === "orders" && waiting.length > 0 && (
                <b>{waiting.length}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="ad-sidebar-bottom">
          <div className="ad-system">
            <i />
            Fitliner operations<span>Správa platformy</span>
          </div>
          <div className="ad-user">
            <span>PB</span>
            <div>
              <strong>Peter Budzák</strong>
              <small>Administrátor</small>
            </div>
            <button
              onClick={signOut}
              aria-label="Odhlásiť sa"
              title="Odhlásiť sa"
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>
      <div className="ad-workspace">
        <header className="ad-topbar">
          <span>
            Fitliner <span className="ad-slash">/</span>{" "}
            {NAV.find((n) => n[0] === tab)?.[1]}
          </span>
          <div>
            <span className="ad-live-dot" /> Interná administrácia{" "}
            <span className="ad-avatar">PB</span>
          </div>
        </header>
        <main className="ad-main">
          <div className="ad-page-heading">
            <div>
              <span className="ad-eyebrow">
                {tab === "overview"
                  ? "VÁŠ BIZNIS V KOCKE"
                  : "FITLINER OPERATIONS"}
              </span>
              <h1>
                {gym
                  ? gym.name
                  : order
                    ? "Detail objednávky"
                    : NAV.find((n) => n[0] === tab)?.[1]}
              </h1>
              <p>
                {tab === "overview"
                  ? "Gymy, objednávky a výsledky. Všetko na jednom mieste."
                  : tab === "finance"
                    ? "Skutočne evidované platby a provízie, mesiac po mesiaci."
                    : tab === "orders"
                      ? "Od otvoreného checkoutu až po doručený modul."
                      : tab === "gyms"
                        ? "Vaše fitnesscentrá, ich členovia a aktívne moduly."
                        : tab === "leads"
                          ? "Kontakty z formulára kompatibility na webe."
                          : "Kto, kedy a čo zmenil v administrácii."}
              </p>
            </div>
            <div className="ad-heading-actions">
              <button className="ad-button" onClick={load} disabled={loading}>
                <Icon name="refresh" />
                {loading ? "Načítavam…" : "Obnoviť"}
              </button>
              {["overview", "finance"].includes(tab) && (
                <>
                  <label className="ad-sr-only" htmlFor="ad-month">
                    Mesiac prehľadu
                  </label>
                  <input
                    id="ad-month"
                    aria-label="Mesiac prehľadu"
                    type="month"
                    value={month}
                    onChange={(e) => {
                      if (e.target.value) setMonth(e.target.value);
                    }}
                  />
                  <select
                    aria-label="Mena prehľadu"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {currencies.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
          {error && (
            <div className="ad-alert ad-alert-error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="ad-alert" role="status">
              <Icon name="check" />
              {notice}
            </div>
          )}
          {data && !data.sync.last_success_at && (
            <div className="ad-alert ad-alert-pending" role="status">
              <Icon name="clock" />
              Objednávky zo Stripe ešte nie sú úplne načítané. Počty objednávok
              a výnosy z modulov zatiaľ nie sú úplné.
            </div>
          )}
          {!data ? (
            <div className="ad-panel">
              <Empty>
                {loading
                  ? "Načítavam údaje z Fitlineru…"
                  : "Údaje nie sú dostupné. Skúste ich obnoviť."}
              </Empty>
            </div>
          ) : (
            <>
              {gym ? (
                <GymDetail
                  key={`${gym.id}-${gym.note_updated_at}`}
                  gym={gym}
                  data={data}
                  currency={currency}
                  month={month}
                  onBack={() => setGymId(null)}
                  onSaved={saved}
                  onOrder={(id) => {
                    setGymId(null);
                    setOrderId(id);
                    setTab("orders");
                  }}
                />
              ) : order ? (
                <OrderDetail
                  key={`${order.id}-${order.revision}`}
                  order={order}
                  gyms={data.gyms}
                  onBack={() => setOrderId(null)}
                  onSaved={saved}
                />
              ) : (
                <>
                  {tab === "overview" && (
                    <>
                      <div className="ad-stats">
                        <Stat
                          title="Gymy vo Fitlineri"
                          value={data.gyms.length}
                          hint={`${data.gyms.filter((g) => g.modules_active > 0).length} s aktívnym modulom`}
                          icon="gym"
                        />
                        <Stat
                          title="Na odoslanie"
                          value={
                            data.sync.last_success_at ? waiting.length : "—"
                          }
                          hint={
                            data.sync.last_success_at
                              ? "Zaplatené objednávky na vybavenie"
                              : "Čaká na prvú synchronizáciu Stripe"
                          }
                          icon="box"
                        />
                        <Stat
                          title="Obrat gymov za mesiac"
                          value={money(selected!.gross, currency)}
                          hint={`${selected!.payments} evidovaných platieb`}
                          icon="chart"
                        />
                        <Stat
                          title="Provízie Fitlineru"
                          value={money(
                            selected!.fees - selected!.feeRefunds,
                            currency,
                          )}
                          hint={
                            selected!.unknown
                              ? `${selected!.unknown} platieb bez údaja o provízii`
                              : "Za vybraný mesiac, po vrátení provízií"
                          }
                          icon="chart"
                          accent
                        />
                      </div>
                      <div className="ad-overview-grid">
                        <section className="ad-panel">
                          <div className="ad-panel-heading">
                            <div>
                              <h2>Vývoj obratu</h2>
                              <p>Posledných 6 mesiacov · {currency}</p>
                            </div>
                            <Badge>Platby v aplikácii</Badge>
                          </div>
                          <RevenueChart
                            data={data}
                            month={month}
                            currency={currency}
                            onMonth={setMonth}
                          />
                        </section>
                        <section className="ad-panel ad-tasks">
                          <div className="ad-panel-heading">
                            <div>
                              <h2>Vyžaduje pozornosť</h2>
                              <p>Najbližšie kroky pre váš tím</p>
                            </div>
                            <Icon name="clock" />
                          </div>
                          <button onClick={() => openOrders("shipping")}>
                            <span className="ad-task-icon">
                              <Icon name="box" />
                            </span>
                            <span>
                              <strong>Pripraviť na odoslanie</strong>
                              <small>Zaplatené, čakajú na expedíciu</small>
                            </span>
                            <b>{waiting.length}</b>
                            <Icon name="arrow" />
                          </button>
                          <button onClick={() => openOrders("unpaid")}>
                            <span className="ad-task-icon ad-task-amber">
                              <Icon name="clock" />
                            </span>
                            <span>
                              <strong>Nedokončená platba</strong>
                              <small>Otvorené Stripe checkouty</small>
                            </span>
                            <b>
                              {
                                data.orders.filter(
                                  (o) => o.payment_status === "unpaid",
                                ).length
                              }
                            </b>
                            <Icon name="arrow" />
                          </button>
                          <button onClick={() => openOrders("unassigned")}>
                            <span className="ad-task-icon">
                              <Icon name="gym" />
                            </span>
                            <span>
                              <strong>Priradiť ku gymu</strong>
                              <small>Objednávky bez prepojenia</small>
                            </span>
                            <b>{data.orders.filter((o) => !o.gym_id).length}</b>
                            <Icon name="arrow" />
                          </button>
                          <div className="ad-lifetime">
                            <span>Evidované provízie za celé obdobie</span>
                            <strong>
                              {money(
                                lifetime!.fees - lifetime!.feeRefunds,
                                currency,
                              )}
                            </strong>
                            <small>
                              {lifetime!.unknown
                                ? `${lifetime!.unknown} starších platieb bez údaja o provízii.`
                                : "Pred nákladmi a daňami."}
                            </small>
                          </div>
                        </section>
                      </div>
                      <section className="ad-panel">
                        <div className="ad-panel-heading">
                          <div>
                            <h2>Posledné objednávky</h2>
                            <p>Platba a doručenie pod kontrolou</p>
                          </div>
                          <button
                            className="ad-text-button"
                            onClick={() => navigate("orders")}
                          >
                            Všetky objednávky
                            <Icon name="arrow" />
                          </button>
                        </div>
                        <OrdersTable
                          orders={data.orders.slice(0, 5)}
                          gyms={data.gyms}
                          onOpen={setOrderId}
                        />
                      </section>
                      <Coverage data={data} />
                    </>
                  )}
                  {tab === "gyms" && (
                    <section className="ad-panel">
                      <div className="ad-toolbar">
                        <Search
                          value={query}
                          onChange={(v) => {
                            setQuery(v);
                            setPage(1);
                          }}
                          placeholder="Názov gymu, e-mail alebo adresa"
                        />
                        <span>{filteredGyms.length} gymov</span>
                      </div>
                      <div className="ad-table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Fitnesscentrum</th>
                              <th>Členovia</th>
                              <th>Moduly</th>
                              <th>Objednané / zaplatené</th>
                              <th>Poplatok Fitliner</th>
                              <th>Platby kartou</th>
                              <th />
                            </tr>
                          </thead>
                          <tbody>
                            {filteredGyms
                              .slice((page - 1) * 25, page * 25)
                              .map((g) => (
                                <tr key={g.id}>
                                  <td>
                                    <button
                                      className="ad-entity"
                                      onClick={() => setGymId(g.id)}
                                    >
                                      <span className="ad-gym-avatar">
                                        {g.name.slice(0, 2).toUpperCase()}
                                      </span>
                                      <span>
                                        <strong>{g.name}</strong>
                                        <small>
                                          {g.address ||
                                            g.owner_email ||
                                            "Adresa neuvedená"}
                                        </small>
                                      </span>
                                    </button>
                                  </td>
                                  <td>
                                    <strong>{g.members_active}</strong>
                                    <small>
                                      aktívnych / {g.members_total} celkom
                                    </small>
                                  </td>
                                  <td>
                                    <Badge
                                      tone={
                                        g.modules_active ? "green" : "neutral"
                                      }
                                    >
                                      {g.modules_active} aktívnych
                                    </Badge>
                                    <small>{g.modules_total} spárovaných</small>
                                  </td>
                                  <td>
                                    {g.ordered_modules} / {g.paid_modules}
                                    <small>{date(g.last_order_at)}</small>
                                  </td>
                                  <td>
                                    {(g.fee_bps / 100).toLocaleString("sk-SK")}{" "}
                                    %
                                    <small>
                                      {g.fee_override === null
                                        ? "Predvolený poplatok"
                                        : "Individuálny poplatok"}
                                    </small>
                                  </td>
                                  <td>
                                    <Badge
                                      tone={
                                        g.charges_enabled && g.stripe_live
                                          ? "green"
                                          : "neutral"
                                      }
                                    >
                                      {g.charges_enabled && g.stripe_live
                                        ? "Aktívne"
                                        : "Neaktívne"}
                                    </Badge>
                                  </td>
                                  <td>
                                    <button
                                      className="ad-icon-button"
                                      onClick={() => setGymId(g.id)}
                                      aria-label={`Otvoriť ${g.name}`}
                                    >
                                      <Icon name="arrow" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                      {!filteredGyms.length && (
                        <Empty>Nenašli sa žiadne gymy.</Empty>
                      )}
                      <Pagination
                        page={page}
                        count={filteredGyms.length}
                        onChange={setPage}
                      />
                    </section>
                  )}
                  {tab === "orders" && (
                    <>
                      <div className="ad-order-summary">
                        <button
                          onClick={() => {
                            setOrderFilter("all");
                            setPage(1);
                          }}
                        >
                          <span>Všetky checkouty</span>
                          <strong>{data.order_count}</strong>
                        </button>
                        <button
                          onClick={() => {
                            setOrderFilter("shipping");
                            setPage(1);
                          }}
                        >
                          <span>Na odoslanie</span>
                          <strong>{waiting.length}</strong>
                        </button>
                        <button
                          onClick={() => {
                            setOrderFilter("shipped");
                            setPage(1);
                          }}
                        >
                          <span>Na ceste</span>
                          <strong>
                            {
                              data.orders.filter(
                                (o) => o.fulfillment_status === "shipped",
                              ).length
                            }
                          </strong>
                        </button>
                        <button
                          onClick={() => {
                            setOrderFilter("unpaid");
                            setPage(1);
                          }}
                        >
                          <span>Nezaplatené</span>
                          <strong>
                            {
                              data.orders.filter(
                                (o) => o.payment_status === "unpaid",
                              ).length
                            }
                          </strong>
                        </button>
                      </div>
                      <section className="ad-panel">
                        <div className="ad-toolbar">
                          <Search
                            value={query}
                            onChange={(v) => {
                              setQuery(v);
                              setPage(1);
                            }}
                            placeholder="Meno, e-mail, gym alebo zásielka"
                          />
                          <select
                            aria-label="Filter objednávok"
                            value={orderFilter}
                            onChange={(e) => {
                              setOrderFilter(e.target.value);
                              setPage(1);
                            }}
                          >
                            <option value="all">Všetky stavy</option>
                            <option value="shipping">Na odoslanie</option>
                            <option value="unassigned">Bez gymu</option>
                            {Object.entries(PAYMENT_LABELS).map(([v, t]) => (
                              <option key={v} value={v}>
                                {t}
                              </option>
                            ))}
                            {[
                              "shipped",
                              "delivered",
                              "on_hold",
                              "canceled",
                            ].map((v) => (
                              <option key={v} value={v}>
                                {SHIPPING_LABELS[v]}
                              </option>
                            ))}
                          </select>
                          <button
                            className="ad-button ad-primary"
                            onClick={sync}
                            disabled={syncing}
                          >
                            <Icon name="refresh" />
                            {syncing
                              ? "Synchronizujem…"
                              : "Synchronizovať Stripe"}
                          </button>
                        </div>
                        <OrdersTable
                          orders={filteredOrders.slice(
                            (page - 1) * 25,
                            page * 25,
                          )}
                          gyms={data.gyms}
                          onOpen={setOrderId}
                        />
                        <Pagination
                          page={page}
                          count={filteredOrders.length}
                          onChange={setPage}
                        />
                      </section>
                      <p className="ad-footnote">
                        Checkout znamená otvorenú platobnú stránku. Identita
                        zákazníka môže byť známa až po zaplatení.{" "}
                      </p>
                      <Coverage data={data} />
                    </>
                  )}
                  {tab === "finance" && (
                    <>
                      <div className="ad-stats">
                        <Stat
                          title="Obrat gymov"
                          value={money(selected!.gross, currency)}
                          hint="Evidované úhrady za vybraný mesiac"
                          icon="chart"
                        />
                        <Stat
                          title="Vrátené platby"
                          value={money(selected!.refunds, currency)}
                          hint="Podľa mesiaca uskutočnenia refundácie"
                          icon="refresh"
                        />
                        <Stat
                          title="Provízie za mesiac"
                          value={money(
                            selected!.fees - selected!.feeRefunds,
                            currency,
                          )}
                          hint="Evidované provízie po refundáciách"
                          icon="chart"
                          accent
                        />
                        <Stat
                          title="Provízie historicky"
                          value={money(
                            lifetime!.fees - lifetime!.feeRefunds,
                            currency,
                          )}
                          hint="Celé evidované obdobie"
                          icon="clock"
                        />
                      </div>
                      <div className="ad-income-note">
                        <Icon name="box" />
                        <div>
                          <strong>
                            Predaj modulov: {money(moduleSales, currency)} za{" "}
                            {month} · {money(allModuleSales, currency)}{" "}
                            historicky
                          </strong>
                          <p>
                            Uhradené objednávky po evidovaných refundáciách,
                            priradené k mesiacu platby. Výnosy pred nákladmi na
                            modul, dopravu, platby a daňami; nejde o čistý zisk.
                          </p>
                        </div>
                      </div>
                      <section className="ad-panel">
                        <div className="ad-panel-heading">
                          <div>
                            <h2>Výsledky jednotlivých gymov</h2>
                            <p>
                              {month} · {currency}
                            </p>
                          </div>
                          <button className="ad-button" onClick={exportFinance}>
                            <Icon name="download" />
                            Export CSV
                          </button>
                        </div>
                        <div className="ad-table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Gym</th>
                                <th>Platby</th>
                                <th>Obrat</th>
                                <th>Vrátené</th>
                                <th>Provízia po vrátení</th>
                                <th>Kvalita údajov</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.gyms.map((g) => {
                                const t = totals(
                                  data.finance,
                                  currency,
                                  month,
                                  g.id,
                                );
                                return (
                                  <tr key={g.id}>
                                    <td>
                                      <button
                                        className="ad-text-button"
                                        onClick={() => setGymId(g.id)}
                                      >
                                        {g.name}
                                      </button>
                                    </td>
                                    <td>{t.payments}</td>
                                    <td>{money(t.gross, currency)}</td>
                                    <td>{money(t.refunds, currency)}</td>
                                    <td>
                                      <strong>
                                        {money(t.fees - t.feeRefunds, currency)}
                                      </strong>
                                    </td>
                                    <td>
                                      {t.unknown ? (
                                        <Badge tone="amber">
                                          {t.unknown} bez provízie
                                        </Badge>
                                      ) : (
                                        <span>
                                          {t.payments
                                            ? "Kompletné provízie"
                                            : "Bez platieb"}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>
                      <section className="ad-panel">
                        <div className="ad-panel-heading">
                          <div>
                            <h2>Mesačná história</h2>
                            <p>Obrat a provízie za celé obdobie</p>
                          </div>
                        </div>
                        <MonthlyTable data={data} currency={currency} />
                      </section>
                      <Coverage data={data} />
                    </>
                  )}
                  {tab === "leads" && (
                    <section className="ad-panel">
                      <div className="ad-panel-heading">
                        <div>
                          <h2>Záujemcovia o Fitliner</h2>
                          <p>
                            Najviac 500 najnovších formulárov. Odoslanie
                            formulára nepotvrdzuje platbu.
                          </p>
                        </div>
                      </div>
                      <div className="ad-table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Gym / kontakt</th>
                              <th>E-mail</th>
                              <th>Telefón</th>
                              <th>Postup</th>
                              <th>Vytvorené</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.leads.map((l) => (
                              <tr key={l.id}>
                                <td>
                                  <strong>
                                    {l.gym_name || "Nedoplnený gym"}
                                  </strong>
                                  <small>{l.contact_name || l.address}</small>
                                </td>
                                <td>{l.email || "—"}</td>
                                <td>{l.phone || "—"}</td>
                                <td>
                                  <Badge
                                    tone={
                                      l.completed_step >= 5 ? "green" : "amber"
                                    }
                                  >
                                    {l.checkout_clicked
                                      ? "Prešiel k platbe"
                                      : l.completed_step >= 5
                                        ? "Vyplnený kontakt"
                                        : `Krok ${l.completed_step}`}
                                  </Badge>
                                </td>
                                <td>{date(l.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {!data.leads.length && (
                        <Empty>Zatiaľ žiadni záujemcovia.</Empty>
                      )}
                    </section>
                  )}
                  {tab === "activity" && (
                    <section className="ad-panel">
                      <div className="ad-panel-heading">
                        <div>
                          <h2>Posledné zmeny</h2>
                          <p>Audit úprav gymov, poplatkov a expedície</p>
                        </div>
                      </div>
                      {data.activity.length ? (
                        <div className="ad-activity">
                          {data.activity.map((a) => (
                            <div key={a.id}>
                              <span className="ad-task-icon">
                                <Icon
                                  name={a.entity_type === "gym" ? "gym" : "box"}
                                />
                              </span>
                              <div>
                                <strong>
                                  {a.entity_type === "gym"
                                    ? data.gyms.find(
                                        (g) => g.id === a.entity_id,
                                      )?.name || "Úprava gymu"
                                    : data.orders.find(
                                        (o) => o.id === a.entity_id,
                                      )?.customer_name || "Úprava objednávky"}
                                </strong>
                                <p>
                                  {a.entity_type === "order"
                                    ? `${SHIPPING_LABELS[String(a.details.from)] || a.details.from} → ${SHIPPING_LABELS[String(a.details.to)] || a.details.to}${a.details.note_changed ? " · Upravená poznámka" : ""}`
                                    : a.details.fee_changed
                                      ? `Zmenený poplatok · ${a.details.reason}`
                                      : "Upravená interná poznámka"}
                                </p>
                              </div>
                              <time>{date(a.created_at, true)}</time>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Empty>Zatiaľ neboli vykonané žiadne zmeny.</Empty>
                      )}
                    </section>
                  )}
                </>
              )}
              <footer className="ad-footer">
                <span>Fitliner · Administrácia</span>
                <span>
                  Údaje načítané {date(data.generated_at, true)} · Časové pásmo
                  Bratislava
                </span>
              </footer>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Search({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="ad-search">
      <Icon name="search" />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function Pagination({
  page,
  count,
  onChange,
}: {
  page: number;
  count: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(count / 25));
  return (
    <div className="ad-pagination">
      <span>
        {count
          ? `${(page - 1) * 25 + 1}–${Math.min(page * 25, count)} z ${count}`
          : "0 výsledkov"}
      </span>
      <div>
        <button
          className="ad-button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Predošlá
        </button>
        <span>
          {page} / {pages}
        </span>
        <button
          className="ad-button"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Ďalšia
        </button>
      </div>
    </div>
  );
}
function OrdersTable({
  orders,
  gyms,
  onOpen,
}: {
  orders: ModuleOrder[];
  gyms: Gym[];
  onOpen: (id: string) => void;
}) {
  return orders.length ? (
    <div className="ad-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Zákazník / gym</th>
            <th>Vytvorené</th>
            <th>Moduly</th>
            <th>Suma</th>
            <th>Platba</th>
            <th>Expedícia</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <button className="ad-entity" onClick={() => onOpen(o.id)}>
                  <span className="ad-order-icon">
                    <Icon name="box" />
                  </span>
                  <span>
                    <strong>
                      {gyms.find((g) => g.id === o.gym_id)?.name ||
                        o.customer_name ||
                        "Zatiaľ neznámy zákazník"}
                    </strong>
                    <small>
                      {o.customer_email || "Kontakt zatiaľ nevyplnený"}
                    </small>
                  </span>
                </button>
              </td>
              <td>{date(o.created_at)}</td>
              <td>{o.quantity} ks</td>
              <td>
                <strong>{money(o.amount_minor, o.currency)}</strong>
              </td>
              <td>
                <PaymentBadge status={o.payment_status} />
              </td>
              <td>
                <Badge
                  tone={
                    o.fulfillment_status === "delivered"
                      ? "green"
                      : needsShipping(o)
                        ? "amber"
                        : "neutral"
                  }
                >
                  {SHIPPING_LABELS[o.fulfillment_status]}
                </Badge>
              </td>
              <td>
                <button
                  className="ad-icon-button"
                  onClick={() => onOpen(o.id)}
                  aria-label={`Detail objednávky ${o.customer_name || o.id}`}
                >
                  <Icon name="arrow" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty>
      Žiadne objednávky pre tento výber. Údaje zo Stripe načítate
      synchronizáciou.
    </Empty>
  );
}
function RevenueChart({
  data,
  month,
  currency,
  onMonth,
}: {
  data: Dashboard;
  month: string;
  currency: string;
  onMonth: (m: string) => void;
}) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(`${month}-01T12:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() - 5 + i);
    const key = d.toISOString().slice(0, 7);
    return {
      key,
      label: new Intl.DateTimeFormat("sk-SK", { month: "short" }).format(d),
      total: totals(data.finance, currency, key).gross,
    };
  });
  const max = Math.max(...months.map((m) => m.total), 1);
  return (
    <div className="ad-chart">
      <div className="ad-chart-total">
        <strong>
          {money(
            months.reduce((sum, m) => sum + m.total, 0),
            currency,
          )}
        </strong>
        <span>obrat za zobrazené obdobie</span>
      </div>
      <div className="ad-chart-bars">
        {months.map((m) => (
          <button
            key={m.key}
            className={m.key === month ? "is-selected" : ""}
            onClick={() => onMonth(m.key)}
            aria-label={`${m.key}: ${money(m.total, currency)}`}
          >
            <span className="ad-bar-value">{money(m.total, currency)}</span>
            <div className="ad-bar-track">
              <span
                style={{
                  height: `${Math.max(m.total ? 3 : 0, (m.total / max) * 100)}%`,
                }}
              />
            </div>
            <span>{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
function Coverage({ data }: { data: Dashboard }) {
  return (
    <div className="ad-coverage">
      <Icon name="clock" />
      <div>
        <strong>Odkiaľ pochádzajú čísla</strong>
        <p>
          Obrat zahŕňa evidované platby členstiev vo Fitlineri, nie hotovosť ani
          externé tržby gymu. Provízie sú skutočne uložené sumy pred nákladmi a
          daňami; pri historických ThriveCart platbách provízia a úplná história
          refundácií nie sú dostupné. Predaj modulov je samostatne v
          objednávkach. Aktívny modul znamená aktívne spárovanie, nie overenú
          dostupnosť zariadenia.
        </p>
        <p>
          Stripe objednávky:{" "}
          {data.sync.last_success_at
            ? `posledná synchronizácia ${date(data.sync.last_success_at, true)}`
            : "zatiaľ nesynchronizované"}
          .{" "}
          {data.sync.webhook_configured
            ? "Automatické aktualizácie platieb sú zapnuté."
            : "Automatické aktualizácie platieb zatiaľ nie sú pripojené."}
          {data.sync.last_error && ` Chyba: ${data.sync.last_error}`}
        </p>
      </div>
    </div>
  );
}
function MonthlyTable({
  data,
  currency,
  gymId,
}: {
  data: Dashboard;
  currency: string;
  gymId?: string;
}) {
  const months = Array.from(
    new Set(
      data.finance
        .filter(
          (r) => r.currency === currency && (!gymId || r.gym_id === gymId),
        )
        .map((r) => r.month.slice(0, 7)),
    ),
  )
    .sort()
    .reverse();
  return months.length ? (
    <div className="ad-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mesiac</th>
            <th>Platby</th>
            <th>Obrat</th>
            <th>Refundácie</th>
            <th>Provízia po vrátení</th>
            <th>Bez údaja o provízii</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => {
            const t = totals(data.finance, currency, m, gymId);
            return (
              <tr key={m}>
                <td>{m}</td>
                <td>{t.payments}</td>
                <td>{money(t.gross, currency)}</td>
                <td>{money(t.refunds, currency)}</td>
                <td>{money(t.fees - t.feeRefunds, currency)}</td>
                <td>{t.unknown}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty>Pre túto menu zatiaľ nie sú evidované platby.</Empty>
  );
}
function GymDetail({
  gym,
  data,
  currency,
  month,
  onBack,
  onSaved,
  onOrder,
}: {
  gym: Gym;
  data: Dashboard;
  currency: string;
  month: string;
  onBack: () => void;
  onSaved: () => Promise<void>;
  onOrder: (id: string) => void;
}) {
  const [note, setNote] = useState(gym.note);
  const [fee, setFee] = useState(
    gym.fee_override === null ? "" : String(gym.fee_override / 100),
  );
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const feeBps =
    fee.trim() === "" ? null : Math.round(Number(fee.replace(",", ".")) * 100);
  const changed = feeBps !== gym.fee_override;
  const total = totals(data.finance, currency, undefined, gym.id);
  const selected = totals(data.finance, currency, month, gym.id);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (
        feeBps !== null &&
        (!Number.isFinite(feeBps) || feeBps < 0 || feeBps > 9999)
      )
        throw new Error("Poplatok musí byť od 0 do 99,99 %.");
      const { error } = await adminClient().rpc("gym_admin_save_gym", {
        p_id: gym.id,
        p_note: note,
        p_expected_note_updated_at: gym.note_updated_at,
        p_change_fee: changed,
        p_fee_bps: feeBps,
        p_expected_fee: gym.fee_override,
        p_reason: reason,
      });
      if (error) throw new Error(error.message);
      await onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="ad-text-button ad-back" onClick={onBack}>
        ← Späť na prehľad
      </button>
      <div className="ad-stats">
        <Stat
          title="Aktívni členovia"
          value={gym.members_active}
          hint={`${gym.members_total} členov s históriou členstva`}
          icon="users"
        />
        <Stat
          title="Aktívne moduly"
          value={gym.modules_active}
          hint={`${gym.modules_total} spárovaných modulov`}
          icon="box"
        />
        <Stat
          title={`Obrat · ${month}`}
          value={money(selected.gross, currency)}
          hint="Evidované platby členstiev"
          icon="chart"
        />
        <Stat
          title="Provízie historicky"
          value={money(total.fees - total.feeRefunds, currency)}
          hint={`${total.unknown} platieb bez údaja o provízii`}
          icon="chart"
          accent
        />
      </div>
      <div className="ad-detail-grid">
        <section className="ad-panel ad-panel-padded">
          <h2>Kontakt a moduly</h2>
          <dl className="ad-dl">
            <dt>Adresa</dt>
            <dd>{gym.address || "—"}</dd>
            <dt>Majiteľ</dt>
            <dd>{gym.owner_email || "—"}</dd>
            <dt>Kontaktný e-mail</dt>
            <dd>{gym.contact_email || "—"}</dd>
            <dt>Telefón</dt>
            <dd>{gym.contact_phone || "—"}</dd>
            <dt>Registrácia</dt>
            <dd>{date(gym.created_at)}</dd>
            <dt>Verejná stránka</dt>
            <dd>
              {gym.slug ? (
                <a
                  href={`https://www.befitliner.com/g/${encodeURIComponent(gym.slug)}/sk`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Otvoriť stránku ↗
                </a>
              ) : (
                "—"
              )}
            </dd>
          </dl>
          <h3>Spárované moduly</h3>
          {data.modules
            .filter((m) => m.gym_id === gym.id)
            .map((m) => (
              <div className="ad-module-row" key={m.id}>
                <Icon name="box" />
                <div>
                  <strong>{m.name}</strong>
                  <small>Pridaný {date(m.created_at)}</small>
                </div>
                <Badge tone={m.status === "active" ? "green" : "neutral"}>
                  {m.status === "active" ? "Aktívny" : m.status}
                </Badge>
              </div>
            ))}
          {!gym.modules_total && (
            <p className="ad-muted">Zatiaľ žiadny spárovaný modul.</p>
          )}
        </section>
        <form className="ad-panel ad-panel-padded ad-form" onSubmit={save}>
          <h2>Interná správa gymu</h2>
          <label>
            Poznámka
            <textarea
              rows={4}
              maxLength={10000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dohody, inštalácia, ďalší krok…"
            />
          </label>
          <label>
            Individuálny poplatok Fitliner (%)
            <input
              inputMode="decimal"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="Predvolený: 10 %"
            />
          </label>
          <p className="ad-footnote">
            Prázdne pole používa predvolených 10 %. Zmena sa použije pri nových
            platbách. Historické provízie zostávajú podľa platby.
          </p>
          {changed && (
            <label>
              Dôvod zmeny poplatku
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                minLength={3}
                maxLength={500}
                placeholder="Napr. individuálna dohoda s prevádzkovateľom"
              />
            </label>
          )}
          {error && (
            <p className="ad-error" role="alert">
              {error}
            </p>
          )}
          <button className="ad-button ad-primary" disabled={busy}>
            {busy ? "Ukladám…" : "Uložiť zmeny"}
          </button>
        </form>
      </div>
      <section className="ad-panel">
        <div className="ad-panel-heading">
          <h2>Objednávky modulov</h2>
          <span>
            {gym.ordered_modules} objednaných · {gym.paid_modules} zaplatených
          </span>
        </div>
        <OrdersTable
          orders={data.orders.filter((o) => o.gym_id === gym.id)}
          gyms={data.gyms}
          onOpen={onOrder}
        />
      </section>
      <section className="ad-panel">
        <div className="ad-panel-heading">
          <h2>Mesačná história · {currency}</h2>
        </div>
        <MonthlyTable data={data} currency={currency} gymId={gym.id} />
      </section>
    </>
  );
}
function OrderDetail({
  order,
  gyms,
  onBack,
  onSaved,
}: {
  order: ModuleOrder;
  gyms: Gym[];
  onBack: () => void;
  onSaved: () => Promise<void>;
}) {
  const [gym, setGym] = useState(order.gym_id || "");
  const [status, setStatus] = useState(order.fulfillment_status);
  const [tracking, setTracking] = useState(order.tracking_number);
  const [note, setNote] = useState(order.note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error } = await adminClient().rpc("gym_admin_update_order", {
        p_id: order.id,
        p_revision: order.revision,
        p_gym_id: gym || null,
        p_status: status,
        p_tracking: tracking,
        p_note: note,
      });
      if (error) throw new Error(error.message);
      await onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const address = order.shipping_address;
  const a = (address.address || address) as Record<string, unknown>;
  return (
    <>
      <button className="ad-text-button ad-back" onClick={onBack}>
        ← Späť na objednávky
      </button>
      <div className="ad-detail-grid">
        <section className="ad-panel ad-panel-padded">
          <div className="ad-detail-title">
            <h2>{order.customer_name || "Neznámy zákazník"}</h2>
            <PaymentBadge status={order.payment_status} />
          </div>
          <dl className="ad-dl">
            <dt>E-mail</dt>
            <dd>{order.customer_email || "Zatiaľ nevyplnený"}</dd>
            <dt>Telefón</dt>
            <dd>{order.customer_phone || "—"}</dd>
            <dt>Počet modulov</dt>
            <dd>{order.quantity} ks</dd>
            <dt>Suma</dt>
            <dd>{money(order.amount_minor, order.currency)}</dd>
            <dt>Vrátená suma</dt>
            <dd>{money(order.refunded_minor, order.currency)}</dd>
            <dt>Vytvorené</dt>
            <dd>{date(order.created_at, true)}</dd>
            <dt>Zaplatené</dt>
            <dd>{date(order.paid_at, true)}</dd>
            <dt>Odoslané</dt>
            <dd>{date(order.shipped_at, true)}</dd>
            <dt>Doručené</dt>
            <dd>{date(order.delivered_at, true)}</dd>
          </dl>
          <h3>Doručovacia adresa</h3>
          <p className="ad-address">
            {[
              address.name,
              a.line1,
              a.line2,
              [a.postal_code, a.city].filter(Boolean).join(" "),
              a.state,
              a.country,
            ]
              .filter(Boolean)
              .map(String)
              .join("\n") || "Adresa zatiaľ nie je dostupná."}
          </p>
          <a
            className="ad-text-button"
            href={`https://dashboard.stripe.com/acct_1TwSc8CqeksGlIZj/${order.stripe_payment_intent_id ? `payments/${encodeURIComponent(order.stripe_payment_intent_id)}` : "payments"}`}
            target="_blank"
            rel="noreferrer"
          >
            Otvoriť platbu v Stripe ↗
          </a>
          <small className="ad-order-id">{order.stripe_session_id}</small>
        </section>
        <form className="ad-panel ad-panel-padded ad-form" onSubmit={save}>
          <h2>Vybavenie objednávky</h2>
          <label>
            Priradený gym
            <select value={gym} onChange={(e) => setGym(e.target.value)}>
              <option value="">Zatiaľ nepriradené</option>
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Stav expedície
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {Object.entries(SHIPPING_LABELS).map(([v, label]) => (
                <option
                  key={v}
                  value={v}
                  disabled={
                    ["preparing", "shipped", "delivered"].includes(v) &&
                    !["paid", "partially_refunded"].includes(
                      order.payment_status,
                    )
                  }
                >
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Číslo zásielky / osobné odovzdanie
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              maxLength={200}
              required={["shipped", "delivered"].includes(status)}
              placeholder="Napr. Packeta Z123456789"
            />
          </label>
          <label>
            Interná poznámka
            <textarea
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={10000}
              placeholder="Čo treba pri objednávke vybaviť…"
            />
          </label>
          <p className="ad-footnote">
            Platbu overuje Stripe. Expedovať možno iba zaplatené objednávky.
            Zmena stavu uloží dátum a záznam do histórie.
          </p>
          {error && (
            <p className="ad-error" role="alert">
              {error}
            </p>
          )}
          <button className="ad-button ad-primary" disabled={busy}>
            {busy ? "Ukladám…" : "Uložiť objednávku"}
          </button>
        </form>
      </div>
    </>
  );
}
