"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  QrCode,
  Store,
  Gift,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/events", label: "Events", Icon: CalendarDays, exact: false },
  { href: "/check-in", label: "Check-In", Icon: QrCode, exact: false },
  { href: "/booths", label: "Booths", Icon: Store, exact: false },
  { href: "/rewards", label: "Rewards", Icon: Gift, exact: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="bottom-nav flex lg:hidden" aria-label="Mobile navigation">
      {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-item${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="relative flex h-7 w-7 items-center justify-center">
              {active && (
                <span className="absolute inset-0 rounded-full bg-primary/15 scale-[1.4]" />
              )}
              <Icon
                className={`relative h-[22px] w-[22px] transition-all duration-200 ${
                  active ? "scale-110" : "scale-100 opacity-60"
                }`}
                aria-hidden="true"
              />
            </span>
            <span
              className={`text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                active ? "opacity-100" : "opacity-50"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
