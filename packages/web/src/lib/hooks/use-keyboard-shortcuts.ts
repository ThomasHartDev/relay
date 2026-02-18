"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/stores/ui-store";

interface Shortcut {
  key: string;
  label: string;
  description: string;
  group: "Navigation" | "Actions" | "General";
}

export const SHORTCUTS: Shortcut[] = [
  { key: "g c", label: "G then C", description: "Go to Contacts", group: "Navigation" },
  { key: "g d", label: "G then D", description: "Go to Deals", group: "Navigation" },
  { key: "g a", label: "G then A", description: "Go to Activities", group: "Navigation" },
  { key: "g w", label: "G then W", description: "Go to Workflows", group: "Navigation" },
  { key: "g s", label: "G then S", description: "Go to Sequences", group: "Navigation" },
  { key: "g h", label: "G then H", description: "Go to Dashboard", group: "Navigation" },
  { key: "⌘ k", label: "⌘K", description: "Open command palette", group: "General" },
  { key: "?", label: "?", description: "Show keyboard shortcuts", group: "General" },
];

const NAV_MAP: Record<string, string> = {
  c: "/contacts",
  d: "/deals",
  a: "/activities",
  w: "/workflows",
  s: "/sequences",
  h: "/dashboard",
};

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { setCommandPaletteOpen } = useUIStore();
  const pendingPrefix = useRef<string | null>(null);
  const prefixTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shortcutsDialogOpen = useUIStore((s) => s.shortcutsDialogOpen);
  const setShortcutsDialogOpen = useUIStore((s) => s.setShortcutsDialogOpen);

  const clearPrefix = useCallback(() => {
    pendingPrefix.current = null;
    if (prefixTimer.current) {
      clearTimeout(prefixTimer.current);
      prefixTimer.current = null;
    }
  }, []);

  useEffect(() => {
    function isInputFocused(): boolean {
      const active = document.activeElement;
      if (!active) return false;
      const tag = active.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        (active as HTMLElement).isContentEditable
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isInputFocused()) return;

      const key = e.key.toLowerCase();

      // Handle "?" for shortcuts dialog
      if (e.key === "?" || (e.shiftKey && key === "/")) {
        e.preventDefault();
        setShortcutsDialogOpen(!shortcutsDialogOpen);
        return;
      }

      // Handle "g" prefix for navigation chords
      if (key === "g" && !pendingPrefix.current) {
        pendingPrefix.current = "g";
        prefixTimer.current = setTimeout(clearPrefix, 800);
        return;
      }

      // Handle second key of "g + X" chord
      if (pendingPrefix.current === "g") {
        clearPrefix();
        const dest = NAV_MAP[key];
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearPrefix();
    };
  }, [router, setCommandPaletteOpen, shortcutsDialogOpen, setShortcutsDialogOpen, clearPrefix]);
}
