"use client";

import { useLayoutEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Search, RefreshCw, ChevronRight, PackageOpen, MousePointerClick } from "lucide-react";
import { formatRupiah, formatDateID } from "@/lib/format";
import { DetailBody } from "./DetailSheet";

export default function RiwayatPage({
  search,
  setSearch,
  loading,
  animKey,
  list,
  detail,
  onOpen,
  onCloseDetail,
  onEdit,
  onReceipt,
  onRefresh,
}) {
  const listRef = useRef(null);

  // Animasi stagger tiap kali data selesai dimuat (bukan saat mengetik pencarian)
  useLayoutEffect(() => {
    const el = listRef.current;
    if (loading || !el || !el.children.length) return;
    const anim = animate(el.children, {
      opacity: [0, 1],
      y: [12, 0],
      delay: stagger(26),
      duration: 460,
      ease: "out(3)",
    });
    return () => { try { anim.revert(); } catch { /* noop */ } };
  }, [loading, animKey]);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-3 lg:grid lg:min-h-0 lg:grid-cols-[minmax(330px,390px)_1fr] lg:gap-4 lg:p-4">
      {/* Kiri: pencarian + daftar */}
      <div className="flex min-h-0 flex-col">
        <div className="card relative mb-3 flex-shrink-0">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari alamat / nama lokasi…"
            className="field pl-10"
            autoComplete="off"
          />
        </div>

        <div className="mb-2 flex flex-shrink-0 items-center justify-between px-1">
          <span className="label-cap">Riwayat Rekapitulasi</span>
          <button type="button" onClick={onRefresh} className="btn btn-ghost h-7 gap-1.5 rounded-lg px-2.5 text-[10px]">
            <RefreshCw size={11} strokeWidth={3} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto pr-0.5">
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[66px] animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.035]" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2.5 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-ink-850">
                <PackageOpen size={20} className="text-stone-600" strokeWidth={2} />
              </div>
              <p className="text-xs font-extrabold text-stone-400">Belum ada transaksi</p>
              <p className="max-w-[230px] text-[10.5px] font-semibold leading-relaxed text-stone-600">
                {search
                  ? "Tidak ada hasil yang cocok dengan pencarian."
                  : "Transaksi yang tersimpan akan tampil di sini."}
              </p>
            </div>
          ) : (
            <div ref={listRef} className="space-y-2 overflow-x-hidden">
              {list.map((data) => (
                <button
                  key={data.id}
                  type="button"
                  onClick={() => onOpen(data)}
                  className={`card group flex w-full items-center justify-between gap-3 p-3.5 text-left transition hover:border-white/[0.15] active:scale-[0.985] ${
                    detail?.id === data.id ? "card-active" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-extrabold leading-tight text-stone-100">
                      {data.alamat || "-"}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-stone-500">
                      <span className="font-mono">{formatDateID(data.tanggal)}</span>
                      <span className="h-1 w-1 rounded-full bg-stone-700" />
                      <span>{data.items?.length ?? 0} item</span>
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="block font-mono text-[13px] font-extrabold text-tungsten-400">
                      {formatRupiah(data.grand_total)}
                    </span>
                    <span className="mt-0.5 flex items-center justify-end gap-0.5 text-[9px] font-extrabold uppercase tracking-wider text-stone-500 transition group-hover:text-stone-300">
                      Rincian <ChevronRight size={11} strokeWidth={3} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Kanan: panel detail — khusus desktop */}
      <div className="hidden lg:flex lg:min-h-0 lg:flex-col">
        {detail ? (
          <div key={detail.id} className="fade-up flex min-h-0 flex-1 flex-col">
            <DetailBody
              data={detail}
              variant="panel"
              onClose={onCloseDetail}
              onEdit={onEdit}
              onReceipt={onReceipt}
            />
          </div>
        ) : (
          <div className="card flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-ink-900">
              <MousePointerClick size={22} className="text-stone-600" strokeWidth={2} />
            </div>
            <p className="text-[13px] font-extrabold text-stone-300">Pilih transaksi</p>
            <p className="max-w-[280px] text-[11px] font-semibold leading-relaxed text-stone-500">
              Klik salah satu transaksi di kiri untuk melihat rincian, membuat struk PNG, atau mengedit datanya.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
