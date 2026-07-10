"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "../../components/layout/AppShell";
import { Award, Loader2, Plus, X, QrCode } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";

type Reward = {
  id: string;
  createdAt: string;
  customerId: string;
  eventId: string;
  customer?: {
    user?: { firstName?: string; lastName?: string; email?: string };
  };
  event?: { name?: string };
};

type Event = { id: string; name: string };

type Customer = {
  id: string;
  user?: { firstName?: string; lastName?: string; email?: string };
};

function getCustomerLabel(c?: Customer | Reward["customer"]): string {
  if (!c) return "Unknown";
  const name = [c.user?.firstName, c.user?.lastName].filter(Boolean).join(" ");
  return name || c.user?.email || "Unknown";
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({ customerId: "", eventId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchRewards = () => {
    setLoading(true);
    fetch("/api/rewards")
      .then((r) => r.json() as Promise<Reward[]>)
      .then(setRewards)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRewards();

    fetch("/api/events")
      .then((r) => r.json() as Promise<Event[]>)
      .then(setEvents)
      .catch(() => {});

    // Derive customer list from registrations
    fetch("/api/registrations")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) return;
        const seen = new Set<string>();
        const unique: Customer[] = [];
        for (const reg of data as Array<{ customer?: Customer }>) {
          const c = reg.customer;
          if (c && "id" in c && typeof c.id === "string" && !seen.has(c.id)) {
            seen.add(c.id);
            unique.push(c as Customer);
          }
        }
        setCustomers(unique);
      })
      .catch(() => {});
  }, []);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.eventId) {
      setFormError("Please select both a customer and an event.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to grant reward");
      }
      setShowForm(false);
      setFormData({ customerId: "", eventId: "" });
      fetchRewards();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to grant reward"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError("");
  };

  return (
    <AppShell title="Rewards">
      <div className="space-y-4 max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between apple-card p-3 sm:p-5 border-border/50 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-[0.8rem] bg-[#FF9500]/10">
              <Award
                className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF9500]"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {loading ? "—" : rewards.length.toLocaleString()}
              </p>
              <p className="text-[12px] sm:text-[14px] font-medium text-muted-foreground mt-0.5">Total rewards granted</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/rewards/scan"
              className="glow-border inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500/10 px-5 py-2.5 text-[14px] font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 hover:scale-105 w-full sm:w-auto"
            >
              <QrCode className="h-4 w-4" aria-hidden="true" />
              Scan Terminal
            </Link>
            <button
              type="button"
              id="grant-reward-btn"
              onClick={() => setShowForm(true)}
              className="glow-border inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[14px] font-semibold text-background transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Grant Reward
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            Unable to load rewards. Please refresh.
          </p>
        )}

        {/* Grant form */}
        {showForm && (
          <div className="apple-card border-[0.5px] border-primary/30 bg-primary/5 p-4 sm:p-5 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                Grant a Reward
              </h3>
              <button
                type="button"
                aria-label="Close form"
                onClick={closeForm}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleGrant} className="space-y-3">
              <div>
                <label
                  htmlFor="reward-customer"
                  className="mb-1.5 block text-[13px] font-medium text-foreground"
                >
                  Customer
                </label>
                <Select
                  value={formData.customerId}
                  onValueChange={(val: string | null) => setFormData((p) => ({ ...p, customerId: val as string }))}
                  items={[
                    { value: "", label: "Select a customer…" },
                    ...customers.map(c => ({ value: c.id, label: getCustomerLabel(c) }))
                  ]}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select a customer…</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {getCustomerLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="reward-event"
                  className="mb-1.5 block text-[13px] font-medium text-foreground"
                >
                  Event
                </label>
                <Select
                  value={formData.eventId}
                  onValueChange={(val: string | null) => setFormData((p) => ({ ...p, eventId: val as string }))}
                  items={[
                    { value: "", label: "Select an event…" },
                    ...events.map(ev => ({ value: ev.id, label: ev.name }))
                  ]}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an event…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select an event…</SelectItem>
                    {events.map((ev) => (
                      <SelectItem key={ev.id} value={ev.id}>
                        {ev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formError && (
                <p className="text-[14px] font-medium text-red-600 dark:text-red-400">
                  {formError}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-secondary px-5 text-[14px] font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="reward-submit"
                  disabled={submitting}
                  className="glow-border inline-flex h-9 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background hover:scale-105 disabled:opacity-50 transition-all disabled:hover:scale-100"
                >
                  {submitting && (
                    <Loader2
                      className="h-3 w-3 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Grant
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reward History */}
        <div className="apple-card overflow-hidden p-0 sm:p-0 border border-border/50">
          <div className="border-b border-border/50 bg-muted/20 px-4 py-3">
            <h2 className="text-[15px] font-semibold tracking-tight text-foreground">Reward History</h2>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border/50 text-[14px]">
              <thead>
                <tr className="bg-muted/10">
                  {["Customer", "Event", "Date Granted"].map((h) => (
                    <th key={h} scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[1, 2, 3].map((j) => (
                        <td key={j} className="px-6 py-4"><div className="h-3.5 w-24 rounded bg-muted" /></td>
                      ))}
                    </tr>
                  ))
                ) : rewards.length === 0 ? (
                  <tr><td className="px-6 py-10 text-center text-[15px] text-muted-foreground" colSpan={3}>No rewards granted yet.</td></tr>
                ) : (
                  rewards.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium text-foreground">{getCustomerLabel(r.customer)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{r.event?.name ?? "—"}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden divide-y divide-border/50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-32 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                  <div className="h-3 w-14 rounded bg-muted shrink-0" />
                </div>
              ))
            ) : rewards.length === 0 ? (
              <div className="py-16 text-center">
                <Award className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No rewards granted yet.</p>
              </div>
            ) : (
              rewards.map((r) => {
                const name = getCustomerLabel(r.customer);
                const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-600 text-[12px] font-bold">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-foreground truncate">{name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{r.event?.name ?? "—"}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground shrink-0">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
