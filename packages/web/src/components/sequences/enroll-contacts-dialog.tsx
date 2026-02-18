"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface ContactOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface EnrollContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequenceId: string;
  onEnrolled: () => void;
}

export function EnrollContactsDialog({
  open,
  onOpenChange,
  sequenceId,
  onEnrolled,
}: EnrollContactsDialogProps) {
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);

    try {
      const res = await fetch(`/api/contacts?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setContacts(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (open) {
      void fetchContacts();
      setSelectedIds(new Set());
      setError(null);
      setSearch("");
    }
  }, [open, fetchContacts]);

  function toggleContact(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleEnroll() {
    if (selectedIds.size === 0) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/sequences/${sequenceId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: Array.from(selectedIds) }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to enroll contacts");
      }

      onOpenChange(false);
      onEnrolled();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Contacts</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
          ) : contacts.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No contacts found</p>
          ) : (
            <div className="space-y-1">
              {contacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(contact.id)}
                    onChange={() => toggleContact(contact.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="truncate text-xs text-gray-500">{contact.email}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {selectedIds.size > 0 && (
          <p className="text-xs text-gray-500">
            {selectedIds.size} contact{selectedIds.size !== 1 ? "s" : ""} selected
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEnroll} disabled={selectedIds.size === 0} isLoading={isSubmitting}>
            <UserPlus className="mr-2 h-4 w-4" />
            Enroll {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
