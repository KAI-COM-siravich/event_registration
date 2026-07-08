"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, Loader2, Eye } from "lucide-react";
import { DetailModal } from "../ui/DetailModal";

type BlacklistItem = {
  id: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  reason: string;
  createdAt: string;
};

export default function BlacklistManager() {
  const [items, setItems] = useState<BlacklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [viewedItem, setViewedItem] = useState<BlacklistItem | null>(null);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    company: "",
    reason: "",
  });

  const fetchItems = () => {
    fetch("/api/blacklist")
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load blacklist"))
      .finally(() => setLoading(false));
  };

  useEffect(fetchItems, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason.trim()) {
      setError("Reason is required");
      return;
    }
    if (!form.email.trim() && !form.phone.trim() && !form.company.trim()) {
      setError("At least one condition (Email, Phone, or Company) must be provided");
      return;
    }

    setFormLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add to blacklist");
      }
      setForm({ email: "", phone: "", company: "", reason: "" });
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding to blacklist");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this entry from the blacklist?")) return;
    try {
      const res = await fetch(`/api/blacklist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchItems();
    } catch (err) {
      alert("Error removing entry");
    }
  };

  const mapItemForModal = (item: BlacklistItem) => ({
    "Rule ID": item.id,
    "Target Email": item.email || "N/A",
    "Target Phone": item.phone || "N/A",
    "Target Company": item.company || "N/A",
    "Reason": item.reason,
    "Added On": new Date(item.createdAt).toLocaleString(),
  });

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Add Form */}
      <div className="apple-card p-6">
        <h3 className="text-lg font-semibold tracking-tight text-foreground mb-4">Add to Blacklist</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="badactor@domain.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium">Phone</label>
              <input
                type="tel"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555-0000"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium">Company</label>
              <input
                type="text"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Competitor Inc."
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Reason <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Spam registration"
            />
          </div>
          <button
            type="submit"
            disabled={formLoading}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Rule
          </button>
        </form>
      </div>

      {/* List */}
      <div className="apple-card overflow-x-auto p-0 sm:p-0">
        <table className="min-w-full divide-y divide-border text-[15px]">
          <thead>
            <tr className="bg-muted/30">
              {["Condition", "Reason", "Added On", "Action"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-muted/30 group cursor-pointer"
                  onClick={() => setViewedItem(item)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.email && <span>Email: {item.email}</span>}
                      {item.phone && <span>Phone: {item.phone}</span>}
                      {item.company && <span>Company: {item.company}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{item.reason}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewedItem(item);
                        }}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[15px] text-muted-foreground">
                  No blacklist rules found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DetailModal
        isOpen={!!viewedItem}
        onClose={() => setViewedItem(null)}
        title="Blacklist Rule Details"
        data={viewedItem ? mapItemForModal(viewedItem) : null}
      />
    </div>
  );
}
