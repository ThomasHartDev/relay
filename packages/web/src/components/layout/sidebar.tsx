"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  Mail,
  Workflow,
  Settings,
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/lib/stores/ui-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "CRM",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Contacts", href: "/contacts", icon: Users },
      { label: "Companies", href: "/companies", icon: Building2 },
      { label: "Deals", href: "/deals", icon: DollarSign },
      { label: "Activities", href: "/activities", icon: Activity },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Sequences", href: "/sequences", icon: Mail },
      { label: "Workflows", href: "/workflows", icon: Workflow },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

function NavGroupSection({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <div className="mb-2">
      {!collapsed && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600"
        >
          {group.label}
          <ChevronDown className={cn("h-3 w-3 transition-transform", !expanded && "-rotate-90")} />
        </button>
      )}
      {(expanded || collapsed) && (
        <nav className="space-y-0.5">
          {group.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-gray-200 px-4",
          sidebarCollapsed && "justify-center px-2",
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-brand-600 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
            R
          </div>
          {!sidebarCollapsed && <span className="text-lg font-semibold text-gray-900">Relay</span>}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => (
          <NavGroupSection key={group.label} group={group} collapsed={sidebarCollapsed} />
        ))}
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-gray-200 p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn("h-5 w-5 transition-transform", sidebarCollapsed && "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
}
