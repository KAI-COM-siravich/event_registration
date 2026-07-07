"use client";

import { useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import KPICards from "../../components/admin/KPICards";
import Registrations from "../../components/admin/Registrations";
import Statistics from "../../components/admin/Statistics";

type Tab = "registrations" | "statistics";

const TABS: { id: Tab; label: string }[] = [
  { id: "registrations", label: "Registrations" },
  { id: "statistics", label: "Statistics" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("registrations");

  return (
    <AppShell title="Dashboard">
      <div className="space-y-4 max-w-7xl mx-auto relative z-10">
        {/* KPI row */}
        <KPICards />

        {/* Tabbed panel */}
        <div className="apple-card p-0 sm:p-0 overflow-hidden">
          {/* Tab bar */}
          <div className="border-b border-border/50 bg-muted/20 px-4 pt-3">
            <div role="tablist" className="flex gap-4">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  id={`tab-${id}`}
                  role="tab"
                  aria-selected={activeTab === id}
                  aria-controls={`panel-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={[
                    "relative pb-3 text-[14px] font-semibold transition-colors",
                    activeTab === id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {label}
                  {activeTab === id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-primary glow-border" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab panel */}
          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="p-4 lg:p-6"
          >
            {activeTab === "registrations" ? <Registrations /> : <Statistics />}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AdminDashboard;

