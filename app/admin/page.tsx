"use client";

import { useState, useEffect } from "react";
import { AppShell } from "../../components/layout/AppShell";
import KPICards from "../../components/admin/KPICards";
import Registrations from "../../components/admin/Registrations";
import Statistics from "../../components/admin/Statistics";

type Tab = "registrations" | "statistics";

type AuditLogItem = {
  id: string;
  action: string;
  timestamp: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "registrations", label: "ผู้ลงทะเบียน" },
  { id: "statistics", label: "สถิติ" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("registrations");
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/admin/audit-logs")
      .then((r) => r.json())
      .then((data) => setAuditLogs(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-4 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground hidden sm:block">
            ภาพรวม
          </h2>
          <div className="w-full sm:w-auto shrink-0">
            <label htmlFor="event-filter" className="sr-only">
              กรองตามกิจกรรม
            </label>
            <select
              id="event-filter"
              aria-label="Filter by event"
              className="w-full sm:w-64 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary appearance-none"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="">ทุกกิจกรรม</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI row */}
        <KPICards eventId={selectedEventId} />

        <div className="apple-card p-4 lg:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                บันทึกกิจกรรมของ Admin
              </h3>
              <p className="text-sm text-muted-foreground">
                กิจกรรมเข้าสู่ระบบ ออกจากระบบ และการเปลี่ยนแปลงของระบบล่าสุด
              </p>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีกิจกรรมที่บันทึกไว้</p>
          ) : (
            <ul className="space-y-3">
              {auditLogs.map((log) => (
                <li key={log.id} className="rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.email})` : "ผู้ใช้ไม่ทราบ"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tabbed panel */}
        <div className="apple-card p-0 sm:p-0 overflow-hidden">
          {/* Tab bar */}
          <div className="border-b border-border/50 bg-muted/20 px-4 pt-3">
            <div role="tablist" className="flex gap-4">
              {TABS.map(({ id, label }) => {
                const isActive = activeTab === id;

                return (
                  <button
                    key={id}
                    type="button"
                    id={`tab-${id}`}
                    role="tab"
                    aria-selected={isActive ? "true" : "false"}
                    aria-controls={`panel-${id}`}
                    onClick={() => setActiveTab(id)}
                    className={[
                      "relative pb-3 text-[14px] font-semibold transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary glow-border" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab panel */}
          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="p-4 lg:p-6"
          >
            {activeTab === "registrations" ? (
              <Registrations eventId={selectedEventId} />
            ) : (
              <Statistics eventId={selectedEventId} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AdminDashboard;

