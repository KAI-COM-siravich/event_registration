"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { QrCode, Check, X, Loader2 } from "lucide-react";

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
    customer?: {
      user?: { firstName?: string; lastName?: string; email?: string };
    };
    event?: { name?: string };
  };
};

export default function CheckInPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [todayList, setTodayList] = useState<TodayCheckIn[]>([]);
  const [listLoading, setListLoading] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
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

  const isSuccess = result && "success" in result && result.success === true;

  return (
    <AppShell title="Check-In">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Terminal card */}
        <div className="apple-card p-4 sm:p-5 shadow-sm border border-border/50">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.6rem] bg-[#0071E3]/10">
              <QrCode
                className="h-5 w-5 text-[#0071E3]"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-foreground tracking-tight">
                Check-In Terminal
              </h2>
              <p className="text-[13px] text-muted-foreground">
                Enter QR token or scan a QR code
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              id="checkin-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste or type QR token…"
              autoFocus
              autoComplete="off"
              className="flex-1 rounded-full border-[0.5px] border-border/50 bg-background/50 backdrop-blur-md px-4 py-2.5 text-[15px] placeholder:text-muted-foreground/70 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <button
              type="submit"
              id="checkin-submit"
              disabled={loading || !token.trim()}
              className="glow-border inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[15px] font-semibold text-background transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Check In
            </button>
          </form>
        </div>

        {/* Result feedback */}
        {result && (
          <div
            role="status"
            aria-live="polite"
            className={[
              "flex items-start gap-3 rounded-2xl border-[0.5px] p-4 transition-all glass",
              isSuccess
                ? "border-emerald-500/20 bg-emerald-500/10 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                : "border-red-500/20 bg-red-500/10 dark:border-red-500/20 dark:bg-red-500/10",
            ].join(" ")}
          >
            <div
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                isSuccess
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/20 text-red-600 dark:text-red-400",
              ].join(" ")}
            >
              {isSuccess ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <X className="h-4 w-4" aria-hidden="true" />
              )}
            </div>
            <div>
              {isSuccess ? (
                <>
                  <p className="text-[15px] font-semibold text-emerald-800 dark:text-emerald-300">
                    Check-in successful!
                  </p>
                  <p className="text-[14px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {(result as CheckInSuccess).customer.name} ·{" "}
                    {(result as CheckInSuccess).event}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[15px] font-semibold text-red-800 dark:text-red-300">
                    Check-in failed
                  </p>
                  <p className="text-[14px] font-medium text-red-700 dark:text-red-400 mt-0.5">
                    {(result as CheckInFailure).error}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Today's check-in list */}
        <div className="apple-card p-0 sm:p-0 overflow-hidden border border-border/50">
          <div className="flex items-center border-b border-border/50 bg-muted/20 px-4 py-3">
            <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
              Today&apos;s Check-Ins
            </h3>
            {!listLoading && (
              <span className="ml-3 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {todayList.length}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/50 text-[15px]">
              <thead>
                <tr className="bg-muted/10">
                  {["Name", "Event", "Time"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {listLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[1, 2, 3].map((j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3.5 w-24 rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : todayList.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-[15px] text-muted-foreground"
                      colSpan={3}
                    >
                      No check-ins today yet.
                    </td>
                  </tr>
                ) : (
                  todayList.map((ci) => {
                    const user = ci.registration?.customer?.user;
                    const name =
                      [user?.firstName, user?.lastName]
                        .filter(Boolean)
                        .join(" ") || "—";
                    return (
                      <tr
                        key={ci.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-6 py-4 font-medium text-foreground">
                          {name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {ci.registration?.event?.name ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-mono text-sm">
                          {new Date(ci.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
