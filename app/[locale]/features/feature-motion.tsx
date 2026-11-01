"use client";
import { useEffect } from "react";
export default function FeatureMotion() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements =
      document.querySelectorAll<HTMLElement>("[data-feature-art]");
    const visible = new Set<Element>();
    const sync = () =>
      elements.forEach((el) =>
        el.classList.toggle(
          "feature-art-active",
          visible.has(el) && !document.hidden && !preference.matches,
        ),
      );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35)
            visible.add(entry.target);
          else visible.delete(entry.target);
        }
        sync();
      },
      { threshold: [0, 0.35] },
    );
    elements.forEach((el) => {
      el.classList.add("feature-art-ready");
      observer.observe(el);
    });
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      elements.forEach((el) =>
        el.classList.remove("feature-art-active", "feature-art-ready"),
      );
    };
  }, []);
  return null;
}
