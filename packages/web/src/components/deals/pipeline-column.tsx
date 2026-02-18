"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { DealCard } from "./deal-card";
import { QuickAddDeal } from "./quick-add-deal";
import {
  formatCurrency,
  type PipelineColumn as PipelineColumnType,
} from "@/lib/deals/pipeline-utils";
import type { DealStage } from "@relay/shared";

interface PipelineColumnProps {
  column: PipelineColumnType;
  onDragStart: (dealId: string) => void;
  onDrop: (dealId: string, targetStage: DealStage) => void;
  onDealCreated: () => void;
}

export function PipelineColumn({
  column,
  onDragStart,
  onDrop,
  onDealCreated,
}: PipelineColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const dealId = e.dataTransfer.getData("text/plain");
    if (dealId) {
      onDrop(dealId, column.stage);
    }
  }

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg bg-gray-50 transition-colors",
        isDragOver && "bg-gray-100 ring-2 ring-inset ring-gray-300",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} />
          <span className="text-sm font-semibold text-gray-700">{column.label}</span>
          <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
            {column.deals.length}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-500">
          {formatCurrency(column.totalValue)}
        </span>
      </div>

      {/* Cards */}
      <div
        className="flex-1 space-y-2 overflow-y-auto px-2 pb-2"
        style={{ maxHeight: "calc(100vh - 260px)" }}
      >
        {column.deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} stageColor={column.color} onDragStart={onDragStart} />
        ))}
      </div>

      {/* Quick add */}
      <div className="border-t border-gray-200 p-2">
        <QuickAddDeal stage={column.stage} onCreated={onDealCreated} />
      </div>
    </div>
  );
}
