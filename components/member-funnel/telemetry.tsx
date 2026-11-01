"use client";
import { useEffect, useRef, useState } from "react";
import { actionLabels } from "./analytics-actions";
import type { Step } from "./model";
import s from "./value-demo.module.css";
const consentKey = "fitliner_funnel_analytics_v1";
type Event = {
  id: string;
  seq: number;
  screen: string;
  kind: string;
  action: string;
  duration: number;
};
export function FunnelAnalytics({
  step,
  member,
  offerPhase,
}: {
  step: Step;
  member: boolean;
  offerPhase: "none" | "active" | "expired";
}) {
  const [consent, setConsent] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const runtime = useRef<{
    session: string;
    seq: number;
    queue: Event[];
    busy: boolean;
    screen: string;
    started: number;
    sentView: string;
    phase: string;
  }>({
    session: "",
    seq: 0,
    queue: [],
    busy: false,
    screen: step,
    started: 0,
    sentView: "",
    phase: "none",
  });
  useEffect(() => {
    try {
      setConsent(localStorage.getItem(consentKey) || "unset");
    } catch {
      setConsent("unset");
    }
  }, []);
  useEffect(() => {
    if (consent !== "yes") return;
    const r = runtime.current;
    if (!r.session) {
      r.session = crypto.randomUUID();
      r.seq = 0;
    }
    r.screen = step;
    if (r.sentView !== step) r.started = Date.now();
    function record(kind: string, action = "none") {
      if (r.queue.length >= 100) return;
      r.queue.push({
        id: crypto.randomUUID(),
        seq: ++r.seq,
        screen: r.screen,
        kind,
        action,
        duration: Math.min(1800000, Math.max(0, Date.now() - r.started)),
      });
    }
    if (r.sentView !== step) {
      record("view");
      r.sentView = step;
      if (step === "done") record(member ? "member_complete" : "test_complete");
    }
    if (offerPhase !== "none" && r.phase !== offerPhase) {
      record(offerPhase === "active" ? "offer_active" : "offer_expired");
      r.phase = offerPhase;
    }
    async function flush() {
      if (r.busy || !r.queue.length) return;
      r.busy = true;
      const batch = r.queue.slice(0, 30);
      try {
        const res = await fetch("/api/member-funnel/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session: r.session,
            version: "v2-lower-price",
            events: batch,
          }),
          keepalive: true,
        });
        if (res.ok) {
          const sent = new Set(batch.map((event) => event.id));
          r.queue = r.queue.filter((event) => !sent.has(event.id));
        }
      } catch {
        /* Retry on next flush; never block the customer. */
      } finally {
        r.busy = false;
      }
    }
    const root = document.getElementById("member-funnel");
    function click(e: MouseEvent) {
      const target =
        e.target instanceof Element
          ? e.target.closest("button,a,summary,input")
          : null;
      if (!target || target.closest("[data-analytics-settings]")) return;
      const controls = Array.from(
        root?.querySelectorAll("button,a,summary,input") ?? [],
      ).filter((el) => !el.closest("[data-analytics-settings]"));
      const index = controls.indexOf(target);
      const named = target.getAttribute("data-track");
      if (named && Object.hasOwn(actionLabels, named)) record("click", named);
      else if (index >= 0 && index < 100) record("click", `control_${index}`);
    }
    function visibility() {
      if (document.visibilityState === "hidden") {
        record("hidden");
        void flush();
      }
    }
    root?.addEventListener("click", click, true);
    document.addEventListener("visibilitychange", visibility);
    const timer = setInterval(flush, 2000);
    void flush();
    return () => {
      root?.removeEventListener("click", click, true);
      document.removeEventListener("visibilitychange", visibility);
      clearInterval(timer);
      void flush();
    };
  }, [consent, step, member, offerPhase]);
  function choose(value: string) {
    if (value !== "yes") {
      runtime.current.queue = [];
      runtime.current.session = "";
      runtime.current.sentView = "";
    }
    try {
      localStorage.setItem(consentKey, value);
    } catch {
      /* Session preference still works. */
    }
    setConsent(value);
    setSettings(false);
  }
  if (consent === null) return null;
  return (
    <aside
      data-analytics-settings
      data-collapsed={consent !== "unset" && !settings}
      className={s.analyticsConsent}
    >
      {consent === "unset" || settings ? (
        <>
          <p>
            Pomôžeš nám vylepšiť túto cestu? S tvojím súhlasom meriame
            zobrazenia krokov a kliknutia pod náhodným identifikátorom návštevy.
            E-mail, obsah formulárov ani zdravotné hodnoty do merania
            neposielame. Záznamy uchovávame 90 dní.
          </p>
          <div>
            <button onClick={() => choose("yes")}>Povoliť meranie</button>
            <button onClick={() => choose("no")}>Bez merania</button>
          </div>
        </>
      ) : (
        <button onClick={() => setSettings(true)}>Nastavenie merania</button>
      )}
    </aside>
  );
}
