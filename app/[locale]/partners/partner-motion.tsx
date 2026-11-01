"use client";
import { useEffect } from "react";
export default function PartnerMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window)) return;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("partner-reveal-pending");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    elements.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("partner-reveal-pending");
        observer.observe(el);
      }
    });
    const show = () =>
      elements.forEach((el) => el.classList.remove("partner-reveal-pending"));
    preference.addEventListener("change", show);
    return () => {
      observer.disconnect();
      show();
      preference.removeEventListener("change", show);
    };
  }, []);
  return null;
}
