"use client";
import { useState } from "react";
import Link from "next/link";
import { adminClient } from "@/lib/admin/client";
import { steps, questions } from "@/components/member-funnel/model";
import { actionLabels } from "@/components/member-funnel/analytics-actions";
import s from "@/components/member-funnel/member-funnel.module.css";
type Report = {
  sessions: number;
  completions: number;
  member_completions: number;
  updated_at: string;
  steps: { screen: string; visitors: number; views: number }[];
  clicks: {
    screen: string;
    action: string;
    clicks: number;
    visitors: number;
  }[];
  exits: { screen: string; visitors: number }[];
};
const labels: Record<string, string> = {
  intro: "Úvod",
  "coach-proof": "AI tréner",
  "training-proof": "Tréningový denník",
  "habits-proof": "Zdravotná história a progres",
  email: "E-mail",
  verification: "Simulácia členstva",
  result: "Osobný súhrn",
  offer: "Ponuka",
  checkout: "Súhrn bez platby",
  done: "Dokončenie",
};
function label(id: string) {
  return labels[id] ?? questions.find((q) => q.id === id)?.title ?? id;
}
function action(screen: string, id: string) {
  const n = Number(id.replace("answer_", ""));
  return id.startsWith("answer_")
    ? (questions.find((q) => q.id === screen)?.options[n - 1]?.title ?? id)
    : (actionLabels[id] ?? id);
}
export default function MemberFunnelReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const client = adminClient();
      const {
        data: { session },
      } = await client.auth.getSession();
      if (!session)
        throw Error(
          "Najprv sa prihlás do existujúceho administrátorského účtu. Potom sa vráť sem.",
        );
      const { data, error } = await client.rpc("member_funnel_report");
      if (error)
        throw Error(
          "Report je dostupný iba oprávnenému administrátorovi. Over prihlásenie alebo dostupnosť databázy.",
        );
      setReport(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Report sa nepodarilo načítať.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={s.shell}>
      <main style={{ maxWidth: 1050, margin: "auto", padding: "48px 20px" }}>
        <Link href="/admin">← Administrácia / prihlásenie</Link>
        <h1 style={{ fontSize: 32, margin: "24px 0" }}>
          Predajná cesta cvičenca
        </h1>
        <p>
          Posledných 30 dní · verzia v2-lower-price · iba návštevy so súhlasom s
          meraním.
        </p>
        <button
          className={s.primary}
          style={{ maxWidth: 320 }}
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Načítavam…" : "Načítať aktuálny report"}
        </button>
        {error && <p role="alert">{error}</p>}
        {report && (
          <>
            <div className={s.stats}>
              <div>
                <strong>{report.sessions}</strong>
                <small>meraných návštev</small>
              </div>
              <div>
                <strong>{report.completions}</strong>
                <small>dokončení platenej vetvy BEZ platby</small>
              </div>
              <div>
                <strong>{report.member_completions}</strong>
                <small>dokončení členskej vetvy</small>
              </div>
            </div>
            <p>
              Reálne objednávky: nesledujú sa, platby nie sú zapojené.
              Dokončenie testu nie je tržba. Jedna návšteva môže otestovať obe
              vetvy.
            </p>
            <h2 style={{ marginTop: 32 }}>Priechod krokmi</h2>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Krok",
                      "Návštevy",
                      "Zobrazenia",
                      "Posledný krok po 30 min neaktivity",
                    ].map((v) => (
                      <th key={v} style={{ padding: 12 }}>
                        {v}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step) => {
                    const row = report.steps.find((x) => x.screen === step);
                    return (
                      <tr key={step} style={{ borderTop: "1px solid #493756" }}>
                        <td style={{ padding: 12 }}>{label(step)}</td>
                        <td>{row?.visitors ?? 0}</td>
                        <td>{row?.views ?? 0}</td>
                        <td>
                          {report.exits.find((x) => x.screen === step)
                            ?.visitors ?? 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <h2 style={{ marginTop: 32 }}>Na čo návštevníci klikajú</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left" }}>
                <thead>
                  <tr>
                    <th>Krok</th>
                    <th>Prvok</th>
                    <th>Kliknutia</th>
                    <th>Návštevy</th>
                  </tr>
                </thead>
                <tbody>
                  {report.clicks.map((row) => (
                    <tr key={`${row.screen}-${row.action}`}>
                      <td style={{ padding: "10px 0" }}>{label(row.screen)}</td>
                      <td>{action(row.screen, row.action)}</td>
                      <td>{row.clicks}</td>
                      <td>{row.visitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Odchod odhadujeme z posledného navštíveného kroku po aspoň 30
              minútach neaktivity, bez dokončenia. Zatvorenie karty samo osebe
              nie je dôkaz odchodu. Návraty a obe testované vetvy môžu narušiť
              jednoduchý lineárny pomer krokov.
            </p>
            <p>
              Aktualizované:{" "}
              {new Date(report.updated_at).toLocaleString("sk-SK")}. Nemerané
              návštevy a blokátory tu nie sú zahrnuté. Dáta sú pseudonymné, bez
              e-mailov a zdravotných hodnôt.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
