import { Badge } from "@/components/ui/badge";
import { SEQUENCE_STATUS_COLORS } from "@/lib/design-tokens";
import { SEQUENCE_STATUS_LABELS, type SequenceStatus } from "@relay/shared";

export function SequenceStatusBadge({ status }: { status: SequenceStatus }) {
  const colors = SEQUENCE_STATUS_COLORS[status];

  return (
    <Badge
      variant="secondary"
      className="text-[10px]"
      style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
    >
      {SEQUENCE_STATUS_LABELS[status]}
    </Badge>
  );
}
