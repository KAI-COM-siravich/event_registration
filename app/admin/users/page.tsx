"use client";

import { useState, useEffect } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { Check, X, ShieldAlert, UserCog, Loader2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { DetailModal } from "../../../components/ui/DetailModal";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "STAFF" | "ADMIN";
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedUser, setViewedUser] = useState<User | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page = 1) => {
    try {
      const res = await fetch(`/api/users?page=${page}&limit=${itemsPerPage}`);
      const data = await res.json();
      if (data.items) {
        setUsers(data.items);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || 0);
      } else {
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    try {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
      );
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      });
    } catch (err) {
      // Revert if error
      fetchUsers();
    }
  };

  const mapUserForModal = (u: User) => ({
    "User ID": u.id,
    "Name": `${u.firstName} ${u.lastName}`,
    "Email": u.email,
    "Role": u.role,
    "Status": u.status,
  });

  return (
    <AppShell title="Users & Staff">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[17px] sm:text-xl font-bold tracking-tight text-foreground leading-tight">
              Users & Staff
            </h2>
            <p className="text-[13px] sm:text-sm text-muted-foreground mt-0.5">
              Manage system access and roles.
            </p>
          </div>
        </div>

        <div className="apple-card overflow-hidden p-0 sm:p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 bg-background/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No staff or admin users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-muted/30 group cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('select') || (e.target as HTMLElement).closest('button')) return;
                        setViewedUser(user);
                      }}
                    >
                      <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          value={user.role}
                          onValueChange={(val: string | null) =>
                            updateUser(user.id, { role: val as any })
                          }
                          items={[
                            { value: "STAFF", label: "Staff" },
                            { value: "ADMIN", label: "Admin" }
                          ]}
                        >
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STAFF">Staff</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                            user.status === "APPROVED"
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : user.status === "PENDING"
                              ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewedUser(user);
                            }}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {user.status !== "APPROVED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateUser(user.id, { status: "APPROVED" });
                              }}
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-green-500/10 px-3 text-xs font-medium text-green-500 hover:bg-green-500/20 transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </button>
                          )}
                          {user.status !== "REJECTED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateUser(user.id, { status: "REJECTED" });
                              }}
                              className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-red-500/10 px-3 text-xs font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {!loading && users.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 px-6 py-4 bg-muted/10">
                <div className="text-xs text-muted-foreground text-center sm:text-left">
                  Showing <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                  <span className="font-semibold text-foreground">{totalItems}</span> users
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-background text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-medium text-foreground min-w-[70px] text-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-background text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <DetailModal
        isOpen={!!viewedUser}
        onClose={() => setViewedUser(null)}
        title="User Details"
        data={viewedUser ? mapUserForModal(viewedUser) : null}
      />
    </AppShell>
  );
}
