"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogEntry {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  action: string;
  result: string;
  timestamp: string;
}

interface Execution {
  id: string;
  status: string;
  triggerData: Record<string, unknown>;
  log: LogEntry[];
  startedAt: string;
  completedAt: string | null;
}

const STATUS_STYLES: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  COMPLETED: { icon: CheckCircle2, color: "text-emerald-600" },
  FAILED: { icon: XCircle, color: "text-red-600" },
  RUNNING: { icon: Loader2, color: "text-blue-600" },
  CANCELLED: { icon: XCircle, color: "text-gray-500" },
};

export function ExecutionHistory({ workflowId }: { workflowId: string }) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchExecutions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/executions?limit=20`);
      if (res.ok) {
        const json = await res.json();
        setExecutions(json.data ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    void fetchExecutions();
  }, [fetchExecutions]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDuration(start: string, end: string | null) {
    if (!end) return "Running...";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="py-8 text-center">
        <Play className="mx-auto mb-2 h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500">No executions yet</p>
        <p className="text-xs text-gray-400">
          Activate the workflow and trigger it to see execution history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Execution History</h3>
        <Button variant="ghost" size="sm" onClick={fetchExecutions}>
          Refresh
        </Button>
      </div>

      <div className="space-y-1.5">
        {executions.map((exec) => {
          const statusDef = STATUS_STYLES[exec.status] ?? STATUS_STYLES.CANCELLED!;
          const StatusIcon = statusDef.icon;
          const isExpanded = expandedId === exec.id;
          const logEntries = Array.isArray(exec.log) ? (exec.log as LogEntry[]) : [];

          return (
            <div key={exec.id} className="rounded-lg border border-gray-200 bg-white">
              <button
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                onClick={() => setExpandedId(isExpanded ? null : exec.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                )}
                <StatusIcon
                  className={`h-4 w-4 ${statusDef.color} ${
                    exec.status === "RUNNING" ? "animate-spin" : ""
                  }`}
                />
                <div className="flex-1">
                  <span className="text-xs font-medium text-gray-700">{exec.status}</span>
                  <span className="ml-2 text-xs text-gray-400">{formatDate(exec.startedAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatDuration(exec.startedAt, exec.completedAt)}
                </div>
                <span className="text-xs text-gray-400">
                  {logEntries.length} step{logEntries.length !== 1 ? "s" : ""}
                </span>
              </button>

              {isExpanded && logEntries.length > 0 && (
                <div className="border-t border-gray-100 px-3 py-2">
                  <div className="space-y-1.5">
                    {logEntries.map((entry, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                        <div className="flex-1">
                          <span className="font-medium text-gray-600">{entry.nodeLabel}</span>
                          <span className="ml-1 text-gray-400">
                            ({entry.nodeType.toLowerCase()})
                          </span>
                          <p className="text-gray-500">{entry.result}</p>
                        </div>
                        <span className="shrink-0 text-gray-300">
                          {new Date(entry.timestamp).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
