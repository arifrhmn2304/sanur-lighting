import Image from "next/image";

export default function Header() {
  return (
    <header className="relative z-20 flex flex-shrink-0 items-center justify-between border-b border-white/[0.06] bg-ink-950/60 px-4 py-3 backdrop-blur-md lg:px-6 lg:py-4">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Image
            src="/sanurlighting.png"
            alt="Sanur Lighting"
            width={38}
            height={38}
            className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/15"
            priority
          />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-tungsten-400 shadow-[0_0_10px_rgba(247,164,40,0.8)] ring-2 ring-ink-950" />
        </div>
        <div>
          <h1 className="font-display text-[13px] font-bold leading-none tracking-[0.1em] text-stone-100">
            SANUR LIGHTING
          </h1>
          <p className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.22em] text-stone-500">
            Rekap Sewa · Pasang · Bongkar
          </p>
        </div>
      </div>

      <span className="chip border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        Online
      </span>
    </header>
  );
}
