"use client";

import { useEffect, useMemo, useState } from "react";

type RawCount = number | { _all?: number; checkIn?: number };
type RawStat = Record<string, unknown> & {
    eventId?: string;
    boothId?: string;
    _count?: RawCount;
};

type ChartDatum = {
    label: string;
    value: number;
};

function getCount(stat: RawStat, fallbackKey?: string) {
    if (typeof stat._count === "number") {
        return stat._count;
    }

    if (stat._count && typeof stat._count === "object") {
        const fallbackValue = fallbackKey ? stat._count[fallbackKey as keyof RawCount] : undefined;
        return stat._count.checkIn ?? stat._count._all ?? fallbackValue ?? 0;
    }

    return 0;
}

function toChartData(data: unknown, labelKey: "eventId" | "boothId", fallbackLabel: string, fallbackKey?: string) {
    if (!Array.isArray(data)) {
        return [];
    }

    return data.map((item, index) => {
        const stat = item as RawStat;
        const labelValue = stat[labelKey];

        return {
            label: typeof labelValue === "string" && labelValue ? labelValue : `${fallbackLabel} ${index + 1}`,
            value: getCount(stat, fallbackKey),
        };
    });
}

function SimpleBarChart({ data }: { data: ChartDatum[] }) {
    const maxValue = useMemo(() => Math.max(1, ...data.map((item) => item.value)), [data]);

    if (data.length === 0) {
        return <p className="text-sm text-gray-500">No data available.</p>;
    }

    return (
        <div className="space-y-3">
            {data.map((item) => (
                <div key={item.label} className="grid grid-cols-[minmax(8rem,14rem)_1fr_3rem] items-center gap-3 text-sm">
                    <span className="truncate text-gray-700" title={item.label}>
                        {item.label}
                    </span>
                    <div className="h-3 rounded-full bg-gray-100">
                        <div
                            className="h-3 rounded-full bg-blue-600"
                            style={{ width: `${Math.max(4, (item.value / maxValue) * 100)}%` }}
                        />
                    </div>
                    <span className="text-right font-medium text-gray-950">{item.value}</span>
                </div>
            ))}
        </div>
    );
}

const Statistics = () => {
    const [checkInStats, setCheckInStats] = useState<ChartDatum[]>([]);
    const [boothStats, setBoothStats] = useState<ChartDatum[]>([]);
    const [rewardStats, setRewardStats] = useState<ChartDatum[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [checkInData, boothData, rewardData] = await Promise.all([
                    fetch("/api/stats/check-ins").then((res) => res.json()),
                    fetch("/api/stats/booths").then((res) => res.json()),
                    fetch("/api/stats/rewards").then((res) => res.json()),
                ]);

                setCheckInStats(toChartData(checkInData, "eventId", "Event", "checkIn"));
                setBoothStats(toChartData(boothData, "boothId", "Booth"));
                setRewardStats(toChartData(rewardData, "eventId", "Event"));
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : "Unable to load statistics");
            }
        }

        fetchStats();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>

            {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
            ) : (
                <div className="space-y-8">
                    <section>
                        <h3 className="mb-3 font-semibold">Check-In Statistics</h3>
                        <SimpleBarChart data={checkInStats} />
                    </section>

                    <section>
                        <h3 className="mb-3 font-semibold">Booth Statistics</h3>
                        <SimpleBarChart data={boothStats} />
                    </section>

                    <section>
                        <h3 className="mb-3 font-semibold">Reward Statistics</h3>
                        <SimpleBarChart data={rewardStats} />
                    </section>
                </div>
            )}
        </div>
    );
};

export default Statistics;
