import "./globals.css";

export const metadata = {
  title: "Sanur Lighting — Manager",
  description: "Pencatatan sewa, pasang & bongkar lampu — Sanur Collection.",
  manifest: "/manifest.json",
  icons: {
    icon: "/sanurlighting.png",
    apple: "/sanurlighting.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sanur Lighting",
  },
};

export const viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <body className="h-full overflow-hidden bg-ink-950 font-sans text-stone-100 antialiased">
        {/* Font (Google CDN, sama seperti versi lama) — React 19 hoist ke <head> */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
        {children}
        <div className="noise-overlay" aria-hidden />
      </body>
    </html>
  );
}
