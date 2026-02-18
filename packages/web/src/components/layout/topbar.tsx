"use client";

import { usePathname } from "next/navigation";
import { Search, Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { Kbd } from "@/components/ui/kbd";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/contacts": "Contacts",
  "/companies": "Companies",
  "/deals": "Deals",
  "/activities": "Activities",
  "/sequences": "Sequences",
  "/workflows": "Workflows",
  "/settings": "Settings",
};

function getBreadcrumb(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 1) {
    const base = "/" + segments[0];
    if (ROUTE_LABELS[base]) return ROUTE_LABELS[base];
  }

  return "Dashboard";
}

export function Topbar() {
  const pathname = usePathname();
  const { setCommandPaletteOpen, setSidebarMobileOpen } = useUIStore();
  const { user, logout } = useAuth();

  const breadcrumb = getBreadcrumb(pathname);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-lg font-semibold text-gray-900">{breadcrumb}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search bar / command palette trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            "hidden items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 sm:flex",
          )}
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <Kbd>⌘K</Kbd>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 sm:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:ring-brand-500 flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name ?? "User"}</span>
                <span className="text-xs text-gray-500">{user?.email ?? ""}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
