"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const DEMO_ROLE_KEY = "demoRole" as const;

const ROLE_OPTIONS = [
  {
    value: "ADMIN",
    label: "System Admin",
    description: "Dashboard, user management, settings and full admin views.",
  },
  {
    value: "STAFF",
    label: "Staff",
    description: "Check-in, booths, rewards and attendee tools.",
  },
  {
    value: "CUSTOMER",
    label: "Customer",
    description: "Register flow and event browsing for end users.",
  },
] as const;

const QUICK_LINKS: Record<string, Array<{ label: string; href: string }>> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin" },
    { label: "Registrations", href: "/admin/registrations" },
    { label: "Events", href: "/events" },
    { label: "Check-In", href: "/check-in" },
    { label: "Booths", href: "/booths" },
    { label: "Rewards", href: "/rewards" },
    { label: "Users & Staff", href: "/admin/users" },
    { label: "Blacklist", href: "/admin/blacklist" },
    { label: "Logs", href: "/admin/logs" },
    { label: "Settings", href: "/admin/settings" },
  ],
  STAFF: [
    { label: "Dashboard", href: "/admin" },
    { label: "Registrations", href: "/admin/registrations" },
    { label: "Check-In", href: "/check-in" },
    { label: "Booths", href: "/booths" },
    { label: "Rewards", href: "/rewards" },
    { label: "Blacklist", href: "/admin/blacklist" },
  ],
  CUSTOMER: [
    { label: "Register", href: "/register" },
    { label: "Events", href: "/events" },
  ],
};

export function DemoRoleSwitcher() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedRole, setSelectedRole] = useState<typeof ROLE_OPTIONS[number]["value"]>("ADMIN");
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/";
  const hasSyncedDemoRole = useRef(false);

  if (isLoginPage) {
    return null;
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedRole = window.localStorage.getItem(DEMO_ROLE_KEY);
    if (storedRole && ["ADMIN", "STAFF", "CUSTOMER"].includes(storedRole)) {
      setSelectedRole(storedRole as typeof selectedRole);
    } else if (session?.user) {
      setSelectedRole((session.user as any).role || "ADMIN");
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user || hasSyncedDemoRole.current) return;
    const currentRole = (session.user as any).role;
    const storedRole = typeof window !== "undefined" ? window.localStorage.getItem(DEMO_ROLE_KEY) : null;
    if (storedRole && storedRole !== currentRole && ["ADMIN", "STAFF", "CUSTOMER"].includes(storedRole)) {
      hasSyncedDemoRole.current = true;
      handleRoleApply(storedRole as typeof selectedRole);
    } else if (currentRole) {
      setSelectedRole(currentRole);
    }
  }, [session]);

  const handleRoleApply = async (role: typeof ROLE_OPTIONS[number]["value"]) => {
    if (!session?.user) return;
    if (role === (session.user as any).role) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/demo/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        await update({ role });
        if (role === "CUSTOMER") {
          router.push("/register");
        } else {
          router.push("/admin");
        }
      }
    } catch (error) {
      console.error("Failed to apply demo role", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (role: typeof ROLE_OPTIONS[number]["value"]) => {
    setSelectedRole(role);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DEMO_ROLE_KEY, role);
    }
    if (session?.user) {
      await handleRoleApply(role);
    }
  };

  if (!session?.user && !isLoginPage) {
    return null;
  }

  const links = QUICK_LINKS[selectedRole] || [];

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] overflow-hidden rounded-3xl border border-border/70 bg-background/95 shadow-2xl backdrop-blur-xl transition-all duration-200 ${collapsed ? "w-44" : "w-[min(100vw-1rem,22rem)]"}`}>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">Select Role</p>
            {!collapsed && (
              <h2 className="mt-1 text-sm font-semibold text-foreground">Choose your demo experience</h2>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-full border border-border/70 bg-muted/80 p-2 text-muted-foreground transition hover:bg-muted"
          aria-label={collapsed ? "Expand demo role panel" : "Collapse demo role panel"}
        >
          {collapsed ? "+" : "–"}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-4 border-t border-border/70 px-4 pb-4">
          <div className="space-y-3">
            {ROLE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 transition-all ${
                  selectedRole === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border/60 bg-muted/30 hover:border-primary/80"
                }`}
              >
                <input
                  type="radio"
                  name="demo-role"
                  value={option.value}
                  checked={selectedRole === option.value}
                  onChange={() => handleRoleChange(option.value)}
                  className="h-4 w-4 accent-orange-500"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">{option.label}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">Quick Links</p>
                <p className="text-[11px] text-muted-foreground mt-1">View pages for the chosen role.</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                {selectedRole}
              </span>
            </div>
            <div className="grid gap-2">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl border border-border/60 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/40"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
