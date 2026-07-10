"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export function DemoRoleSwitcher() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // If not logged in, don't show the switcher
  if (!session?.user) return null;

  const currentRole = (session.user as any).role;

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole === currentRole) return;
    
    setLoading(true);
    try {
      // Update role in database
      const res = await fetch("/api/demo/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (res.ok) {
        // Force update NextAuth session
        await update({ role: newRole });
        
        // Redirect to appropriate dashboard based on new role
        if (newRole === "CUSTOMER") {
          router.push("/register");
        } else {
          router.push("/admin");
        }
      }
    } catch (err) {
      console.error("Failed to switch role", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-4 z-[9999] bg-background/80 backdrop-blur-md border border-border shadow-lg p-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-500">
        <ShieldAlert className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Demo Role</p>
        <div className="relative">
          <select
            value={currentRole || ""}
            onChange={handleRoleChange}
            disabled={loading}
            className="appearance-none bg-transparent text-sm font-semibold text-foreground pr-8 outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-foreground">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : (
              <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
