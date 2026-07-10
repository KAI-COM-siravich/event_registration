"use client";

import { useState, useEffect } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";

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

export default function LogsPage() {
  const { data: session } = useSession();
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/audit-logs?page=${currentPage}&limit=${itemsPerPage}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items) {
          setAuditLogs(data.items);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.total || 0);
        } else {
          setAuditLogs(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentPage]);

  // Make sure only admin can see it (API already blocks it, but UI should be clean)
  if ((session?.user as any)?.role !== "ADMIN") {
    return (
      <AppShell title="Audit Logs">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You do not have permission to view this page.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Audit Logs">
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[17px] sm:text-xl font-bold tracking-tight text-foreground leading-tight">
              บันทึกกิจกรรมระบบ (Audit Logs)
            </h2>
            <p className="text-[13px] sm:text-sm text-muted-foreground mt-0.5">
              ประวัติการใช้งานระบบ การเข้าสู่ระบบ และการแก้ไขข้อมูลทั้งหมด
            </p>
          </div>
        </div>

        <div className="apple-card animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.6rem] bg-indigo-500/10">
                <FileText className="h-5 w-5 text-indigo-500" />
              </div>
              <h3 className="text-[16px] font-semibold tracking-tight text-foreground">
                Activity Logs
              </h3>
            </div>
            
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-8 border border-dashed border-border rounded-xl">
                ยังไม่มีกิจกรรมที่บันทึกไว้
              </p>
            ) : (
              <ul className="space-y-2 sm:space-y-3">
                {auditLogs.map((log) => (
                  <li key={log.id} className="rounded-xl border border-border/50 bg-muted/20 p-3 sm:p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[14px] sm:text-[15px] font-medium text-foreground">{log.action}</p>
                        <p className="text-[12px] sm:text-[13px] text-muted-foreground">
                          {log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.email})` : "ผู้ใช้ไม่ทราบ"}
                        </p>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-muted-foreground bg-background px-2 py-1 rounded-md border border-border/50 self-start sm:self-auto mt-2 sm:mt-0">
                        {new Date(log.timestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!loading && auditLogs.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 pt-4 mt-6">
                <div className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-semibold text-foreground">{totalItems}</span> logs
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
    </AppShell>
  );
}
