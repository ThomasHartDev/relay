"use client";

import { Badge } from "@/components/ui/badge";
import { WORKFLOW_STATUS_COLORS } from "@/lib/design-tokens";
import { WORKFLOW_STATUS_LABELS, type WorkflowStatus } from "@relay/shared";

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
}

export function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  const colors = WORKFLOW_STATUS_COLORS[status];

  return (
    <Badge
      variant="secondary"
      className="text-[10px]"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {WORKFLOW_STATUS_LABELS[status]}
    </Badge>
  );
}
