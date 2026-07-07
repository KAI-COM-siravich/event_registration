"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  QrCode,
  Store,
  Gift,
  Menu,
  Users,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/check-in", label: "Check-In", Icon: QrCode, exact: false },
  { href: "/booths", label: "Booths", Icon: Store, exact: false },
  { href: "/rewards", label: "Rewards", Icon: Gift, exact: false },
] as const;

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-2xl",
          "transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[0.4rem] bg-primary text-[9px] font-bold text-primary-foreground tracking-wider shadow-sm">
              NC
            </span>
            <span className="text-[15px] font-semibold text-sidebar-foreground tracking-tight">
              Netcube
            </span>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-full p-1 text-muted-foreground hover:bg-muted/50 lg:hidden transition-colors"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 p-2 pt-3">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Management
          </p>
          {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={[
                  "flex items-center gap-2.5 rounded-[0.6rem] px-2.5 py-1.5 text-[14px] font-medium transition-all duration-200",
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
        <div className="p-2 border-t border-border/50">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 rounded-[0.6rem] bg-sidebar-accent/50 px-3 py-2 text-[13px] font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent glow-border"
          >
            <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
            Register Customer
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden relative linear-grid">
        {/* Topbar */}
        <header className="absolute inset-x-0 top-0 z-30 flex h-14 shrink-0 items-center gap-3 bg-background/70 backdrop-blur-xl px-4 lg:px-6 border-b border-border/50">
          <button
            type="button"
            aria-label="Open navigation"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted lg:hidden transition-colors"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {title ?? "Dashboard"}
          </h1>
          <div className="flex-1" />
          <div
            aria-label="Admin user"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary ring-1 ring-primary/20 glow-border"
          >
            A
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-3 pt-16 lg:p-6 lg:pt-18 relative z-10">{children}</main>
      </div>
    </div>
  );
}
