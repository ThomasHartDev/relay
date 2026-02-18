"use client";

import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PipelineColumn } from "@/components/deals/pipeline-column";
import { groupDealsByStage, formatCurrency, type PipelineDeal } from "@/lib/deals/pipeline-utils";
import type { DealStage } from "@relay/shared";

export default function DealsPage() {
  const [deals, setDeals] = useState<PipelineDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/deals?limit=200");
      if (res.ok) {
        const json = await res.json();
        setDeals(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDeals();
  }, [fetchDeals]);

  async function handleDrop(dealId: string, targetStage: DealStage) {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === targetStage) return;

    // Optimistic update
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d)));

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage }),
      });

      if (!res.ok) {
        // Revert on failure
        setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: deal.stage } : d)));
      }
    } catch {
      setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: deal.stage } : d)));
    }
  }

  function handleDragStart(_dealId: string) {
    // Could add visual feedback here in the future
  }

  const columns = groupDealsByStage(deals);
  const totalPipeline = deals.reduce((sum, d) => sum + d.value, 0);
  const activeDeals = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72 shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            <strong className="text-gray-900">{activeDeals.length}</strong> active deals
          </span>
          <span>
            <strong className="text-gray-900">{formatCurrency(totalPipeline)}</strong> total
            pipeline
          </span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map((column) => (
          <PipelineColumn
            key={column.stage}
            column={column}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDealCreated={fetchDeals}
          />
        ))}
      </div>
    </div>
  );
}
