"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "../../../../components/layout/AppShell";
import { QrCode, Check, X, Loader2, ArrowLeft } from "lucide-react";
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

export default function BoothScanPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [boothName, setBoothName] = useState("Loading...");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scannerActive, setScannerActive] = useState(false);

  useEffect(() => {
    fetch(`/api/booths/${id}`)
      .then((r) => r.json())
      .then((data) => setBoothName(data.name || "Unknown Booth"))
      .catch(() => setBoothName("Error loading booth"));
  }, [id]);

  const handleScan = async (scannedToken: string) => {
    if (!scannedToken.trim() || loading) return;
    setToken(scannedToken);
    setScannerActive(false);

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/booths/${id}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: scannedToken.trim() }),
      });
      const data = (await res.json()) as ScanResult;
      if (!res.ok) {
        setResult({ error: (data as ScanFailure).error ?? "Scan failed" });
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
    <AppShell title={`Booth Scan: ${boothName}`}>
      <div className="mx-auto max-w-2xl space-y-4">
        <button
          onClick={() => router.push("/booths")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Booths
        </button>

        <div className="apple-card p-4 sm:p-5 shadow-sm border border-border/50">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.6rem] bg-[#0071E3]/10">
                <QrCode className="h-5 w-5 text-[#0071E3]" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                  {boothName} Terminal
                </h2>
                <p className="text-[13px] text-muted-foreground">
                  Enter QR token or scan a QR code to record visit
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
              disabled={loading || !token.trim()}
              className="flex h-[46px] w-[80px] items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Scan"}
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
                    {isSuccess ? "Visit Recorded!" : "Scan Failed"}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    {isSuccess
                      ? `Attendee ${(result as ScanSuccess).customer.name} has visited ${boothName}.`
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
