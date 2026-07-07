import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, QrCode, Gift, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "EventReg — Professional Event Registration",
  description:
    "Register for events, get instant QR check-in, explore exhibitor booths, and earn rewards.",
};

const FEATURES = [
  {
    Icon: CalendarDays,
    title: "Instant Registration.",
    desc: "Register for upcoming events in minutes and receive instant confirmation with a unique QR code.",
    iconClass: "text-[#0071E3]",
  },
  {
    Icon: QrCode,
    title: "QR Check-In.",
    desc: "Scan your QR code at the door for fast, contactless, and reliable entry to any event.",
    iconClass: "text-[#34C759]",
  },
  {
    Icon: Gift,
    title: "Reward Tracking.",
    desc: "Visit exhibitor booths and collect digital stamps to unlock exclusive event rewards.",
    iconClass: "text-[#FF9500]",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-4 sm:px-6 glass-panel border-b-0">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-[0.4rem] bg-foreground text-[9px] font-bold text-background tracking-wider">
            NC
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Netcube EventReg
          </span>
        </div>
        <Link
          href="/admin"
          className="text-[13px] font-medium text-foreground hover:text-primary transition-colors"
        >
          Dashboard
        </Link>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 text-center linear-grid">
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-background pointer-events-none" />
        <h1 className="relative max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.05] mt-10">
          Your events. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text stripe-gradient">
            Simplified.
          </span>
        </h1>

        <p className="relative mt-6 max-w-2xl text-lg font-medium tracking-tight text-muted-foreground sm:text-xl">
          Streamlined registration, QR-code check-in, booth scanning, and
          reward tracking — all in one platform.
        </p>

        <div className="relative mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/register"
            id="cta-register"
            className="glow-border inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-[15px] font-semibold text-background transition-transform hover:scale-105"
          >
            Register for an Event
          </Link>
          <Link
            href="/admin"
            id="cta-admin"
            className="group inline-flex items-center gap-1 text-[15px] font-medium text-foreground hover:text-primary transition-colors"
          >
            Open Dashboard 
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Dashboard Preview Mock */}
      <section className="relative px-4 pb-20 -mt-4 z-10 flex justify-center">
        <div className="w-full max-w-5xl glow-border apple-card overflow-hidden p-2 sm:p-2 bg-background/50">
          {/* Fake Window Header */}
          <div className="flex h-10 items-center gap-2 border-b border-border/50 px-4 bg-muted/20">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
          </div>
          {/* Fake Dashboard Content */}
          <div className="flex h-[300px] sm:h-[500px] bg-background">
            {/* Sidebar */}
            <div className="hidden sm:block w-48 border-r border-border/50 p-4 space-y-3 bg-muted/10">
              <div className="h-6 w-24 rounded bg-muted/50 mb-6" />
              <div className="h-8 w-full rounded bg-primary/10" />
              <div className="h-8 w-full rounded bg-muted/30" />
              <div className="h-8 w-full rounded bg-muted/30" />
            </div>
            {/* Main Content */}
            <div className="flex-1 p-6 space-y-6">
              <div className="flex gap-4">
                <div className="h-24 flex-1 rounded-2xl border border-border/50 bg-muted/20" />
                <div className="h-24 flex-1 rounded-2xl border border-border/50 bg-muted/20" />
                <div className="h-24 flex-1 rounded-2xl border border-border/50 bg-muted/20" />
              </div>
              <div className="h-48 w-full rounded-2xl border border-border/50 bg-muted/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Logos */}
      <section className="border-y border-border/50 bg-muted/20 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Trusted by innovative teams
          </p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 opacity-50 grayscale">
            {/* Mock logos using pure CSS shapes for now */}
            <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 rounded-full bg-foreground" /> Acme Corp</div>
            <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 rounded-sm bg-foreground" /> Globex</div>
            <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 rounded-tl-xl rounded-br-xl bg-foreground" /> Soylent</div>
            <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 rotate-45 bg-foreground" /> Initech</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 relative">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need.
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {FEATURES.map(({ Icon, title, desc, iconClass }) => (
              <div
                key={title}
                className="apple-card flex flex-col items-start text-left hover:-translate-y-1 transition-transform duration-300"
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50`}>
                  <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-[17px] font-semibold tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground font-medium">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-[13px] font-medium text-muted-foreground bg-background">
        <p>© 2025 Netcube EventReg. All rights reserved.</p>
      </footer>
    </div>
  );
}
