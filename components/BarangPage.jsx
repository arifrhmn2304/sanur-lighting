"use client";

import { useLayoutEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Plus, Trash2, CloudUpload, Loader2, PackagePlus } from "lucide-react";

export default function BarangPage({
  barang,
  onNama,
  onHarga,
  onDelete,
  onAdd,
  onSaveCloud,
  savingCloud,
  adding,
}) {
  const listRef = useRef(null);
  const namaRef = useRef(null);
  const hargaRef = useRef(null);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || !el.children.length) return;
    const anim = animate(el.children, {
      opacity: [0, 1],
      y: [12, 0],
      delay: stagger(18),
      duration: 440,
      ease: "out(3)",
    });
    return () => { try { anim.revert(); } catch { /* noop */ } };
  }, []);

  const handleAdd = () => {
    onAdd(namaRef.current.value, hargaRef.current.value);
    namaRef.current.value = "";
    hargaRef.current.value = "";
    namaRef.current.focus();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col p-3 lg:grid lg:min-h-0 lg:grid-cols-[minmax(320px,360px)_1fr] lg:gap-4 lg:p-4">
      {/* Tambah barang */}
      <section className="card mb-3 flex-shrink-0 space-y-2.5 self-start p-3.5 lg:mb-0">
        <div className="flex items-center gap-2">
          <PackagePlus size={13} className="text-tungsten-400" strokeWidth={2.5} />
          <span className="label-cap">Tambah Lampu Baru</span>
        </div>
        <div className="flex gap-2">
          <input
            ref={namaRef}
            type="text"
            placeholder="Nama lampu"
            className="field min-w-0 flex-1"
            autoComplete="off"
          />
          <input
            ref={hargaRef}
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Harga"
            className="field w-24 flex-shrink-0 text-right font-mono"
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className="btn btn-primary h-10 w-full text-xs"
        >
          {adding ? <Loader2 size={14} className="animate-spin" strokeWidth={2.75} /> : <Plus size={14} strokeWidth={3} />}
          Tambah & Aktifkan di Semua HP
        </button>
      </section>

      {/* Daftar master */}
      <div className="flex min-h-0 flex-col">
        <div className="mb-2 flex flex-shrink-0 items-center justify-between px-1">
          <span className="label-cap">Daftar Master & Harga</span>
          <button
            type="button"
            onClick={onSaveCloud}
            disabled={savingCloud}
            className="btn btn-emerald h-8 gap-1.5 rounded-lg px-3 text-[10.5px]"
          >
            {savingCloud ? (
              <Loader2 size={12} className="animate-spin" strokeWidth={2.75} />
            ) : (
              <CloudUpload size={12} strokeWidth={2.75} />
            )}
            Simpan ke Cloud
          </button>
        </div>

        <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto pr-0.5">
          {barang.map((item, index) => (
            <div key={index} className="card flex items-center gap-1.5 p-2.5">
              <span className="w-5 flex-shrink-0 text-center font-mono text-[9.5px] font-bold text-stone-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <input
                type="text"
                value={item.nama}
                onChange={(e) => onNama(index, e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-1.5 text-[11px] font-extrabold text-stone-100 outline-none transition focus:border-white/[0.12] focus:bg-white/[0.04]"
                autoComplete="off"
              />
              <div className="flex flex-shrink-0 items-center gap-0.5 rounded-lg border border-white/[0.08] bg-ink-950/60 px-2 py-1">
                <span className="text-[9.5px] font-extrabold text-stone-500">Rp</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={item.harga}
                  onChange={(e) => onHarga(index, e.target.value)}
                  className="w-16 bg-transparent text-right font-mono text-[11px] font-extrabold text-tungsten-400 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => onDelete(index)}
                aria-label={`Hapus ${item.nama}`}
                className="flex-shrink-0 p-1 text-stone-600 transition hover:text-rose-400 active:scale-90"
              >
                <Trash2 size={14} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
