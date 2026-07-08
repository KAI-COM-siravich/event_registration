"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "../../components/layout/AppShell";
import { Store, Loader2, Plus, X, Edit2, Trash2, QrCode, Eye } from "lucide-react";
import { DetailModal } from "../../components/ui/DetailModal";

type Event = {
  id: string;
  name: string;
};

type Booth = {
  id: string;
  name: string;
  eventId: string;
  event?: Event;
};

export default function BoothsPage() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [viewedBooth, setViewedBooth] = useState<Booth | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    eventId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boothRes, eventRes] = await Promise.all([
        fetch("/api/booths"),
        fetch("/api/events")
      ]);
      const [boothData, eventData] = await Promise.all([
        boothRes.json(),
        eventRes.json()
      ]);
      setBooths(boothData);
      setEvents(eventData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ name: "", eventId: "" });
    setShowForm(true);
    setFormError("");
  };

  const openEditForm = (booth: Booth) => {
    setEditingId(booth.id);
    setFormData({
      name: booth.name,
      eventId: booth.eventId,
    });
    setShowForm(true);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const url = editingId ? `/api/booths/${editingId}` : "/api/booths";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save booth");
      }

      await fetchData();
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booth?")) return;

    try {
      const res = await fetch(`/api/booths/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete booth");
      }

      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete booth");
    }
  };

  const mapBoothForModal = (booth: Booth) => ({
    "Booth ID": booth.id,
    "Booth Name": booth.name,
    "Event": booth.event?.name || booth.eventId,
  });

  return (
    <AppShell title="Booths Management">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Booths
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage exhibitor booths for your events.
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4" />
            Add Booth
          </button>
        </div>

        {showForm && (
          <div className="apple-card animate-in fade-in slide-in-from-top-4 overflow-hidden border border-border/50">
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-3">
              <h3 className="font-semibold text-foreground">
                {editingId ? "Edit Booth" : "Create New Booth"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              {formError && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                  {formError}
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-muted-foreground">
                    Booth Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="flex h-10 w-full rounded-lg border border-border/50 bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="E.g., Microsoft Cloud"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-muted-foreground">
                    Assign Event *
                  </label>
                  <select
                    required
                    value={formData.eventId}
                    onChange={(e) =>
                      setFormData({ ...formData, eventId: e.target.value })
                    }
                    className="flex h-10 w-full rounded-lg border border-border/50 bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="" disabled>Select an event...</option>
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Booth"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="apple-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-6">Booth Name</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Event</th>
                  <th className="px-4 py-3 font-medium text-right sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 bg-background/50">
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                      Loading booths...
                    </td>
                  </tr>
                ) : booths.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No booths found.
                    </td>
                  </tr>
                ) : (
                  booths.map((booth) => (
                    <tr
                      key={booth.id}
                      className="transition-colors hover:bg-muted/30 group cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
                        setViewedBooth(booth);
                      }}
                    >
                      <td className="px-4 py-3 font-medium text-foreground sm:px-6 group-hover:text-primary transition-colors">
                        {booth.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-6">
                        {booth.event?.name}
                      </td>
                      <td className="px-4 py-3 text-right sm:px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/booths/${booth.id}/scan`}
                            className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-emerald-500/10 px-3 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            Terminal
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewedBooth(booth);
                            }}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditForm(booth);
                            }}
                            className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-blue-500/10 px-3 text-xs font-medium text-blue-500 hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(booth.id);
                            }}
                            className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-red-500/10 px-3 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DetailModal
        isOpen={!!viewedBooth}
        onClose={() => setViewedBooth(null)}
        title="Booth Details"
        data={viewedBooth ? mapBoothForModal(viewedBooth) : null}
      />
    </AppShell>
  );
}
