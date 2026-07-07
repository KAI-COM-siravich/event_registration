"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";

interface ApprovalActionsProps {
  registrationId: string;
  currentStatus: string;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export default function ApprovalActions({
  registrationId,
  currentStatus,
  onStatusChange,
}: ApprovalActionsProps) {
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setLoading(status);
    try {
      const res = await fetch(`/api/registrations/${registrationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        onStatusChange?.(registrationId, status);
      }
    } finally {
      setLoading(null);
    }
  };

  const isApproved = currentStatus === "APPROVED";
  const isRejected = currentStatus === "REJECTED";
  const isFinal = currentStatus === "CHECKEDIN" || currentStatus === "CANCELLED";

  if (isFinal) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {!isApproved && (
        <button
          type="button"
          aria-label="Approve registration"
          disabled={!!loading}
          onClick={() => handleAction("APPROVED")}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
        >
          {loading === "APPROVED" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Approve
        </button>
      )}
      {!isRejected && (
        <button
          type="button"
          aria-label="Reject registration"
          disabled={!!loading}
          onClick={() => handleAction("REJECTED")}
          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
        >
          {loading === "REJECTED" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Reject
        </button>
      )}
    </div>
  );
}
