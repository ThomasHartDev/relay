import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";
import type { ContactStatus } from "@relay/shared";

const STATUS_VARIANT_MAP: Record<ContactStatus, BadgeProps["variant"]> = {
  LEAD: "default",
  PROSPECT: "secondary",
  CUSTOMER: "success",
  CHURNED: "destructive",
  ARCHIVED: "outline",
};

const STATUS_LABEL_MAP: Record<ContactStatus, string> = {
  LEAD: "Lead",
  PROSPECT: "Prospect",
  CUSTOMER: "Customer",
  CHURNED: "Churned",
  ARCHIVED: "Archived",
};

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  return <Badge variant={STATUS_VARIANT_MAP[status]}>{STATUS_LABEL_MAP[status]}</Badge>;
}
