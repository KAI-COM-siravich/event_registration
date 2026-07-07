"use client";

import { useEffect, useState } from "react";
import { Users, QrCode, Store, Loader2 } from "lucide-react";

type KPIStats = {
  totalRegistrations: number;
  totalCheckIns: number;
  totalBooths: number;
};

const KPICards = () => {
  const [stats, setStats] = useState<KPIStats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data: unknown) => {
        setStats(data as KPIStats);
      })
      .catch(() => {});
  }, []);

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
      label: "Active Booths",
      value: stats?.totalBooths ?? 0,
      Icon: Store,
      color: "text-[#FF9500]",
      bg: "bg-[#FF9500]/10",
    },
  ];

  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {items.map((_, i) => (
          <div
            key={i}
            className="apple-card flex h-[140px] items-center justify-center animate-pulse bg-muted/40 p-6"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {items.map((item, i) => {
        const { Icon, color, bg, label, value } = item;
        return (
          <div
            key={i}
            className="apple-card p-6 shadow-sm border border-border/50 flex flex-col justify-between h-[140px]"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-[0.8rem] ${bg}`}
              >
                <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
              </div>
              <p className="text-[15px] font-medium text-muted-foreground">
                {label}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {value.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
