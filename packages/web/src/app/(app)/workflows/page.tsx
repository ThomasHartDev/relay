"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Workflow as WorkflowIcon,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Play,
  Pause,
  Archive,
  Zap,
  Copy,
  LayoutTemplate,
} from "lucide-react";
import {
  WORKFLOW_STATUSES,
  WORKFLOW_STATUS_LABELS,
  WORKFLOW_TRIGGER_LABELS,
  type WorkflowStatus,
  type WorkflowTriggerType,
} from "@relay/shared";
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
import { WorkflowStatusBadge } from "@/components/workflows/workflow-status-badge";
import { WorkflowDialog } from "@/components/workflows/workflow-dialog";
import { TemplateGallery } from "@/components/workflows/template-gallery";
import { WORKFLOW_STATUS_COLORS } from "@/lib/design-tokens";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface WorkflowItem {
  id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  triggerType: WorkflowTriggerType | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    nodes: number;
    executions: number;
  };
}

interface WorkflowsResponse {
  data: WorkflowItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | null>(null);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowItem | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "25",
    });

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/workflows?${params.toString()}`);
      if (res.ok) {
        const json: WorkflowsResponse = await res.json();
        setWorkflows(json.data);
        setMeta(json.meta);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    void fetchWorkflows();
  }, [fetchWorkflows]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  async function handleStatusChange(id: string, status: WorkflowStatus) {
    const res = await fetch(`/api/workflows/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) void fetchWorkflows();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    if (res.ok) void fetchWorkflows();
  }

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/workflows/${id}/duplicate`, {
      method: "POST",
    });
    if (res.ok) {
      const json = await res.json();
      router.push(`/workflows/${(json.data as { id: string }).id}`);
    }
  }

  function handleEdit(wf: WorkflowItem) {
    setEditingWorkflow(wf);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditingWorkflow(null);
    setDialogOpen(true);
  }

  const isEmpty = !isLoading && workflows.length === 0 && !debouncedSearch && !statusFilter;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflows</h2>
          {!isLoading && (
            <p className="text-sm text-gray-500">
              {meta.total} workflow{meta.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(!showTemplates)}>
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </div>

      {showTemplates && (
        <Card>
          <CardContent className="p-5">
            <TemplateGallery onClose={() => setShowTemplates(false)} />
          </CardContent>
        </Card>
      )}

      {isEmpty ? (
        <EmptyState
          icon={<WorkflowIcon className="h-12 w-12" />}
          title="No workflows yet"
          description="Create your first workflow to automate CRM actions."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          }
        />
      ) : (
        <>
          {/* Filters — Hick's Law: search + status chips */}
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search workflows..."
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
              {WORKFLOW_STATUSES.map((status) => {
                const colors = WORKFLOW_STATUS_COLORS[status];
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
                    {WORKFLOW_STATUS_LABELS[status]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workflow list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : workflows.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No workflows match your filters
            </p>
          ) : (
            <div className="space-y-3">
              {workflows.map((wf) => (
                <Card
                  key={wf.id}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => router.push(`/workflows/${wf.id}`)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                        <Zap className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{wf.name}</p>
                          <WorkflowStatusBadge status={wf.status} />
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                          {wf.triggerType && (
                            <>
                              <span>{WORKFLOW_TRIGGER_LABELS[wf.triggerType]}</span>
                              <span className="text-gray-300">|</span>
                            </>
                          )}
                          <span>
                            {wf._count.nodes} node{wf._count.nodes !== 1 ? "s" : ""}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span>
                            {wf._count.executions} run{wf._count.executions !== 1 ? "s" : ""}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span>
                            Updated{" "}
                            {new Date(wf.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        {wf.description && (
                          <p className="mt-1 truncate text-xs text-gray-400">{wf.description}</p>
                        )}
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
                        <DropdownMenuItem onClick={() => handleEdit(wf)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(wf.id)}>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Duplicate
                        </DropdownMenuItem>
                        {wf.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(wf.id, "ACTIVE")}>
                            <Play className="mr-2 h-3.5 w-3.5" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        {wf.status === "ACTIVE" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(wf.id, "PAUSED")}>
                            <Pause className="mr-2 h-3.5 w-3.5" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {wf.status === "PAUSED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(wf.id, "ACTIVE")}>
                            <Play className="mr-2 h-3.5 w-3.5" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        {wf.status !== "ARCHIVED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(wf.id, "ARCHIVED")}>
                            <Archive className="mr-2 h-3.5 w-3.5" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(wf.id)}
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

      <WorkflowDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={fetchWorkflows}
        workflow={editingWorkflow}
      />
    </div>
  );
}
