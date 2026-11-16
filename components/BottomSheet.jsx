"use client";

import { useEffect, useRef, useState } from "react";

/** Bottom sheet dengan animasi masuk/keluar (CSS spring-ish), menempel di dalam frame app. */
export default function BottomSheet({ open, onClose, children, className = "" }) {
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef(null);
  const backRef = useRef(null);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const card = cardRef.current;
    const back = backRef.current;
    if (!card || !back) return;

    if (open) {
      const raf = requestAnimationFrame(() => {
        card.classList.remove("translate-y-full");
        back.classList.remove("opacity-0");
      });
      return () => cancelAnimationFrame(raf);
    }

    card.classList.add("translate-y-full");
    back.classList.add("opacity-0");
    const t = setTimeout(() => setMounted(false), 420);
    return () => clearTimeout(t);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className={`absolute inset-0 z-[60] flex items-end justify-center ${className}`} role="dialog" aria-modal="true">
      <div
        ref={backRef}
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/70 opacity-0 backdrop-blur-md transition-opacity duration-300"
      />
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-md translate-y-full transform transition-transform duration-[420ms] ease-[cubic-bezier(0.32,1.25,0.36,1)]"
      >
        {children}
      </div>
    </div>
  );
}
