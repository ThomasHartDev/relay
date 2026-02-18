"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Plus, MoreHorizontal, Pencil, Trash2, Play, Pause, Archive } from "lucide-react";
import { SEQUENCE_STATUSES, SEQUENCE_STATUS_LABELS, type SequenceStatus } from "@relay/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SequenceStatusBadge } from "@/components/sequences/sequence-status-badge";
import { SequenceDialog } from "@/components/sequences/sequence-dialog";
import { SEQUENCE_STATUS_COLORS } from "@/lib/design-tokens";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface SequenceItem {
  id: string;
  name: string;
  status: SequenceStatus;
  createdAt: string;
  updatedAt: string;
  _count: {
    steps: number;
    enrollments: number;
  };
}

interface SequencesResponse {
  data: SequenceItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function SequencesPage() {
  const router = useRouter();
  const [sequences, setSequences] = useState<SequenceItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SequenceStatus | null>(null);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSequence, setEditingSequence] = useState<SequenceItem | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchSequences = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "25",
    });

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/sequences?${params.toString()}`);
      if (res.ok) {
        const json: SequencesResponse = await res.json();
        setSequences(json.data);
        setMeta(json.meta);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    void fetchSequences();
  }, [fetchSequences]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  async function handleStatusChange(id: string, status: SequenceStatus) {
    const res = await fetch(`/api/sequences/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) void fetchSequences();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/sequences/${id}`, { method: "DELETE" });
    if (res.ok) void fetchSequences();
  }

  function handleEdit(seq: SequenceItem) {
    setEditingSequence(seq);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditingSequence(null);
    setDialogOpen(true);
  }

  const isEmpty = !isLoading && sequences.length === 0 && !debouncedSearch && !statusFilter;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sequences</h2>
          {!isLoading && (
            <p className="text-sm text-gray-500">
              {meta.total} sequence{meta.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Sequence
        </Button>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<Mail className="h-12 w-12" />}
          title="No sequences yet"
          description="Create your first email sequence to automate outreach."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Sequence
            </Button>
          }
        />
      ) : (
        <>
          {/* Filters — Hick's Law: search + status chips */}
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search sequences..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setStatusFilter(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === null
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {SEQUENCE_STATUSES.map((status) => {
                const colors = SEQUENCE_STATUS_COLORS[status];
                const isActive = statusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(isActive ? null : status)}
                    className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: isActive ? colors.text : colors.bg,
                      color: isActive ? "#fff" : colors.text,
                    }}
                  >
                    {SEQUENCE_STATUS_LABELS[status]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sequence list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : sequences.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No sequences match your filters
            </p>
          ) : (
            <div className="space-y-3">
              {sequences.map((seq) => (
                <Card
                  key={seq.id}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => router.push(`/sequences/${seq.id}`)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{seq.name}</p>
                          <SequenceStatusBadge status={seq.status} />
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                          <span>
                            {seq._count.steps} step{seq._count.steps !== 1 ? "s" : ""}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span>{seq._count.enrollments} enrolled</span>
                          <span className="text-gray-300">|</span>
                          <span>
                            Updated{" "}
                            {new Date(seq.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleEdit(seq)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Rename
                        </DropdownMenuItem>
                        {seq.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(seq.id, "ACTIVE")}>
                            <Play className="mr-2 h-3.5 w-3.5" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        {seq.status === "ACTIVE" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(seq.id, "PAUSED")}>
                            <Pause className="mr-2 h-3.5 w-3.5" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {seq.status === "PAUSED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(seq.id, "ACTIVE")}>
                            <Play className="mr-2 h-3.5 w-3.5" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        {seq.status !== "ARCHIVED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(seq.id, "ARCHIVED")}>
                            <Archive className="mr-2 h-3.5 w-3.5" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(seq.id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
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

      <SequenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={fetchSequences}
        sequence={editingSequence}
      />
    </div>
  );
}
