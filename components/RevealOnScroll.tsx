"use client";

import { useEffect } from "react";

export default function RevealOnScroll() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      ".landing-purpose-section, .landing-about-section, .landing-how-section, .landing-faq-section, .landing-purpose-card, .landing-about-feature, .landing-how-card"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    elements.forEach((element) => {
      element.classList.add("reveal-hidden");
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}