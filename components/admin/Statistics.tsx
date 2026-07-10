"use client";

import { useMemo } from "react";
import useSWR from "swr";

type RawStat = Record<string, unknown> & {
  eventId?: string;
  boothId?: string;
  _count?: number | { _all?: number; checkIn?: number; [key: string]: number | undefined };
};

type ChartDatum = { label: string; value: number };

function getCount(stat: RawStat, fallbackKey?: string): number {
  if (typeof stat._count === "number") return stat._count;
  if (stat._count && typeof stat._count === "object") {
    const obj = stat._count;
    const fallback =
      fallbackKey !== undefined ? obj[fallbackKey] : undefined;
    return (
      obj.checkIn ??
      obj._all ??
      (typeof fallback === "number" ? fallback : 0)
    );
  }
  return 0;
}

function toChartData(
  data: unknown,
  labelKey: string,
  fallbackLabel: string,
  fallbackKey?: string
): ChartDatum[] {
  if (!Array.isArray(data)) return [];
  return data.map((item, i) => {
    const stat = item as RawStat;
    const raw = stat[labelKey as keyof RawStat];
    return {
      label:
        typeof raw === "string" && raw ? raw : `${fallbackLabel} ${i + 1}`,
      value: getCount(stat, fallbackKey),
    };
  });
}

function BarChart({ data, color }: { data: ChartDatum[]; color: string }) {
  const max = useMemo(
    () => Math.max(1, ...data.map((d) => d.value)),
    [data]
  );
  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No data available.
      </p>
    );
  }
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
                backgroundColor: color,
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

function ChartCard({
  title,
  data,
  color,
  loading,
}: {
  title: string;
  data: ChartDatum[];
  color: string;
  loading: boolean;
}) {
  return (
    <div className="apple-card p-6 shadow-sm border border-border/50">
      <h3 className="mb-5 text-[17px] font-semibold tracking-tight text-foreground">{title}</h3>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-2.5 flex-1 rounded bg-muted" />
              <div className="h-3 w-6 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <BarChart data={data} color={color} />
      )}
    </div>
  );
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Statistics = ({ eventId }: { eventId?: string }) => {
  const qs = eventId ? `?eventId=${eventId}` : "";

  const { data: checkInData, error: checkInError } = useSWR(`/api/stats/check-ins${qs}`, fetcher, { refreshInterval: 5000 });
  const { data: boothData, error: boothError } = useSWR(`/api/stats/booths${qs}`, fetcher, { refreshInterval: 5000 });
  const { data: rewardData, error: rewardError } = useSWR(`/api/stats/rewards${qs}`, fetcher, { refreshInterval: 5000 });

  const loading = !checkInData && !checkInError;
  const error = checkInError || boothError || rewardError ? "Unable to load statistics" : null;

  const checkInStats = useMemo(() => toChartData(checkInData, "eventName", "Event", "checkIn"), [checkInData]);
  const boothStats = useMemo(() => toChartData(boothData, "boothName", "Booth"), [boothData]);
  const rewardStats = useMemo(() => toChartData(rewardData, "eventName", "Event"), [rewardData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {error && (
        <p className="lg:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="lg:col-span-2">
        <ChartCard
          title="Check-Ins by Event"
          data={checkInStats}
          color="#0071E3"
          loading={loading}
        />
      </div>
      <ChartCard
        title="Booth Visits"
        data={boothStats}
        color="#34C759"
        loading={loading}
      />
      <ChartCard
        title="Rewards by Event"
        data={rewardStats}
        color="#FF9500"
        loading={loading}
      />
    </div>
  );
};

export default Statistics;
