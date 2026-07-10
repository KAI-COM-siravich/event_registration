"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  QrCode,
  Store,
  Gift,
  Menu,
  Users,
  X,
  CalendarDays,
  LogOut,
  UserCog,
  ShieldAlert,
  FileText,
  Settings,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { BottomNav } from "../ui/BottomNav";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/registrations", label: "Registrations", Icon: Users, exact: false },
  { href: "/events", label: "Events", Icon: CalendarDays, exact: false, adminOnly: true },
  { href: "/check-in", label: "Check-In", Icon: QrCode, exact: false },
  { href: "/booths", label: "Booths", Icon: Store, exact: false },
  { href: "/rewards", label: "Rewards", Icon: Gift, exact: false },
  { href: "/admin/users", label: "Users & Staff", Icon: UserCog, exact: false, adminOnly: true },
  { href: "/admin/blacklist", label: "Blacklist", Icon: ShieldAlert, exact: false },
  { href: "/admin/logs", label: "Logs", Icon: FileText, exact: false, adminOnly: true },
  { href: "/admin/settings", label: "Settings", Icon: Settings, exact: false, adminOnly: true },
] as const;

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const [orgName, setOrgName] = useState("Event Platform");
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && data.ORGANIZATION_NAME) {
          setOrgName(data.ORGANIZATION_NAME);
        }
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile & tablet backdrop */}
      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile (bottom nav used instead), slide-in on tablet, static on desktop */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar/90 backdrop-blur-2xl",
          "transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border/50">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.5rem] bg-primary text-[10px] font-bold text-primary-foreground tracking-wider shadow-sm">
              {orgName.substring(0, 2).toUpperCase()}
            </span>
            <span className="text-[14px] font-semibold text-sidebar-foreground tracking-tight truncate">
              {orgName}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted/50 lg:hidden transition-colors"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 p-2 pt-3 overflow-y-auto">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Management
          </p>
          {NAV_ITEMS.map((item) => {
            if ('adminOnly' in item && item.adminOnly && (session?.user as any)?.role !== "ADMIN") {
              return null;
            }
            const { href, label, Icon, exact } = item;
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={[
                  "flex items-center gap-2.5 rounded-[0.6rem] px-2.5 py-2 text-[14px] font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-primary/10 text-sidebar-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] glow-border"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                ].join(" ")}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border/50 flex flex-col gap-1">
          {session?.user && (
            <div className="flex items-center gap-3 rounded-[0.6rem] bg-muted/30 px-3 py-2 mb-1 border border-border/30">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs shadow-sm">
                {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="text-[13px] font-semibold text-foreground truncate">{session.user.name || "Admin User"}</span>
                <span className="text-[10px] text-muted-foreground truncate">{session.user.email}</span>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 rounded-[0.6rem] px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden relative linear-grid">
        {/* Topbar */}
        <header className="absolute inset-x-0 top-0 z-30 flex h-14 shrink-0 items-center gap-3 bg-background/70 backdrop-blur-xl px-4 lg:px-6 border-b border-border/50">
          {/* Hamburger — visible on mobile and tablet */}
          <button
            type="button"
            aria-label="Open navigation"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted flex lg:hidden transition-colors touch-target"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {title ?? "Dashboard"}
          </h1>
          <div className="flex-1" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors touch-target"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </header>

        {/* Page content — padded for bottom nav on mobile */}
        <main className="flex-1 overflow-auto relative z-10">
          <div className="p-3 pt-16 pb-28 lg:p-6 lg:pt-18 lg:pb-6 min-h-full">
            {children}
          </div>
        </main>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
