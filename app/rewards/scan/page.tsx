"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../../components/layout/AppShell";
import { Gift, Check, X, Loader2, ArrowLeft } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";

type ScanSuccess = {
  success: true;
  customer: { name: string; email: string };
};

type ScanFailure = {
  success?: false;
  error: string;
};

type ScanResult = ScanSuccess | ScanFailure;
type Event = { id: string; name: string };

export default function RewardScanPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json() as Promise<Event[]>)
      .then((data) => {
        setEvents(data);
        if (data.length > 0) setSelectedEventId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, []);

  const handleScan = async (scannedToken: string) => {
    if (!scannedToken.trim() || !selectedEventId || loading) return;
    setToken(scannedToken);
    setScannerActive(false);

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/rewards/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: scannedToken.trim(), eventId: selectedEventId }),
      });
      const data = (await res.json()) as ScanResult;
      if (!res.ok) {
        setResult({ error: (data as ScanFailure).error ?? "Claim failed" });
      } else {
        setResult(data);
        setToken("");
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
    <AppShell title="Reward Claim Terminal">
      <div className="mx-auto max-w-2xl space-y-4">
        <button
          onClick={() => router.push("/rewards")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rewards
        </button>

        <div className="apple-card p-4 sm:p-5 shadow-sm border border-border/50">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.6rem] bg-orange-500/10">
                <Gift className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                  Reward Claim Terminal
                </h2>
                <p className="text-[13px] text-muted-foreground">
                  Verify attendee and grant event rewards
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setScannerActive(!scannerActive)}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {scannerActive ? "Close Camera" : "Open Camera"}
            </button>
          </div>
          
          <div className="mb-4">
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Active Event Context</label>
            {eventsLoading ? (
               <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>{evt.name}</option>
                ))}
              </select>
            )}
          </div>

          {scannerActive && (
            <div className="mb-4 overflow-hidden rounded-xl border border-border bg-black">
              <Scanner
                onScan={(result) => handleScan(result[0].rawValue)}
                styles={{ container: { width: "100%", aspectRatio: "1/1" } }}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter QR Token..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-[15px] outline-none ring-primary/20 placeholder:text-muted-foreground focus:border-primary focus:ring-4 transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !token.trim() || !selectedEventId}
              className="flex h-[46px] w-[90px] items-center justify-center gap-1 rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Claim"}
            </button>
          </form>

          {result && (
            <div
              className={`mt-6 rounded-xl border p-4 ${
                isSuccess
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 rounded-full p-1 ${
                    isSuccess ? "bg-emerald-200 text-emerald-700" : "bg-red-200 text-red-700"
                  }`}
                >
                  {isSuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[15px]">
                    {isSuccess ? "Reward Claimed!" : "Claim Failed"}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    {isSuccess
                      ? `Reward granted successfully to ${(result as ScanSuccess).customer.name}.`
                      : (result as ScanFailure).error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
