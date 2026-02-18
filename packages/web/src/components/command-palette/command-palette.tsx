"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  DollarSign,
  Activity,
  Mail,
  Workflow,
  Settings,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/lib/stores/ui-store";

interface CommandItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  keywords?: string[];
}

const COMMANDS: CommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    group: "Navigation",
  },
  {
    id: "contacts",
    label: "Contacts",
    href: "/contacts",
    icon: Users,
    group: "Navigation",
    keywords: ["people", "leads"],
  },
  {
    id: "companies",
    label: "Companies",
    href: "/companies",
    icon: Building2,
    group: "Navigation",
    keywords: ["organizations", "accounts"],
  },
  {
    id: "deals",
    label: "Deals",
    href: "/deals",
    icon: DollarSign,
    group: "Navigation",
    keywords: ["pipeline", "opportunities"],
  },
  {
    id: "activities",
    label: "Activities",
    href: "/activities",
    icon: Activity,
    group: "Navigation",
    keywords: ["tasks", "calls", "meetings"],
  },
  {
    id: "sequences",
    label: "Sequences",
    href: "/sequences",
    icon: Mail,
    group: "Automation",
    keywords: ["email", "drip", "campaigns"],
  },
  {
    id: "workflows",
    label: "Workflows",
    href: "/workflows",
    icon: Workflow,
    group: "Automation",
    keywords: ["automate", "rules"],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
    group: "Settings",
    keywords: ["preferences", "config"],
  },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query) return COMMANDS;
    const lower = query.toLowerCase();
    return COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) || cmd.keywords?.some((k) => k.includes(lower)),
    );
  }, [query]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      const existing = groups[item.group];
      if (existing) {
        existing.push(item);
      } else {
        groups[item.group] = [item];
      }
    }
    return groups;
  }, [filtered]);

  const flatItems = useMemo(() => filtered, [filtered]);

  const executeCommand = useCallback(
    (item: CommandItem) => {
      setCommandPaletteOpen(false);
      setQuery("");
      setSelectedIndex(0);
      router.push(item.href);
    },
    [router, setCommandPaletteOpen],
  );

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened, restore focus when closed
  useEffect(() => {
    if (commandPaletteOpen) {
      const previousFocus = document.activeElement as HTMLElement | null;
      setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        previousFocus?.focus();
      };
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  // Focus trap — keep focus inside dialog
  useEffect(() => {
    if (!commandPaletteOpen) return;

    function handleFocusTrap(e: KeyboardEvent) {
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])',
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
  }, [commandPaletteOpen]);

  // Keyboard navigation within palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && flatItems[selectedIndex]) {
        e.preventDefault();
        executeCommand(flatItems[selectedIndex]);
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    },
    [flatItems, selectedIndex, executeCommand, setCommandPaletteOpen],
  );

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          ref={dialogRef}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40"
            aria-hidden="true"
            onClick={() => setCommandPaletteOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-gray-200 px-4">
              <Search className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
              <label htmlFor="command-input" className="sr-only">
                Search commands
              </label>
              <input
                id="command-input"
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search or jump to..."
                className="h-12 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-results"
                aria-activedescendant={
                  flatItems[selectedIndex] ? `cmd-${flatItems[selectedIndex].id}` : undefined
                }
              />
            </div>

            {/* Results */}
            <div
              id="command-results"
              className="max-h-80 overflow-y-auto p-2"
              role="listbox"
              aria-label="Search results"
            >
              {flatItems.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-gray-500" role="status">
                  No results found
                </p>
              ) : (
                Object.entries(groupedItems).map(([group, items]) => (
                  <div key={group} className="mb-2" role="group" aria-label={group}>
                    <p
                      className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400"
                      aria-hidden="true"
                    >
                      {group}
                    </p>
                    {items.map((item) => {
                      const index = flatItems.indexOf(item);
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          id={`cmd-${item.id}`}
                          role="option"
                          aria-selected={index === selectedIndex}
                          onClick={() => executeCommand(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            index === selectedIndex
                              ? "bg-brand-50 text-brand-700"
                              : "text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div
              className="flex items-center justify-between border-t border-gray-200 px-4 py-2 text-xs text-gray-400"
              aria-hidden="true"
            >
              <span>
                <kbd className="rounded border border-gray-200 px-1">&#8593;&#8595;</kbd> Navigate
              </span>
              <span>
                <kbd className="rounded border border-gray-200 px-1">&#8629;</kbd> Select
              </span>
              <span>
                <kbd className="rounded border border-gray-200 px-1">Esc</kbd> Close
              </span>
            </div>
          </motion.div>

          {/* Live region for screen reader announcements */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {flatItems.length} result{flatItems.length !== 1 ? "s" : ""} available
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
