"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { Store } from "lucide-react";

type BoothStat = {
  boothId: string;
  _count: number | { _all?: number };
};

type ChartDatum = { label: string; value: number };

function getCount(stat: BoothStat): number {
  if (typeof stat._count === "number") return stat._count;
  if (stat._count && typeof stat._count === "object") {
    return stat._count._all ?? 0;
  }
  return 0;
}

function BarChart({ data }: { data: ChartDatum[] }) {
  const max = useMemo(
    () => Math.max(1, ...data.map((d) => d.value)),
    [data]
  );
  if (data.length === 0) return null;
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div
          key={item.label}
          className="grid items-center gap-3 text-sm"
          style={{ gridTemplateColumns: "minmax(8rem,14rem) 1fr 3rem" }}
        >
          <span
            className="truncate text-muted-foreground"
            title={item.label}
          >
            {item.label}
          </span>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(4, (item.value / max) * 100)}%`,
                backgroundColor: "oklch(0.597 0.177 142.1)",
              }}
            />
          </div>
          <span className="text-right font-semibold text-foreground">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BoothsPage() {
  const [stats, setStats] = useState<BoothStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/stats/booths")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json() as Promise<BoothStat[]>;
      })
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const chartData: ChartDatum[] = stats.map((s, i) => ({
    label: s.boothId ? `Booth ${i + 1}` : `Booth ${i + 1}`,
    value: getCount(s),
  }));

  const totalVisits = stats.reduce((sum, s) => sum + getCount(s), 0);

  return (
    <AppShell title="Booths">
      <div className="space-y-4 max-w-5xl mx-auto relative z-10">
        {/* Summary */}
        <div className="flex items-center gap-4 apple-card p-4 sm:p-5 border-border/50 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-[0.8rem] bg-[#34C759]/10">
            <Store
              className="h-6 w-6 text-[#34C759]"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {loading ? "—" : totalVisits.toLocaleString()}
            </p>
            <p className="text-[14px] font-medium text-muted-foreground mt-0.5">
              Total booth visits across all events
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            Unable to load booth statistics. Please refresh.
          </p>
        )}

        {/* Chart */}
        <div className="apple-card border border-border/50 p-4 sm:p-5 shadow-sm">
          <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-foreground">
            Visit Count by Booth
          </h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-2.5 w-24 rounded bg-muted" />
                  <div className="h-2 flex-1 rounded bg-muted" />
                  <div className="h-2.5 w-5 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : chartData.length === 0 ? (
            <p className="py-4 text-center text-[14px] text-muted-foreground">
              No booth visit data yet.
            </p>
          ) : (
            <BarChart data={chartData} />
          )}
        </div>

        {/* Table */}
        <div className="apple-card overflow-hidden p-0 sm:p-0 border border-border/50">
          <div className="border-b border-border/50 bg-muted/20 px-4 py-3">
            <h2 className="text-[15px] font-semibold tracking-tight text-foreground">Booth Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/50 text-[14px]">
              <thead>
                <tr className="bg-muted/10">
                  {["#", "Booth ID", "Visits"].map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                        i === 2 ? "text-right" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[1, 2, 3].map((j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3.5 w-16 rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : stats.length === 0 ? (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-[15px] text-muted-foreground"
                      colSpan={3}
                    >
                      No booth data available.
                    </td>
                  </tr>
                ) : (
                  stats.map((s, i) => (
                    <tr
                      key={s.boothId ?? i}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4 text-muted-foreground">{i + 1}</td>
                      <td className="px-6 py-4 font-mono text-sm text-foreground">
                        {s.boothId}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        {getCount(s).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
