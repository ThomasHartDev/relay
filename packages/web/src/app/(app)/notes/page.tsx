"use client";

import { useCallback, useEffect, useState } from "react";
import { StickyNote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteComposer } from "@/components/notes/note-composer";
import { NoteCard, type NoteData } from "@/components/notes/note-card";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface NotesResponse {
  data: NoteData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pinnedFilter, setPinnedFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "25",
    });

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (pinnedFilter) params.set("pinned", pinnedFilter);

    try {
      const res = await fetch(`/api/notes?${params.toString()}`);
      if (res.ok) {
        const json: NotesResponse = await res.json();
        setNotes(json.data);
        setMeta(json.meta);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, pinnedFilter]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pinnedFilter]);

  async function handlePin(id: string, pinned: boolean) {
    // Optimistic update
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned } : n)));

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });

      if (!res.ok) {
        void fetchNotes();
      }
    } catch {
      void fetchNotes();
    }
  }

  async function handleDelete(id: string) {
    // Optimistic removal
    setNotes((prev) => prev.filter((n) => n.id !== id));

    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        void fetchNotes();
      }
    } catch {
      void fetchNotes();
    }
  }

  const isEmpty = !isLoading && notes.length === 0 && !debouncedSearch && !pinnedFilter;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
          {!isLoading && (
            <p className="text-sm text-gray-500">
              {meta.total} note{meta.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Note composer — always visible at top */}
      <NoteComposer onCreated={fetchNotes} />

      {isEmpty ? (
        <EmptyState
          icon={<StickyNote className="h-12 w-12" />}
          title="No notes yet"
          description="Write your first note above to get started."
        />
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setPinnedFilter(pinnedFilter === "true" ? null : "true")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  pinnedFilter === "true"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                }`}
              >
                Pinned
              </button>
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No notes match your search
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} onPin={handlePin} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
