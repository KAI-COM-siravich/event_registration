"use client";

import { useEffect, useMemo, useState } from "react";
import ApprovalActions from "./ApprovalActions";
import { Search } from "lucide-react";

type RegistrationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CHECKEDIN"
  | "CANCELLED";

type Registration = {
  id: string;
  customerId?: string;
  eventId?: string;
  status: RegistrationStatus | string;
  createdAt?: string;
  customer?: {
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
  event?: {
    name?: string;
  };
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800",
  APPROVED:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-800",
  CHECKEDIN:
    "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:ring-sky-800",
  REJECTED:
    "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800",
  CANCELLED:
    "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:ring-gray-700",
};

const ALL_STATUSES = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CHECKEDIN",
  "CANCELLED",
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600 ring-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

function getCustomerName(r: Registration): string {
  const user = r.customer?.user;
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    r.customerId ||
    "Unknown"
  );
}

const Registrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/registrations")
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load registrations");
        return res.json() as Promise<Registration[]>;
      })
      .then((data) => setRegistrations(Array.isArray(data) ? data : []))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load registrations")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return registrations.filter((r) => {
      const name = getCustomerName(r).toLowerCase();
      const email = (r.customer?.user?.email ?? "").toLowerCase();
      const event = (r.event?.name ?? "").toLowerCase();
      const matchesSearch =
        !q || name.includes(q) || email.includes(q) || event.includes(q);
      const matchesStatus =
        statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [registrations, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="reg-search"
            type="search"
            placeholder="Search by name, email or event…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-full border-0 bg-muted/50 pl-11 pr-4 text-[15px] placeholder:text-muted-foreground/70 ring-1 ring-inset ring-border/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-background transition-all"
          />
        </div>
        <select
          id="reg-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-full border-0 bg-muted/50 px-4 text-[15px] ring-1 ring-inset ring-border/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-background transition-all"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All Statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Table */}
      <div className="apple-card overflow-x-auto p-0 sm:p-0">
        <table className="min-w-full divide-y divide-border/50 text-[15px]">
          <thead>
            <tr className="bg-muted/30">
              {["Name", "Email", "Event", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-full max-w-[120px] rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.length > 0
              ? filtered.map((reg) => (
                  <tr
                    key={reg.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {getCustomerName(reg)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {reg.customer?.user?.email ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {reg.event?.name ?? reg.eventId ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td className="px-6 py-4">
                      <ApprovalActions
                        registrationId={reg.id}
                        currentStatus={reg.status}
                        onStatusChange={handleStatusChange}
                      />
                    </td>
                  </tr>
                ))
              : (
                <tr>
                  <td
                    className="px-6 py-12 text-center text-[15px] text-muted-foreground"
                    colSpan={5}
                  >
                    {search || statusFilter !== "ALL"
                      ? "No registrations match your filters."
                      : "No registrations yet."}
                  </td>
                </tr>
              )}
          </tbody>
        </table>
        {!loading && filtered.length > 0 && (
          <div className="border-t border-border/50 px-6 py-4 text-xs text-muted-foreground bg-muted/10">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            <span className="font-semibold text-foreground">{registrations.length}</span> registration
            {registrations.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default Registrations;
