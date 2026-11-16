"use client";

import BottomSheet from "./BottomSheet";
import { formatRupiah, formatDateID } from "@/lib/format";
import { X, Pencil, ReceiptText } from "lucide-react";

/**
 * Isi detail transaksi — dipakai di 2 tempat:
 *  - variant="sheet" : bottom sheet di mobile
 *  - variant="panel" : panel kanan di desktop (layout master–detail)
 */
export function DetailBody({ data, onClose, onEdit, onReceipt, variant = "sheet" }) {
  const panel = variant === "panel";

  return (
    <div
      className={
        panel
          ? "card flex min-h-0 flex-1 flex-col overflow-hidden"
          : "rounded-t-[1.75rem] border border-b-0 border-white/[0.09] bg-ink-850 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(0,0,0,0.6)]"
      }
    >
      {!panel && (
        <div className="flex justify-center pt-2.5">
          <span className="h-1 w-9 rounded-full bg-white/15" />
        </div>
      )}

      {/* Header */}
      <div className={`flex items-start justify-between gap-3 border-b border-white/[0.07] px-4 pb-3 ${panel ? "pt-4" : "pt-3"}`}>
        <div className="min-w-0">
          <h2 className="truncate font-display text-sm font-bold text-stone-100">{data.alamat || "-"}</h2>
          <p className="mt-0.5 text-[10.5px] font-bold text-stone-500">
            Tanggal: <span className="font-mono">{formatDateID(data.tanggal)}</span>
            {panel && (
              <>
                {" · "}
                <span className="font-mono">{data.items?.length ?? 0} item</span>
              </>
            )}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-stone-400 transition hover:text-stone-100 active:scale-90"
          >
            <X size={13} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Item rincian */}
      <div className={`min-h-0 space-y-0.5 overflow-y-auto px-4 py-3 ${panel ? "flex-1" : "max-h-[36vh]"}`}>
        {data.items.map((i, idx) => (
          <div key={idx} className="flex items-baseline justify-between gap-3 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-extrabold text-stone-200">{i.nama_barang}</p>
              <p className="font-mono text-[9.5px] font-bold text-stone-500">
                {i.jumlah} × {formatRupiah(i.harga_satuan)}
              </p>
            </div>
            <span className="flex-shrink-0 font-mono text-[11.5px] font-extrabold text-stone-100">
              {formatRupiah(i.total)}
            </span>
          </div>
        ))}
      </div>

      {/* Ringkasan */}
      <div className={`mx-4 rounded-2xl border border-white/[0.07] bg-ink-950/60 p-3 text-[11.5px] ${panel ? "mt-auto" : ""}`}>
        <div className="flex justify-between py-0.5 text-stone-300">
          <span className="font-semibold">Sewa Lampu</span>
          <span className="font-mono font-bold text-stone-100">{formatRupiah(data.grand_total)}</span>
        </div>
        <div className="flex justify-between py-0.5 text-[10.5px] text-stone-500">
          <span className="font-semibold">Pasang (60%)</span>
          <span className="font-mono font-bold">{formatRupiah(data.biaya_pasang)}</span>
        </div>
        <div className="flex justify-between py-0.5 text-[10.5px] text-stone-500">
          <span className="font-semibold">Bongkar (40%)</span>
          <span className="font-mono font-bold">{formatRupiah(data.biaya_bongkar)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-white/[0.08] pt-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">Grand Total</span>
          <span className="font-mono text-sm font-extrabold text-emerald-400">{formatRupiah(data.grand_total)}</span>
        </div>
      </div>

      {/* Aksi */}
      <div className={`space-y-2 px-4 pt-3 ${panel ? "pb-4" : ""}`}>
        <button type="button" onClick={onReceipt} className="btn btn-primary h-10 w-full text-xs">
          <ReceiptText size={14} strokeWidth={2.75} />
          Tampilkan Struk (PNG)
        </button>
        <button type="button" onClick={onEdit} className="btn btn-ghost h-10 w-full text-xs">
          <Pencil size={13} strokeWidth={2.75} />
          Edit Transaksi Ini
        </button>
      </div>
    </div>
  );
}

export default function DetailSheet({ data, onClose, onEdit, onReceipt }) {
  return (
    <BottomSheet open={!!data} onClose={onClose} className="lg:hidden">
      {data && (
        <DetailBody data={data} onClose={onClose} onEdit={onEdit} onReceipt={onReceipt} />
      )}
    </BottomSheet>
  );
}
