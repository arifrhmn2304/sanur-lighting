import { initializeApp } from "firebase/app";
import { getFirestore, doc } from "firebase/firestore";

// Konfigurasi Firebase — IDENTIK dengan versi HTML lama (backend tidak diubah).
const firebaseConfig = {
  apiKey: "AIzaSyCyWa5otNIbUjJpdZHO01hkjtDZ6DBYPYo",
  authDomain: "rekap-lampu-sanur.firebaseapp.com",
  projectId: "rekap-lampu-sanur",
  storageBucket: "rekap-lampu-sanur.firebasestorage.app",
  messagingSenderId: "377448962254",
  appId: "1:377448962254:web:9ee564c50497e6e98e589f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Dokumen master barang: settings/master_barang
export const masterDocRef = doc(db, "settings", "master_barang");
