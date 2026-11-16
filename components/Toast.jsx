"use client";

import { useLayoutEffect, useRef } from "react";
import { animate } from "animejs";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

const VARIANTS = {
  success: {
    wrap: "border-emerald-500/30 shadow-[0_10px_40px_-12px_rgba(16,185,129,0.45)]",
    text: "text-emerald-300",
    icon: CheckCircle2,
  },
  error: {
    wrap: "border-rose-500/30 shadow-[0_10px_40px_-12px_rgba(244,63,94,0.45)]",
    text: "text-rose-300",
    icon: AlertTriangle,
  },
  info: {
    wrap: "border-tungsten-500/30 shadow-[0_10px_40px_-12px_rgba(247,164,40,0.45)]",
    text: "text-tungsten-300",
    icon: Info,
  },
};

function ToastItem({ toast }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const anim = animate(ref.current, {
      opacity: [0, 1],
      y: [-16, 0],
      scale: [0.95, 1],
      duration: 460,
      ease: "spring(1.1, 180, 20, 0)",
    });
    return () => { try { anim.revert(); } catch { /* noop */ } };
  }, []);

  const v = VARIANTS[toast.type] || VARIANTS.info;
  const Icon = v.icon;

  return (
    <div
      ref={ref}
      style={{ opacity: 0 }}
      className={`pointer-events-none flex items-center gap-2.5 rounded-2xl border bg-ink-900/95 px-4 py-2.5 backdrop-blur-md ${v.wrap}`}
    >
      <Icon size={15} strokeWidth={2.5} className={`flex-shrink-0 ${v.text}`} />
      <span className={`text-[11.5px] font-bold leading-snug ${v.text}`}>{toast.msg}</span>
    </div>
  );
}

export default function ToastStack({ toasts }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-[80] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
