"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { QrCode, Check, X, Loader2, Camera, ScanLine } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";

type CheckInSuccess = {
  success: true;
  customer: { name: string; email: string };
  event: string;
};

type CheckInFailure = {
  success?: false;
  error: string;
};

type CheckInResult = CheckInSuccess | CheckInFailure;

type TodayCheckIn = {
  id: string;
  createdAt: string;
  registration?: {
    firstName?: string;
    lastName?: string;
    customer?: { user?: { firstName?: string; lastName?: string; email?: string } };
    event?: { name?: string };
  };
};

export default function CheckInPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [todayList, setTodayList] = useState<TodayCheckIn[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);

  const fetchToday = () => {
    fetch("/api/check-in")
      .then((r) => r.json())
      .then((data: unknown) => {
        setTodayList(Array.isArray(data) ? (data as TodayCheckIn[]) : []);
      })
      .catch(() => setTodayList([]))
      .finally(() => setListLoading(false));
  };

  useEffect(fetchToday, []);

  const handleScan = async (scannedToken: string) => {
    if (!scannedToken.trim() || loading) return;
    setToken(scannedToken);
    setScannerActive(false);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: scannedToken.trim() }),
      });
      const data = (await res.json()) as CheckInResult;
      if (!res.ok) {
        setResult({ error: (data as CheckInFailure).error ?? "Check-in failed" });
      } else {
        setResult(data);
        setToken("");
        fetchToday();
      }
    } catch {
      setResult({ error: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(token);
  };

  const isSuccess = result && "success" in result && result.success === true;

  return (
    <AppShell title="Check-In">
      <div className="mx-auto max-w-2xl space-y-3 sm:space-y-4">
        <div className="apple-card p-3 sm:p-6 shadow-sm border border-border/50 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-[0.6rem] bg-primary/10">
              <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[15px] sm:text-[16px] font-semibold text-foreground tracking-tight">Check-In Terminal</h2>
              <p className="text-[12px] sm:text-[13px] text-muted-foreground mt-0.5">Scan QR code or enter token manually</p>
            </div>
          </div>

          {scannerActive ? (
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-black aspect-square">
              <Scanner onScan={(result) => handleScan(result[0].rawValue)} styles={{ container: { width: "100%", height: "100%" } }} />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 h-8 w-8 border-t-2 border-l-2 border-white rounded-tl-lg" />
                <div className="absolute top-4 right-4 h-8 w-8 border-t-2 border-r-2 border-white rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-white rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-white rounded-br-lg" />
              </div>
            </div>
          ) : (
            <button type="button" id="open-camera-btn" onClick={() => { setResult(null); setScannerActive(true); }} className="scan-btn w-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-primary text-white shadow-[0_8px_24px_rgba(0,113,227,0.4)]">
                <Camera className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-[17px] font-semibold">Open Camera</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Tap to scan attendee QR code</p>
              </div>
              <ScanLine className="h-5 w-5 opacity-50" />
            </button>
          )}

          {scannerActive && (
            <button type="button" onClick={() => setScannerActive(false)} className="w-full flex items-center justify-center gap-2 py-2 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" /> Close Camera
            </button>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input id="checkin-token" type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Or paste / type QR token..." autoComplete="off"
              className="flex-1 rounded-xl border border-border/50 bg-background/50 backdrop-blur-md px-4 py-3 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
            <button type="submit" id="checkin-submit" disabled={loading || !token.trim()}
              className="glow-border inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-[15px] font-semibold text-background transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 touch-target">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Check In
            </button>
          </form>
        </div>

        {result && (
          <div role="status" aria-live="polite"
            className={["flex items-start gap-4 rounded-2xl border-[0.5px] p-5 animate-in slide-in-from-bottom-4 duration-300",
              isSuccess ? "border-emerald-500/20 bg-emerald-500/10" : "border-red-500/20 bg-red-500/10"].join(" ")}>
            <div className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              isSuccess ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-600"].join(" ")}>
              {isSuccess ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              {isSuccess ? (
                <>
                  <p className="text-[16px] font-bold text-emerald-800 dark:text-emerald-300">Check-in successful!</p>
                  <p className="text-[14px] font-medium text-emerald-700 dark:text-emerald-400 mt-1">{(result as CheckInSuccess).customer.name}</p>
                  <p className="text-[13px] text-emerald-600 dark:text-emerald-500 mt-0.5">{(result as CheckInSuccess).event}</p>
                </>
              ) : (
                <>
                  <p className="text-[16px] font-bold text-red-800 dark:text-red-300">Check-in failed</p>
                  <p className="text-[14px] font-medium text-red-700 dark:text-red-400 mt-1">{(result as CheckInFailure).error}</p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="apple-card p-0 sm:p-0 overflow-hidden border border-border/50">
          <div className="flex items-center border-b border-border/50 bg-muted/20 px-4 py-3">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Today&apos;s Check-Ins</h3>
            {!listLoading && <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{todayList.length}</span>}
          </div>
          <div className="divide-y divide-border/50">
            {listLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2"><div className="h-3.5 w-32 rounded bg-muted" /><div className="h-3 w-24 rounded bg-muted" /></div>
                  <div className="h-3 w-14 rounded bg-muted" />
                </div>
              ))
            ) : todayList.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <QrCode className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-[15px] text-muted-foreground">No check-ins today yet.</p>
              </div>
            ) : (
              todayList.map((ci) => {
                const reg = ci.registration;
                const user = reg?.customer?.user;
                const fName = reg?.firstName || user?.firstName;
                const lName = reg?.lastName || user?.lastName;
                const name = [fName, lName].filter(Boolean).join(" ") || "—";
                const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={ci.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-[12px] font-bold">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-foreground truncate">{name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{ci.registration?.event?.name ?? "—"}</p>
                    </div>
                    <p className="text-[12px] text-muted-foreground font-mono shrink-0">
                      {new Date(ci.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
