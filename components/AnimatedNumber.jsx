"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { formatRupiah } from "@/lib/format";

/** Angka rupiah dengan animasi count-up (anime.js). */
export default function AnimatedNumber({ value, className = "" }) {
  const ref = useRef(null);
  const current = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (current.current === value) {
      ref.current.textContent = formatRupiah(value);
      return;
    }
    if (animRef.current) {
      try { animRef.current.revert(); } catch { /* noop */ }
    }
    const proxy = { v: current.current };
    animRef.current = animate(proxy, {
      v: value,
      duration: 650,
      ease: "out(4)",
      onRender: () => {
        current.current = proxy.v;
        ref.current.textContent = formatRupiah(Math.round(proxy.v));
      },
    });
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {formatRupiah(value)}
    </span>
  );
}
