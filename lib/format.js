export function formatRupiah(num) {
  return "Rp " + (num || 0).toLocaleString("id-ID");
}

export function formatRupiahShort(num) {
  return (num || 0).toLocaleString("id-ID");
}

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// "2025-11-12" -> "12 Nov 2025" (diparse manual agar bebas masalah timezone)
export function formatDateID(s) {
  if (!s) return "-";
  const parts = String(s).split("-");
  if (parts.length !== 3) return s;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return s;
  return `${d} ${BULAN[m - 1]} ${y}`;
}

export function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
