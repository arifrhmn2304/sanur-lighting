import { formatRupiah, formatRupiahShort, formatDateID } from "./format";

/*
 * renderStrukPNG — menggambar nota sebagai file PNG asli via Canvas API
 * (bukan screenshot layar). Hasilnya tajam (scale 3x), sudut rounded transparan,
 * dengan soft shadow supaya bagus dilihat di chat WhatsApp.
 */

const C = {
  cardBg: "#101014",
  paperBg: "#0d0d10",
  ink: "#f5f2ea",
  gray: "#a8a29e",
  dim: "#78716c",
  amber: "#ffbd5c",
  dash: "rgba(255,255,255,0.16)",
  faint: "rgba(255,255,255,0.10)",
};

const MONO = (weight, size) => `${weight} ${size}px "JetBrains Mono", monospace`;

function rrPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function rrTopPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function fitText(ctx, text, max) {
  if (!text) return "";
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
  return t + "…";
}

function dashLine(ctx, x1, y, x2) {
  ctx.save();
  ctx.strokeStyle = C.dash;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/*
 * Menggambar seluruh nota ke ctx (origin 0,0 = pojok kiri atas KERTAS).
 * Mengembalikan tinggi akhir konten untuk kalkulasi ukuran kertas.
 */
function drawPaper(ctx, data, logo, paperW, notaNo) {
  const padX = 26;
  const contentW = paperW - padX * 2;
  const left = padX;
  const right = padX + contentW;
  const centerX = paperW / 2;
  let y = 26;

  // ---- Header ----
  if (logo && logo.width) {
    const r = 22;
    const ly = y + r;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, ly, r, 0, Math.PI * 2);
    ctx.clip();
    const scale = (r * 2) / Math.min(logo.width, logo.height);
    const lw = logo.width * scale;
    const lh = logo.height * scale;
    ctx.drawImage(logo, centerX - lw / 2, ly - lh / 2, lw, lh);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, ly, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    // titik amber (brand dot)
    ctx.fillStyle = C.amber;
    ctx.beginPath();
    ctx.arc(centerX + r - 2, ly - r + 2, 4, 0, Math.PI * 2);
    ctx.fill();
    y += r * 2 + 16;
  }

  ctx.fillStyle = C.ink;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";
  ctx.font = MONO(800, 13);
  ctx.textAlign = "center";
  ctx.fillText("SANUR LIGHTING", centerX, y);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
  y += 19;
  ctx.fillStyle = C.dim;
  ctx.font = MONO(700, 7);
  ctx.fillText("NOTA KEUANGAN LAMPU", centerX, y);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  y += 18;

  // LOK / TGL — blok tanggal diukur dulu supaya alamat tidak pernah menabraknya
  ctx.font = MONO(700, 8);
  const tglStr = formatDateID(data.tanggal);
  const tglLabelW = ctx.measureText("TGL: ").width;
  const tglW = tglLabelW + ctx.measureText(tglStr).width;
  const lokLabelW = ctx.measureText("LOK: ").width;
  const addr = String(data.alamat || "-").toUpperCase();
  const tglX = right - tglW;

  ctx.textAlign = "left";
  ctx.fillStyle = C.dim;
  ctx.fillText("LOK:", left, y);
  ctx.fillStyle = C.ink;
  if (ctx.measureText(addr).width <= contentW - lokLabelW - tglW - 16) {
    ctx.fillText(addr, left + lokLabelW, y);
    ctx.fillStyle = C.dim;
    ctx.fillText("TGL:", tglX, y);
    ctx.fillStyle = C.gray;
    ctx.fillText(tglStr, tglX + tglLabelW, y);
  } else {
    // alamat panjang: turun satu baris daripada dipotong
    ctx.fillText(fitText(ctx, addr, contentW - lokLabelW), left + lokLabelW, y);
    y += 13;
    ctx.fillStyle = C.dim;
    ctx.fillText("TGL:", left, y);
    ctx.fillStyle = C.gray;
    ctx.fillText(tglStr, left + tglLabelW, y);
  }
  y += 15;

  dashLine(ctx, left, y + 5, right);
  y += 19;

  // ---- Items ----
  const items = data.items || [];
  const many = items.length > 10;

  if (!many) {
    ctx.textAlign = "left";
    items.forEach((i) => {
      ctx.fillStyle = C.amber;
      ctx.font = MONO(800, 10.5);
      ctx.textAlign = "right";
      const totalStr = formatRupiah(i.total);
      ctx.fillText(totalStr, right, y);
      const totalW = ctx.measureText(totalStr).width;

      ctx.textAlign = "left";
      ctx.fillStyle = C.ink;
      ctx.font = MONO(800, 10);
      ctx.fillText(fitText(ctx, i.nama_barang, contentW - totalW - 18), left, y);

      ctx.fillStyle = C.dim;
      ctx.font = MONO(700, 8);
      ctx.fillText(`${i.jumlah} × ${formatRupiahShort(i.harga_satuan)}`, left, y + 12);
      y += 29;
    });
  } else {
    ctx.font = MONO(700, 8);
    const qtyW = ctx.measureText("12× ").width;
    items.forEach((it) => {
      ctx.font = MONO(800, 8.5);
      const totalStr = formatRupiah(it.total);
      const totalW = ctx.measureText(totalStr).width;

      ctx.textAlign = "right";
      ctx.fillStyle = C.amber;
      ctx.fillText(totalStr, right, y);
      ctx.font = MONO(700, 8);
      ctx.fillStyle = C.dim;
      ctx.fillText(`${it.jumlah}×`, right - totalW - 10, y);

      ctx.font = MONO(800, 8.5);
      ctx.textAlign = "left";
      ctx.fillStyle = C.ink;
      ctx.fillText(fitText(ctx, it.nama_barang, contentW - totalW - qtyW - 22), left, y);

      ctx.strokeStyle = C.faint;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, y + 4.5);
      ctx.lineTo(right, y + 4.5);
      ctx.stroke();
      y += 16;
    });
    ctx.textAlign = "left";
  }

  dashLine(ctx, left, y + 5, right);
  y += 19;

  // ---- Totals ----
  ctx.textAlign = "left";
  ctx.fillStyle = C.gray;
  ctx.font = MONO(700, 9.5);
  ctx.fillText("Sewa Lampu:", left, y);
  ctx.textAlign = "right";
  ctx.fillStyle = C.ink;
  ctx.font = MONO(800, 9.5);
  ctx.fillText(formatRupiah(data.grand_total), right, y);
  y += 17;

  ctx.textAlign = "left";
  ctx.fillStyle = C.dim;
  ctx.font = MONO(700, 8);
  ctx.fillText("Pasang (60%):", left, y);
  ctx.textAlign = "right";
  ctx.fillStyle = C.gray;
  ctx.fillText(formatRupiah(data.biaya_pasang), right, y);
  y += 14;

  ctx.textAlign = "left";
  ctx.fillStyle = C.dim;
  ctx.fillText("Bongkar (40%):", left, y);
  ctx.textAlign = "right";
  ctx.fillStyle = C.gray;
  ctx.fillText(formatRupiah(data.biaya_bongkar), right, y);
  y += 19;

  ctx.strokeStyle = C.faint;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(right, y);
  ctx.stroke();
  y += 13;

  ctx.textAlign = "left";
  ctx.fillStyle = C.gray;
  ctx.font = MONO(800, 10.5);
  ctx.fillText("TOTAL:", left, y);
  ctx.textAlign = "right";
  ctx.fillStyle = C.amber;
  ctx.font = MONO(800, 12.5);
  ctx.fillText(formatRupiah(data.grand_total), right, y);
  y += 21;

  dashLine(ctx, left, y + 6, right);
  y += 21;

  // ---- Barcode + footer ----
  const rand = seedFrom(notaNo + "|" + data.grand_total);
  const bw0 = 110;
  const bx0 = centerX - bw0 / 2;
  let bx = bx0;
  ctx.fillStyle = "rgba(168,162,158,0.8)";
  while (bx < bx0 + bw0) {
    const w = 1 + Math.floor(rand() * 2.6);
    ctx.fillRect(bx, y, w, 20);
    bx += w + 1 + Math.floor(rand() * 2.4);
  }
  y += 20 + 10;

  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  ctx.textAlign = "center";
  ctx.fillStyle = C.dim;
  ctx.font = MONO(700, 7.5);
  ctx.fillText(`NO. ${notaNo}`, centerX, y);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  y += 14;

  ctx.fillStyle = C.dim;
  ctx.font = MONO(700, 8);
  ctx.fillText("*** Terima Kasih — Sanur Collection ***", centerX, y);
  y += 14;

  return y; // tinggi konten kertas (tanpa padding bawah)
}

async function ensureFonts() {
  const loads = [
    '800 13px "JetBrains Mono"',
    '800 12.5px "JetBrains Mono"',
    '800 10.5px "JetBrains Mono"',
    '700 9.5px "JetBrains Mono"',
    '700 8px "JetBrains Mono"',
  ];
  await Promise.all(loads.map((f) => document.fonts.load(f).catch(() => {})));
}

export async function renderStrukPNG(data, logoSrc = "/sanurlighting.png") {
  await ensureFonts();
  let logo = null;
  try {
    logo = await loadImg(logoSrc);
  } catch {
    logo = null;
  }

  const OUT = 46;             // margin untuk shadow (harus >= spread blur, else terpotong)
  const W = 310;              // lebar kartu nota (CSS px)
  const PAD = 16;             // padding kartu
  const ZZ = 7;               // tinggi gigi sobek
  const paperW = W - PAD * 2;
  const notaNo = data.id ? String(data.id).replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() : "000000";

  // Pass 1: ukur tinggi
  const measure = document.createElement("canvas");
  measure.width = 10;
  measure.height = 10;
  const mctx = measure.getContext("2d");
  const contentH = drawPaper(mctx, data, logo, paperW, notaNo);
  const paperH = contentH + 20;
  const cardH = paperH + ZZ + PAD;

  // Pass 2: gambar final
  const canvas = document.createElement("canvas");
  canvas.width = (W + OUT * 2) * 3;
  canvas.height = (cardH + OUT * 2) * 3;
  const ctx = canvas.getContext("2d");
  ctx.scale(3, 3);

  // soft shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 52;
  ctx.shadowOffsetY = 18;
  rrPath(ctx, OUT, OUT, W, cardH, 20);
  ctx.fillStyle = C.cardBg;
  ctx.fill();
  ctx.restore();

  // kartu
  rrPath(ctx, OUT, OUT, W, cardH, 20);
  ctx.fillStyle = C.cardBg;
  ctx.fill();

  // kertas nota (pojok atas rounded)
  const px = OUT + PAD;
  const py = OUT + PAD;
  rrTopPath(ctx, px, py, paperW, paperH, 14);
  ctx.fillStyle = C.paperBg;
  ctx.fill();

  // konten
  ctx.save();
  ctx.translate(px, py);
  drawPaper(ctx, data, logo, paperW, notaNo);
  ctx.restore();

  // tepi sobek (gigi warna kertas menunjuk ke bawah)
  const nTeeth = Math.round(paperW / 9);
  const tooth = paperW / nTeeth;
  ctx.fillStyle = C.paperBg;
  ctx.beginPath();
  ctx.moveTo(px, py + paperH);
  for (let i = 0; i < nTeeth; i++) {
    ctx.lineTo(px + i * tooth + tooth / 2, py + paperH + ZZ);
    ctx.lineTo(px + (i + 1) * tooth, py + paperH);
  }
  ctx.closePath();
  ctx.fill();

  const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
  const name = `Nota-${String(data.alamat || "transaksi").trim().replace(/[^\w]+/g, "-").slice(0, 40)}-${data.tanggal || ""}.png`;
  return { blob, url: URL.createObjectURL(blob), name, width: canvas.width, height: canvas.height };
}
