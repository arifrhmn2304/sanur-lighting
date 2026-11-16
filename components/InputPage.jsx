"use client";

import { useLayoutEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Minus, Plus, MapPin, CalendarDays, Save, Loader2, X, Lightbulb } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import { formatRupiah } from "@/lib/format";

/* ------------------------------- Item row -------------------------------- */

function ItemRow({ item, index, onQty }) {
  const ref = useRef(null);
  const prevQty = useRef(item.qty);

  useLayoutEffect(() => {
    if (prevQty.current !== item.qty && ref.current) {
      const el = ref.current;
      el.classList.remove("pop");
      void el.offsetWidth; // retrigger animation
      el.classList.add("pop");
    }
    prevQty.current = item.qty;
  }, [item.qty]);

  const selected = (item.qty || 0) > 0;
  const qtyBtn =
    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border transition active:scale-90";

  return (
    <div
      ref={ref}
      className={`card flex items-center gap-2 p-3 transition-colors duration-300 lg:flex-col lg:items-stretch lg:justify-center lg:gap-2 ${
        selected ? "card-active" : ""
      }`}
    >
      <div className="min-w-0 flex-1 lg:flex-none">
        <h3 className="truncate text-[12.5px] font-extrabold leading-tight text-stone-100">
          {item.nama}
        </h3>
        <p className="mt-0.5 truncate font-mono text-[10px] font-bold text-stone-500">
          {formatRupiah(item.harga)}
          {selected && (
            <span className="text-tungsten-400/90"> · {formatRupiah(item.harga * item.qty)}</span>
          )}
        </p>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5 lg:ml-auto lg:w-full lg:justify-between">
        {/* subtotal khusus desktop (di mobile sudah inline di bawah nama) */}
        <span
          className={`hidden font-mono text-[10.5px] font-extrabold lg:inline ${
            selected ? "text-tungsten-400" : "text-transparent"
          }`}
        >
          {formatRupiah(item.harga * (item.qty || 0))}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onQty(index, Math.max(0, (item.qty || 0) - 1))}
            disabled={!selected}
            aria-label={`Kurangi ${item.nama}`}
            className={`${qtyBtn} ${
              selected
                ? "border-white/10 bg-white/[0.06] text-stone-200 hover:bg-white/[0.12]"
                : "border-white/[0.05] bg-white/[0.02] text-stone-700"
            }`}
          >
            <Minus size={13} strokeWidth={3} />
          </button>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={item.qty || ""}
            placeholder="0"
            onChange={(e) => onQty(index, Math.max(0, parseInt(e.target.value, 10) || 0))}
            aria-label={`Jumlah ${item.nama}`}
            className="h-8 w-11 rounded-xl border border-white/[0.09] bg-ink-950/70 text-center font-mono text-[12px] font-extrabold text-tungsten-300 outline-none transition placeholder:text-stone-700 focus:border-tungsten-500/60 focus:ring-2 focus:ring-tungsten-500/15"
          />
          <button
            type="button"
            onClick={() => onQty(index, (item.qty || 0) + 1)}
            aria-label={`Tambah ${item.nama}`}
            className={`${qtyBtn} border-tungsten-500/30 bg-tungsten-500/15 text-tungsten-300 shadow-[0_4px_14px_-6px_rgba(247,164,40,0.55)] hover:bg-tungsten-500/25`}
          >
            <Plus size={13} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Stat ---------------------------------- */

function Stat({ label, value, first }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:py-1.5 ${
        first ? "" : "lg:border-t lg:border-white/[0.06]"
      }`}
    >
      <span className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-stone-500 lg:text-[9px]">
        {label}
      </span>
      <span className="font-mono text-[11.5px] font-extrabold text-stone-200 lg:text-[12.5px]">
        {formatRupiah(value)}
      </span>
    </div>
  );
}

/* --------------------------- Keterangan acara ----------------------------- */

function KeteranganFields({ alamat, setAlamat, tanggal, setTanggal, idSuffix = "m", className = "" }) {
  return (
    <section className={`card space-y-3 p-3.5 ${className}`}>
      <div>
        <label htmlFor={`alamat-${idSuffix}`} className="label-cap mb-1.5 flex items-center gap-1.5">
          <MapPin size={10} className="text-tungsten-400" strokeWidth={3} />
          Lokasi / Alamat Acara
        </label>
        <input
          id={`alamat-${idSuffix}`}
          data-alamat-input
          type="text"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          placeholder="Contoh: Berok Rakik / Gedung DPD"
          className="field"
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor={`tanggal-${idSuffix}`} className="label-cap mb-1.5 flex items-center gap-1.5">
          <CalendarDays size={10} className="text-tungsten-400" strokeWidth={3} />
          Tanggal Transaksi
        </label>
        <input
          id={`tanggal-${idSuffix}`}
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="field appearance-none"
        />
      </div>
    </section>
  );
}

/* ------------------------------ Panel ringkasan --------------------------- */

function SummaryCard({ totals, editing, saving, onSave, onCancel, className = "" }) {
  return (
    <section className={`card space-y-3 p-3.5 ${className}`}>
      <div className="grid grid-cols-3 rounded-xl border border-white/[0.06] bg-ink-950/50 py-2 text-center lg:grid-cols-1 lg:py-1.5">
        <Stat label="Sewa Lampu" value={totals.grand} first />
        <Stat label="Pasang 60%" value={totals.pasang} />
        <Stat label="Bongkar 40%" value={totals.bongkar} />
      </div>

      <div className="flex items-end justify-between gap-2.5">
        <div className="min-w-0">
          <p className="label-cap mb-0.5">Grand Total</p>
          <AnimatedNumber
            value={totals.grand}
            className="inline-block font-mono text-xl font-extrabold tracking-tight text-tungsten-400"
          />
        </div>
        <div className="flex flex-1 justify-end gap-2">
          {editing && (
            <button type="button" onClick={onCancel} className="btn btn-ghost h-10 px-3 text-[11px]">
              <X size={14} strokeWidth={2.75} />
              Batal
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="btn btn-primary h-10 flex-1 px-4 text-xs"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" strokeWidth={2.75} />
            ) : (
              <Save size={14} strokeWidth={2.75} />
            )}
            {saving ? "Menyimpan…" : editing ? "Perbarui Transaksi" : "Simpan Transaksi"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Page ---------------------------------- */

export default function InputPage({
  barang,
  onQty,
  alamat,
  setAlamat,
  tanggal,
  setTanggal,
  totals,
  selCount,
  editing,
  saving,
  onSave,
  onCancel,
}) {
  const listRef = useRef(null);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || !el.children.length) return;
    const anim = animate(el.children, {
      opacity: [0, 1],
      y: [14, 0],
      delay: stagger(20),
      duration: 480,
      ease: "out(3)",
    });
    return () => { try { anim.revert(); } catch { /* noop */ } };
  }, []);

  const listHeader = (
    <div className="flex items-center justify-between px-1 pt-0.5">
      <span className="label-cap">Daftar Lampu Tersedia</span>
      <span
        className={`chip border ${
          selCount > 0
            ? "border-tungsten-500/25 bg-tungsten-500/10 text-tungsten-300"
            : "border-white/[0.08] bg-white/[0.04] text-stone-400"
        }`}
      >
        {selCount} dipilih
      </span>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-[1fr_minmax(330px,370px)]">
      {/* Area utama */}
      <div className="flex min-h-0 flex-col">
        <div className="flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-3 pb-4 pt-3 lg:p-4">
          <KeteranganFields
            alamat={alamat}
            setAlamat={setAlamat}
            tanggal={tanggal}
            setTanggal={setTanggal}
            idSuffix="m"
            className="lg:hidden"
          />
          {listHeader}
          <div ref={listRef} className="grid grid-cols-1 gap-2 overflow-x-hidden lg:grid-cols-2 lg:gap-2.5">
            {barang.map((item, index) => (
              <ItemRow key={item.nama} item={item} index={index} onQty={onQty} />
            ))}
          </div>
        </div>

        {/* Bar bawah — khusus mobile */}
        <div className="z-10 flex-shrink-0 border-t border-white/[0.06] bg-ink-950/70 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
          <SummaryCard totals={totals} editing={editing} saving={saving} onSave={onSave} onCancel={onCancel} />
        </div>
      </div>

      {/* Panel kanan — khusus desktop */}
      <aside className="hidden min-h-0 flex-col gap-3.5 border-l border-white/[0.06] p-4 lg:flex">
        <KeteranganFields
          alamat={alamat}
          setAlamat={setAlamat}
          tanggal={tanggal}
          setTanggal={setTanggal}
          idSuffix="d"
        />
        <SummaryCard totals={totals} editing={editing} saving={saving} onSave={onSave} onCancel={onCancel} />

        <div className="card mt-auto p-3.5">
          <div className="flex items-start gap-2.5">
            <Lightbulb size={14} className="mt-0.5 flex-shrink-0 text-tungsten-400" strokeWidth={2.5} />
            <div>
              <p className="text-[11px] font-extrabold text-stone-200">Pembagian otomatis</p>
              <p className="mt-1 text-[10.5px] font-semibold leading-relaxed text-stone-500">
                Biaya pasang (60%) dan bongkar (40%) dihitung otomatis dari total sewa lampu.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
