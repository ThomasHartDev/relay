"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { useUIStore } from "@/lib/stores/ui-store";
import { SHORTCUTS } from "@/lib/hooks/use-keyboard-shortcuts";

const GROUPS = ["Navigation", "General"] as const;

export function KeyboardShortcutsDialog() {
  const { shortcutsDialogOpen, setShortcutsDialogOpen } = useUIStore();

  return (
    <Dialog open={shortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Navigate faster with these shortcuts.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {GROUPS.map((group) => {
            const items = SHORTCUTS.filter((s) => s.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {group}
                </h3>
                <div className="space-y-1.5">
                  {items.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between rounded-md px-2 py-1.5"
                    >
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.label.split(" ").map((part, i) => (
                          <Kbd key={i}>{part}</Kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
