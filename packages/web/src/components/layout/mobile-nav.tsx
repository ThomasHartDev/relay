"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  Mail,
  Workflow,
  Settings,
  LayoutDashboard,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/lib/stores/ui-store";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Deals", href: "/deals", icon: DollarSign },
  { label: "Activities", href: "/activities", icon: Activity },
  { label: "Sequences", href: "/sequences", icon: Mail },
  { label: "Workflows", href: "/workflows", icon: Workflow },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on route change
  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [pathname, setSidebarMobileOpen]);

  // Focus close button on open and trap focus
  useEffect(() => {
    if (!sidebarMobileOpen) return;

    setTimeout(() => closeButtonRef.current?.focus(), 50);

    function handleFocusTrap(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSidebarMobileOpen(false);
        return;
      }

      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleFocusTrap);
    return () => document.removeEventListener("keydown", handleFocusTrap);
  }, [sidebarMobileOpen, setSidebarMobileOpen]);

  if (!sidebarMobileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        aria-hidden="true"
        onClick={() => setSidebarMobileOpen(false)}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center gap-2">
            <div
              className="bg-brand-600 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
              aria-hidden="true"
            >
              R
            </div>
            <span className="text-lg font-semibold text-gray-900">Relay</span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={() => setSidebarMobileOpen(false)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="space-y-0.5 px-2 py-3" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
