"use client";
import { useEffect } from "react";
export default function FeatureMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const elements =
      document.querySelectorAll<HTMLElement>("[data-feature-art]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("feature-art-active");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.35 },
    );
    elements.forEach((el) => observer.observe(el));
    const stop = () => {
      observer.disconnect();
      elements.forEach((el) => el.classList.remove("feature-art-active"));
    };
    preference.addEventListener("change", stop);
    return () => {
      stop();
      preference.removeEventListener("change", stop);
    };
  }, []);
  return null;
}
