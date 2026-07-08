"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { CalendarDays, Loader2, Plus, Trash2, X, Edit2, Eye } from "lucide-react";
import { DetailModal } from "../../components/ui/DetailModal";

type Event = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  location: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [viewedEvent, setViewedEvent] = useState<Event | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
  });

  const fetchEvents = () => {
    setLoading(true);
    fetch("/api/events")
      .then((r) => r.json() as Promise<Event[]>)
      .then(setEvents)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", date: "", location: "" });
    setShowForm(true);
    setFormError("");
  };

  const openEditForm = (event: Event) => {
    setEditingId(event.id);
    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    const dateObj = new Date(event.date);
    // Pad local time
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, -1);
    
    setFormData({
      name: event.name,
      description: event.description || "",
      date: localISOTime.slice(0, 16),
      location: event.location,
    });
    setShowForm(true);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const url = editingId ? `/api/events/${editingId}` : "/api/events";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save event");
      }

      await fetchEvents();
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete event");
      }

      await fetchEvents();
    } catch (err: any) {
      alert(err.message || "Failed to delete event");
    }
  };

  const mapEventForModal = (ev: Event) => ({
    "Event ID": ev.id,
    "Event Name": ev.name,
    "Date & Time": new Date(ev.date).toLocaleString(),
    "Location": ev.location,
    "Description": ev.description || "N/A",
  });

  return (
    <AppShell title="Event Management">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Events
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage events available for registration.
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>

        {showForm && (
          <div className="apple-card animate-in fade-in slide-in-from-top-4 overflow-hidden border border-border/50">
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-3">
              <h3 className="font-semibold text-foreground">
                {editingId ? "Edit Event" : "Create New Event"}
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
                    Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="flex h-10 w-full rounded-lg border border-border/50 bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="E.g., Tech Summit 2026"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-muted-foreground">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="flex h-10 w-full rounded-lg border border-border/50 bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-muted-foreground">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="flex h-10 w-full rounded-lg border border-border/50 bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="E.g., Hall 1, Exhibition Center"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[13px] font-medium text-muted-foreground">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="flex min-h-[80px] w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Additional details about the event..."
                  />
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
                    "Save Event"
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
                  <th className="px-4 py-3 font-medium sm:px-6">Event Name</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Date</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Location</th>
                  <th className="px-4 py-3 font-medium text-right sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 bg-background/50">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                      Loading events...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-red-500"
                    >
                      Failed to load events.
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No events found.
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr
                      key={event.id}
                      className="transition-colors hover:bg-muted/30 group cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) return;
                        setViewedEvent(event);
                      }}
                    >
                      <td className="px-4 py-3 font-medium text-foreground sm:px-6 group-hover:text-primary transition-colors">
                        {event.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-6 whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-6">
                        {event.location}
                      </td>
                      <td className="px-4 py-3 text-right sm:px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewedEvent(event);
                            }}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditForm(event);
                            }}
                            className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-blue-500/10 px-3 text-xs font-medium text-blue-500 hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(event.id);
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
        isOpen={!!viewedEvent}
        onClose={() => setViewedEvent(null)}
        title="Event Details"
        data={viewedEvent ? mapEventForModal(viewedEvent) : null}
      />
    </AppShell>
  );
}
