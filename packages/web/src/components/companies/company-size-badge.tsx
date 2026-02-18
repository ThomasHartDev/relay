"use client";

import { Badge } from "@/components/ui/badge";
import { SIZE_COLORS } from "@/lib/design-tokens";
import type { CompanySize } from "@relay/shared";

const SIZE_LABELS: Record<CompanySize, string> = {
  STARTUP: "Startup",
  SMALL: "Small",
  MEDIUM: "Medium",
  ENTERPRISE: "Enterprise",
};

interface CompanySizeBadgeProps {
  size: CompanySize;
}

export function CompanySizeBadge({ size }: CompanySizeBadgeProps) {
  const colors = SIZE_COLORS[size];

  return (
    <Badge
      variant="outline"
      className="text-xs font-medium"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {SIZE_LABELS[size]}
    </Badge>
  );
}
