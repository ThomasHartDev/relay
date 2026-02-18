"use client";

import { cn } from "@/lib/cn";
import { formatCurrency, daysSinceCreated, type PipelineDeal } from "@/lib/deals/pipeline-utils";

interface DealCardProps {
  deal: PipelineDeal;
  stageColor: string;
  onDragStart: (dealId: string) => void;
}

export function DealCard({ deal, stageColor, onDragStart }: DealCardProps) {
  const daysInStage = daysSinceCreated(deal.createdAt);
  const isStale = daysInStage > 30;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", deal.id);
        onDragStart(deal.id);
      }}
      className={cn(
        "cursor-grab rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
        isStale ? "border-gray-300 opacity-75" : "border-gray-200",
      )}
      style={{ borderLeftColor: stageColor, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between">
        <p className="line-clamp-2 text-sm font-medium text-gray-900">{deal.title}</p>
        <span className="ml-2 shrink-0 text-sm font-semibold text-gray-900">
          {formatCurrency(deal.value)}
        </span>
      </div>

      {(deal.contact || deal.company) && (
        <p className="mt-1.5 truncate text-xs text-gray-500">
          {deal.contact && `${deal.contact.firstName} ${deal.contact.lastName}`}
          {deal.contact && deal.company && " · "}
          {deal.company && deal.company.name}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        {deal.owner && <span>{deal.owner.name}</span>}
        <span className={cn(isStale && "text-amber-500")}>{daysInStage}d</span>
      </div>
    </div>
  );
}
