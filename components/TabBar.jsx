"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, spring } from "animejs";
import { ClipboardList, History, Package } from "lucide-react";

const TABS = [
  { id: "input", label: "Input", icon: ClipboardList },
  { id: "riwayat", label: "Riwayat", icon: History },
  { id: "barang", label: "Barang", icon: Package },
];

export default function TabBar({ tab, onSelect }) {
  const navRef = useRef(null);
  const pillRef = useRef(null);
  const btnRefs = useRef({});
  const first = useRef(true);

  useLayoutEffect(() => {
    const pill = pillRef.current;
    const btn = btnRefs.current[tab];
    if (!pill || !btn) return;
    const left = btn.offsetLeft;
    const width = btn.offsetWidth;

    if (first.current) {
      pill.style.left = `${left}px`;
      pill.style.width = `${width}px`;
      first.current = false;
      return;
    }
    animate(pill, { left, width, duration: 550, ease: spring({ stiffness: 240, damping: 22 }) });
  }, [tab]);

  useEffect(() => {
    const onResize = () => {
      const pill = pillRef.current;
      const btn = btnRefs.current[tab];
      if (pill && btn) {
        pill.style.left = `${btn.offsetLeft}px`;
        pill.style.width = `${btn.offsetWidth}px`;
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [tab]);

  return (
    <div className="z-10 w-full flex-shrink-0 px-3 pt-3 lg:px-4 lg:pt-4">
      <nav
        ref={navRef}
        className="relative flex rounded-2xl border border-white/[0.07] bg-ink-950/60 p-1 backdrop-blur-md"
      >
        <span
          ref={pillRef}
          aria-hidden
          className="absolute bottom-1 top-1 rounded-xl border border-white/10 bg-ink-800 shadow-[0_4px_18px_rgba(0,0,0,0.5)]"
          style={{ left: 0, width: "33.333%" }}
        />
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              ref={(el) => { btnRefs.current[id] = el; }}
              onClick={() => onSelect(id)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-extrabold tracking-wide transition-colors duration-200 ${
                active ? "text-tungsten-300" : "text-stone-500 hover:text-stone-300"
              }`}
            >
              <Icon size={13} strokeWidth={2.5} />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
