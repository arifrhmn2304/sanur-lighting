"use client";

import { useEffect, useRef, useState } from "react";
import { formatRupiah, formatRupiahShort, formatDateID } from "@/lib/format";
import { renderStrukPNG } from "@/lib/strukCanvas";
import { X, Smartphone, KeyRound, Loader2, Send, Copy, Download } from "lucide-react";
import { animate } from "animejs";

/* ---------------------- Fallback struk DOM (jika canvas gagal) ---------------------- */

function StrukFallback({ data }) {
  const many = (data.items?.length ?? 0) > 10;
  const notaNo = data.id ? data.id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() : "000000";
  return (
    <div className="w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/[0.09] bg-ink-850 p-2.5 shadow-2xl">
      <div className="overflow-hidden rounded-t-xl">
        <div className="bg-ink-900 px-4 pb-3 pt-4 font-mono text-[10.5px]">
          <div className="border-b border-dashed border-white/15 pb-2.5 text-center">
            <p className="font-extrabold tracking-[0.28em] text-stone-100">SANUR LIGHTING</p>
            <p className="mt-1 text-[7.5px] font-bold uppercase tracking-[0.3em] text-stone-500">Nota Keuangan Lampu</p>
            <div className="mt-2 flex items-center justify-between border-t border-white/[0.07] px-0.5 pt-1.5 text-[8.5px] font-bold text-stone-500">
              <span className="max-w-[170px] truncate uppercase">Lok: <span className="text-stone-300">{data.alamat}</span></span>
              <span>Tgl: <span className="text-stone-300">{formatDateID(data.tanggal)}</span></span>
            </div>
          </div>
          {many ? (
            <div className="grid grid-cols-2 gap-x-3 border-b border-dashed border-white/15 py-2 text-[8.5px]">
              {data.items.map((i, idx) => (
                <div key={idx} className="flex items-baseline justify-between gap-1 border-b border-white/[0.06] py-0.5">
                  <span className="max-w-[105px] truncate font-extrabold text-stone-200">{i.nama_barang}</span>
                  <span className="flex-shrink-0 font-extrabold text-tungsten-400">{i.jumlah}× {formatRupiah(i.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 border-b border-dashed border-white/15 py-2 text-[9.5px]">
              {data.items.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 border-b border-white/[0.06] py-1">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold tracking-tight text-stone-100">{i.nama_barang}</p>
                    <p className="text-[8px] font-bold text-stone-500">{i.jumlah} × {formatRupiahShort(i.harga_satuan)}</p>
                  </div>
                  <span className="flex-shrink-0 font-extrabold text-tungsten-400">{formatRupiah(i.total)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-0.5 pt-2 text-[9px]">
            <div className="flex justify-between font-bold text-stone-300">
              <span>Sewa Lampu:</span>
              <span className="font-extrabold text-stone-100">{formatRupiah(data.grand_total)}</span>
            </div>
            <div className="flex justify-between text-[8.5px] text-stone-500">
              <span>Pasang (60%): <span className="text-stone-300">{formatRupiah(data.biaya_pasang)}</span></span>
              <span>Bongkar (40%): <span className="text-stone-300">{formatRupiah(data.biaya_bongkar)}</span></span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-white/15 pt-1.5 text-[10px]">
              <span className="font-extrabold text-stone-300">TOTAL:</span>
              <span className="text-[11px] font-extrabold text-tungsten-400">{formatRupiah(data.grand_total)}</span>
            </div>
          </div>
          <div className="mt-2.5 border-t border-dashed border-white/10 pt-2 text-center">
            <p className="text-[7.5px] font-bold tracking-wider text-stone-500">NO. {notaNo}</p>
            <p className="mt-1 text-[8px] font-bold text-stone-500">*** Terima Kasih — Sanur Collection ***</p>
          </div>
        </div>
        <div className="zz" />
      </div>
    </div>
  );
}

/* ---------------------------------- Struk PNG ---------------------------------- */

function StrukModal({ data, onClose, onNotify }) {
  const [png, setPng] = useState(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) {
      setPng(null);
      setFailed(false);
      return;
    }
    let alive = true;
    let url = null;
    setPng(null);
    setFailed(false);
    renderStrukPNG(data, "/sanurlighting.png")
      .then((p) => {
        if (!alive) {
          URL.revokeObjectURL(p.url);
          return;
        }
        url = p.url;
        setPng(p);
      })
      .catch((err) => {
        console.error("renderStrukPNG gagal:", err);
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, onClose]);

  if (!data) return null;

  const caption = `Nota ${data.alamat || "-"} — ${formatDateID(data.tanggal)} — Total ${formatRupiah(data.grand_total)} (Sanur Lighting)`;

  const doShare = async () => {
    if (!png || busy) return;
    setBusy(true);
    try {
      const file = new File([png.blob], png.name, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Nota Sanur Lighting",
          text: caption,
        });
      } else {
        // Fallback: unduh PNG + buka WhatsApp dengan caption
        const a = document.createElement("a");
        a.href = png.url;
        a.download = png.name;
        a.click();
        onNotify?.("PNG nota diunduh — tinggal lampirkan di chat WA", "info");
        window.open("https://wa.me/?text=" + encodeURIComponent(caption), "_blank");
        return;
      }
    } catch (err) {
      if (err && err.name === "AbortError") return; // user batal share
      onNotify?.("Gagal membagikan — coba Unduh PNG", "error");
    } finally {
      setBusy(false);
    }
  };

  const doCopy = async () => {
    if (!png) return;
    try {
      if (typeof ClipboardItem === "undefined") throw new Error("no-support");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png.blob })]);
      onNotify?.("Gambar nota disalin — tinggal paste di chat", "success");
    } catch {
      onNotify?.("Browser tidak mendukung salin gambar — pakai Unduh PNG", "error");
    }
  };

  const doDownload = () => {
    if (!png) return;
    const a = document.createElement("a");
    a.href = png.url;
    a.download = png.name;
    a.click();
    onNotify?.("PNG nota diunduh", "success");
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center p-3" role="dialog" aria-modal="true">
      <div onClick={onClose} className="absolute inset-0 bg-ink-950/85 backdrop-blur-md" />

      <div className="relative z-10 flex max-h-full w-full max-w-[380px] flex-col items-center gap-3 overflow-y-auto py-1">
        {/* Preview PNG */}
        {png ? (
          <img
            src={png.url}
            alt="Nota Sanur Lighting"
            className="w-auto max-w-full rounded-2xl"
            style={{ maxHeight: "50vh" }}
          />
        ) : failed ? (
          <StrukFallback data={data} />
        ) : (
          <div className="w-full max-w-[300px] space-y-2 rounded-2xl border border-white/[0.09] bg-ink-850 p-4">
            <div className="flex h-16 animate-pulse items-center justify-center rounded-xl bg-white/[0.05]">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500">Menyiapkan PNG…</span>
            </div>
            <div className="h-3 animate-pulse rounded bg-white/[0.05]" />
            <div className="h-3 animate-pulse rounded bg-white/[0.05]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.05]" />
          </div>
        )}

        <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-bold text-stone-500">
          <Smartphone size={11} strokeWidth={2.5} className="text-tungsten-400" />
          PNG siap kirim — pilih WhatsApp, salin, atau unduh
        </p>

        <button
          type="button"
          onClick={doShare}
          disabled={!png || busy}
          className="btn btn-emerald h-11 w-full text-xs"
        >
          {busy ? <Loader2 size={15} className="animate-spin" strokeWidth={2.75} /> : <Send size={14} strokeWidth={2.75} />}
          Kirim ke WhatsApp
        </button>

        <div className="grid w-full grid-cols-3 gap-2">
          <button type="button" onClick={doCopy} disabled={!png} className="btn btn-ghost h-10 text-[11px]">
            <Copy size={13} strokeWidth={2.5} />
            Salin
          </button>
          <button type="button" onClick={doDownload} disabled={!png} className="btn btn-ghost h-10 text-[11px]">
            <Download size={13} strokeWidth={2.5} />
            Unduh
          </button>
          <button type="button" onClick={onClose} className="btn btn-ghost h-10 text-[11px]">
            <X size={13} strokeWidth={2.5} />
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- PIN ----------------------------------- */

function PinModal({ pin, onClose, onSuccess }) {
  const [value, setValue] = useState("");
  const [checking, setChecking] = useState(false);
  const cardRef = useRef(null);
  const inputRef = useRef(null);

  const shake = () => {
    if (!cardRef.current) return;
    animate(cardRef.current, {
      x: [-9, 8, -6, 4, -2, 0],
      duration: 480,
      ease: "out(3)",
    });
  };

  const submit = () => {
    if (checking) return;
    setChecking(true);
    // jeda kecil agar terasa ada proses auth
    setTimeout(() => {
      if (value.trim() === String(pin)) {
        onSuccess();
      } else {
        setChecking(false);
        setValue("");
        shake();
        inputRef.current?.focus();
      }
    }, 260);
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center p-5" role="dialog" aria-modal="true">
      <div onClick={onClose} className="absolute inset-0 bg-ink-950/80 backdrop-blur-md" />

      <div ref={cardRef} className="card relative z-10 w-full max-w-[300px] space-y-4 p-5 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-tungsten-500/25 bg-tungsten-500/10 shadow-[0_0_24px_-6px_rgba(247,164,40,0.5)]">
          <KeyRound size={19} className="text-tungsten-400" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-stone-100">Akses Khusus Pemilik</h3>
          <p className="mt-1 text-[10.5px] font-semibold leading-relaxed text-stone-500">
            Masukkan PIN untuk mengelola master barang
          </p>
        </div>

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={6}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="••••"
          className="field text-center font-mono text-xl font-extrabold tracking-[0.5em]"
        />

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost h-10 flex-1 text-xs">
            Batal
          </button>
          <button type="button" onClick={submit} disabled={checking} className="btn btn-primary h-10 flex-1 text-xs">
            {checking && <Loader2 size={13} className="animate-spin" strokeWidth={2.75} />}
            Masuk
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Confirm --------------------------------- */

function ConfirmDialog({ open, title, desc, confirmLabel, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center p-5" role="dialog" aria-modal="true">
      <div onClick={onCancel} className="absolute inset-0 bg-ink-950/80 backdrop-blur-md" />
      <div className="card relative z-10 w-full max-w-[290px] space-y-3.5 p-5 text-center shadow-2xl">
        <h3 className="font-display text-sm font-bold text-stone-100">{title}</h3>
        <p className="text-[11px] font-semibold leading-relaxed text-stone-400">{desc}</p>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="btn btn-ghost h-10 flex-1 text-xs">
            Batal
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-danger-ghost h-10 flex-1 text-xs">
            {confirmLabel || "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export { StrukModal, PinModal, ConfirmDialog };
