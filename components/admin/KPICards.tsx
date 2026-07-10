"use client";

import useSWR from "swr";
import { Users, QrCode, Store, Loader2, UserMinus } from "lucide-react";

type KPIStats = {
  totalRegistrations: number;
  totalCheckIns: number;
  notCheckedIn: number;
  totalBooths: number;
  boothVisits: { name: string; visits: number }[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const KPICards = ({ eventId }: { eventId?: string }) => {
  const url = eventId ? `/api/kpi?eventId=${eventId}` : "/api/kpi";
  const { data: stats, error } = useSWR<KPIStats>(url, fetcher, { refreshInterval: 5000 });

  const items = [
    {
      label: "Registrations",
      value: stats?.totalRegistrations ?? 0,
      Icon: Users,
      color: "text-[#0071E3]",
      bg: "bg-[#0071E3]/10",
    },
    {
      label: "Checked In",
      value: stats?.totalCheckIns ?? 0,
      Icon: QrCode,
      color: "text-[#34C759]",
      bg: "bg-[#34C759]/10",
    },
    {
      label: "Not Checked In",
      value: stats?.notCheckedIn ?? 0,
      Icon: UserMinus,
      color: "text-[#FF3B30]",
      bg: "bg-[#FF3B30]/10",
    },
    {
      label: "Active Booths",
      value: stats?.totalBooths ?? 0,
      Icon: Store,
      color: "text-[#FF9500]",
      bg: "bg-[#FF9500]/10",
    },
  ];

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 mb-6">
        {items.map((_, i) => (
          <div
            key={i}
            className="apple-card flex h-[110px] sm:h-[140px] items-center justify-center animate-pulse bg-muted/40 p-4 sm:p-6"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {items.map((item, i) => {
          const { Icon, color, bg, label, value } = item;
          return (
            <div
              key={i}
              className="apple-card p-4 sm:p-6 shadow-sm border border-border/50 flex flex-col justify-between h-[110px] sm:h-[140px]"
            >
              <div className="flex items-start justify-between">
                <p className="text-[13px] sm:text-[15px] font-medium text-muted-foreground pr-2 leading-tight">
                  {label}
                </p>
                <div
                  className={`flex h-8 w-8 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-[0.8rem] ${bg}`}
                >
                  <Icon className={`h-4 w-4 sm:h-6 sm:w-6 ${color}`} aria-hidden="true" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {value.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {stats.boothVisits && stats.boothVisits.length > 0 && (
        <div className="apple-card p-4 lg:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              จำนวนคนที่ Checked In ในแต่ละ Booth
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/50 bg-muted/20 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Booth Name</th>
                  <th className="px-4 py-3 font-medium text-right">Check-Ins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {stats.boothVisits.map((booth, i) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{booth.name}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#0071E3]">{booth.visits.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICards;
