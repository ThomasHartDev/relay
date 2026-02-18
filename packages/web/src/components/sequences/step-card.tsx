"use client";

import { Mail, Clock, GitBranch, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BuilderStep } from "@/lib/stores/sequence-builder-store";

const STEP_ICONS = {
  EMAIL: Mail,
  DELAY: Clock,
  CONDITION: GitBranch,
} as const;

const STEP_COLORS = {
  EMAIL: { bg: "#EFF6FF", text: "#3B82F6", border: "#BFDBFE" },
  DELAY: { bg: "#FFFBEB", text: "#F59E0B", border: "#FDE68A" },
  CONDITION: { bg: "#F5F3FF", text: "#8B5CF6", border: "#DDD6FE" },
} as const;

const STEP_LABELS = {
  EMAIL: "Email",
  DELAY: "Delay",
  CONDITION: "Condition",
} as const;

function formatDelay(ms: number | null | undefined): string {
  if (!ms) return "No delay set";
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0 && remainingHours > 0) return `${days}d ${remainingHours}h`;
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""}`;
  return `${hours} hour${hours !== 1 ? "s" : ""}`;
}

interface StepCardProps {
  step: BuilderStep;
  isSelected: boolean;
  isLast: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function StepCard({ step, isSelected, isLast, onSelect, onRemove }: StepCardProps) {
  const Icon = STEP_ICONS[step.type];
  const colors = STEP_COLORS[step.type];

  return (
    <div className="relative">
      <div
        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
          isSelected
            ? "border-blue-300 bg-blue-50 shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
        }`}
        onClick={onSelect}
      >
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-300" />

        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: colors.bg }}
        >
          <Icon className="h-4 w-4" style={{ color: colors.text }} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500">{STEP_LABELS[step.type]}</p>
          <p className="truncate text-sm text-gray-900">
            {step.type === "EMAIL" && (step.subject || "No subject")}
            {step.type === "DELAY" && formatDelay(step.delayMs)}
            {step.type === "CONDITION" &&
              (step.conditionType ? `If ${step.conditionType.toLowerCase()}` : "No condition set")}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 shrink-0 p-0 text-gray-400 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Connector line */}
      {!isLast && <div className="ml-[42px] h-6 w-0.5 bg-gray-200" />}
    </div>
  );
}

export { STEP_COLORS, STEP_LABELS, formatDelay };
