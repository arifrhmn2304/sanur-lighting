"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, masterDocRef } from "@/lib/firebase";
import { todayISO } from "@/lib/format";
import Ambient from "@/components/Ambient";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import ToastStack from "@/components/Toast";
import InputPage from "@/components/InputPage";
import RiwayatPage from "@/components/RiwayatPage";
import BarangPage from "@/components/BarangPage";
import DetailSheet from "@/components/DetailSheet";
import { StrukModal, PinModal, ConfirmDialog } from "@/components/Modals";

const OWNER_PIN = "23";

// Master barang default (identik dengan versi lama, dipakai jika cloud kosong)
const DEFAULT_BARANG = [
  { no: 1, nama: "LAMPU PENERANGAN", harga: 9000 },
  { no: 2, nama: "LAMPU KRISTAL", harga: 15000 },
  { no: 3, nama: "LAMPU BURUNG", harga: 9000 },
  { no: 4, nama: "LAMPU SOROT PUTIH/GOLD", harga: 9000 },
  { no: 5, nama: "LAMPU SOROT KECIL", harga: 5000 },
  { no: 6, nama: "LAMPU BUNGA BESAR/KECIL", harga: 9000 },
  { no: 7, nama: "LAMPU TULIP", harga: 9000 },
  { no: 8, nama: "PANEL LISTRIK", harga: 15000 },
  { no: 9, nama: "PARLED", harga: 9000 },
  { no: 10, nama: "LAMPU KUPU KUPU", harga: 15000 },
  { no: 11, nama: "LAMPU APEL", harga: 9000 },
  { no: 12, nama: "LAMPU KLENTONG", harga: 9000 },
  { no: 13, nama: "LAMPU PAGAR", harga: 15000 },
  { no: 14, nama: "LAMPU KELAP KELIP", harga: 15000 },
  { no: 15, nama: "LAMPU RAMADHAN", harga: 15000 },
  { no: 16, nama: "LAMPU LAMPION", harga: 45000 },
  { no: 17, nama: "LAMPU AKRILIK", harga: 45000 },
];

export default function Home() {
  const [tab, setTab] = useState("input");
  const [barang, setBarang] = useState(() => DEFAULT_BARANG.map((i) => ({ ...i, qty: 0 })));
  const [alamat, setAlamat] = useState("");
  const [tanggal, setTanggal] = useState(todayISO);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [authed, setAuthed] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  const [riwayat, setRiwayat] = useState([]);
  const [riwayatKey, setRiwayatKey] = useState(0);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [search, setSearch] = useState("");

  const [detail, setDetail] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const [savingCloud, setSavingCloud] = useState(false);
  const [adding, setAdding] = useState(false);

  const [toasts, setToasts] = useState([]);
  const toastSeq = useRef(0);
  const toast = useCallback((msg, type = "info") => {
    const id = ++toastSeq.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2900);
  }, []);

  /* ------------------------- Master barang realtime ------------------------- */
  useEffect(() => {
    const unsub = onSnapshot(
      masterDocRef,
      (snap) => {
        if (snap.exists() && snap.data().items) {
          const items = snap.data().items;
          setBarang((prev) =>
            items.map((item) => {
              const old = prev.find((b) => b.nama === item.nama);
              return { ...item, qty: old ? old.qty || 0 : 0 };
            })
          );
        } else {
          setDoc(masterDocRef, { items: DEFAULT_BARANG }).catch(() => {});
        }
      },
      (err) => console.error("Snapshot master error:", err)
    );
    return () => unsub();
  }, []);

  /* -------------------------------- Totals --------------------------------- */
  const totals = useMemo(() => {
    const grand = barang.reduce((a, c) => a + (c.harga || 0) * (c.qty || 0), 0);
    return { grand, pasang: Math.round(grand * 0.6), bongkar: Math.round(grand * 0.4) };
  }, [barang]);
  const selCount = useMemo(() => barang.filter((i) => (i.qty || 0) > 0).length, [barang]);

  const onQty = useCallback((index, value) => {
    setBarang((prev) => prev.map((b, i) => (i === index ? { ...b, qty: value } : b)));
  }, []);

  const resetForm = useCallback(() => {
    setAlamat("");
    setTanggal(todayISO());
    setEditingId(null);
    setBarang((prev) => prev.map((b) => ({ ...b, qty: 0 })));
  }, []);

  /* ------------------------------ Simpan transaksi ------------------------- */
  const handleSave = async () => {
    if (saving) return;
    if (!alamat.trim()) {
      toast("Alamat wajib diisi dulu", "error");
      const inputs = [...document.querySelectorAll("[data-alamat-input]")];
      const visible = inputs.find((n) => n.offsetParent !== null) || inputs[0];
      visible?.focus();
      return;
    }
    const picked = barang.filter((i) => (i.qty || 0) > 0);
    if (picked.length === 0) {
      toast("Isi jumlah minimal 1 barang", "error");
      return;
    }
    setSaving(true);
    const items = picked.map((i) => ({
      nama_barang: i.nama,
      harga_satuan: i.harga,
      jumlah: i.qty,
      total: i.harga * i.qty,
    }));
    try {
      if (editingId) {
        await updateDoc(doc(db, "rekap_transaksi", editingId), {
          alamat: alamat.trim(),
          tanggal,
          items,
          grand_total: totals.grand,
          biaya_pasang: totals.pasang,
          biaya_bongkar: totals.bongkar,
        });
        toast("Transaksi berhasil diperbarui", "success");
      } else {
        await addDoc(collection(db, "rekap_transaksi"), {
          alamat: alamat.trim(),
          tanggal,
          items,
          grand_total: totals.grand,
          biaya_pasang: totals.pasang,
          biaya_bongkar: totals.bongkar,
          created_at: serverTimestamp(),
        });
        toast("Transaksi tersimpan di Firebase", "success");
      }
      window.dispatchEvent(new Event("lampu:burst"));
      resetForm();
    } catch (err) {
      console.error(err);
      toast("Gagal menyimpan — cek koneksi", "error");
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------- Riwayat ------------------------------- */
  const loadRiwayat = useCallback(async () => {
    setLoadingRiwayat(true);
    try {
      const q = query(collection(db, "rekap_transaksi"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      setRiwayat(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setRiwayatKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      toast("Gagal memuat riwayat", "error");
    } finally {
      setLoadingRiwayat(false);
    }
  }, [toast]);

  const filteredRiwayat = useMemo(() => {
    const kw = search.toLowerCase().trim();
    if (!kw) return riwayat;
    return riwayat.filter((item) => (item.alamat || "").toLowerCase().includes(kw));
  }, [riwayat, search]);

  /* ------------------------------- Tabs & PIN ------------------------------ */
  const selectTab = (id) => {
    if (id === "barang" && !authed) {
      setPinOpen(true);
      return;
    }
    setTab(id);
    if (id === "riwayat") loadRiwayat();
  };

  const onPinSuccess = () => {
    setAuthed(true);
    setPinOpen(false);
    setTab("barang");
    toast("Akses pemilik dibuka", "success");
    window.dispatchEvent(new Event("lampu:burst"));
  };

  /* ------------------------------- Edit transaksi -------------------------- */
  const startEdit = () => {
    const d = detail;
    if (!d) return;
    setEditingId(d.id);
    setAlamat(d.alamat || "");
    setTanggal(d.tanggal || todayISO());
    setBarang((prev) =>
      prev.map((b) => {
        const found = (d.items || []).find((i) => i.nama_barang === b.nama);
        return { ...b, qty: found ? found.jumlah : 0 };
      })
    );
    setDetail(null);
    setTab("input");
  };

  /* ------------------------------ Master barang ---------------------------- */
  const saveMasterCloud = async () => {
    setSavingCloud(true);
    try {
      const items = barang.map((i) => ({
        no: i.no || 1,
        nama: i.nama || "BARANG BARU",
        harga: Number(i.harga) || 0,
      }));
      await setDoc(masterDocRef, { items });
      toast("Master barang tersinkron ke semua HP", "success");
      window.dispatchEvent(new Event("lampu:burst"));
    } catch (err) {
      console.error(err);
      toast("Gagal menyimpan ke cloud", "error");
    } finally {
      setSavingCloud(false);
    }
  };

  const addMaster = async (namaRaw, hargaRaw) => {
    const nama = String(namaRaw || "").trim().toUpperCase();
    const harga = parseInt(hargaRaw, 10) || 0;
    if (!nama || harga <= 0) {
      toast("Nama & harga harus diisi dengan benar", "error");
      return;
    }
    setAdding(true);
    try {
      const items = [...barang, { no: barang.length + 1, nama, harga }].map((i) => ({
        no: i.no || 1,
        nama: i.nama || "BARANG BARU",
        harga: Number(i.harga) || 0,
      }));
      await setDoc(masterDocRef, { items });
      toast("Barang baru aktif di semua HP", "success");
      window.dispatchEvent(new Event("lampu:burst"));
    } catch (err) {
      console.error(err);
      toast("Gagal menambah barang ke cloud", "error");
    } finally {
      setAdding(false);
    }
  };

  const removeMasterLocal = () => {
    const idx = confirmDel;
    if (idx === null) return;
    setBarang((prev) => prev.filter((_, i) => i !== idx));
    setConfirmDel(null);
    toast("Dihapus sementara — tekan 'Simpan ke Cloud' untuk permanen", "info");
  };

  /* ---------------------------------- Render ------------------------------- */
  return (
    <>
      <Ambient />
      {/* Cahaya hangat dari atas frame */}
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(120%_75%_at_50%_-10%,rgba(247,164,40,0.08),transparent_55%)]" />

      <div className="relative z-10 flex h-dvh w-full justify-center lg:items-center">
        <main className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-[#0b0b0e]/85 lg:h-[min(940px,calc(100dvh-56px))] lg:max-w-6xl lg:rounded-[1.8rem] lg:border lg:border-white/[0.08] lg:shadow-[0_50px_140px_-30px_rgba(0,0,0,0.9)]">
          <Header />
          <TabBar tab={tab} onSelect={selectTab} />

          {tab === "input" && (
            <InputPage
              barang={barang}
              onQty={onQty}
              alamat={alamat}
              setAlamat={setAlamat}
              tanggal={tanggal}
              setTanggal={setTanggal}
              totals={totals}
              selCount={selCount}
              editing={!!editingId}
              saving={saving}
              onSave={handleSave}
              onCancel={resetForm}
            />
          )}

          {tab === "riwayat" && (
            <RiwayatPage
              search={search}
              setSearch={setSearch}
              loading={loadingRiwayat}
              animKey={riwayatKey}
              list={filteredRiwayat}
              detail={detail}
              onOpen={setDetail}
              onCloseDetail={() => setDetail(null)}
              onEdit={startEdit}
              onReceipt={() => setReceipt(detail)}
              onRefresh={loadRiwayat}
            />
          )}

          {tab === "barang" && (
            <BarangPage
              barang={barang}
              onNama={(i, v) => setBarang((prev) => prev.map((b, j) => (j === i ? { ...b, nama: v } : b)))}
              onHarga={(i, v) => setBarang((prev) => prev.map((b, j) => (j === i ? { ...b, harga: v } : b)))}
              onDelete={setConfirmDel}
              onAdd={addMaster}
              onSaveCloud={saveMasterCloud}
              savingCloud={savingCloud}
              adding={adding}
            />
          )}

          <DetailSheet
            data={detail}
            onClose={() => setDetail(null)}
            onEdit={startEdit}
            onReceipt={() => setReceipt(detail)}
          />

          <StrukModal data={receipt} onClose={() => setReceipt(null)} onNotify={toast} />

          {pinOpen && (
            <PinModal pin={OWNER_PIN} onClose={() => setPinOpen(false)} onSuccess={onPinSuccess} />
          )}

          <ConfirmDialog
            open={confirmDel !== null}
            title="Hapus barang ini?"
            desc={
              confirmDel !== null && barang[confirmDel]
                ? `"${barang[confirmDel].nama}" akan dihapus dari daftar master. Tekan "Simpan ke Cloud" untuk menjadikannya permanen.`
                : ""
            }
            confirmLabel="Hapus"
            onCancel={() => setConfirmDel(null)}
            onConfirm={removeMasterLocal}
          />

          <ToastStack toasts={toasts} />
        </main>
      </div>

      <p className="fixed bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 font-mono text-[9px] font-bold tracking-[0.35em] text-stone-600 lg:flex">
        SANUR LIGHTING · SISTEM REKAP CAHAYA
      </p>
    </>
  );
}
