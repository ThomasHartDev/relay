export const STAGE_COLORS = {
  PROSPECT: { bg: "#EEF2FF", text: "#6366F1", border: "#C7D2FE" },
  QUALIFIED: { bg: "#EFF6FF", text: "#3B82F6", border: "#BFDBFE" },
  PROPOSAL: { bg: "#F5F3FF", text: "#8B5CF6", border: "#DDD6FE" },
  NEGOTIATION: { bg: "#FFF7ED", text: "#F97316", border: "#FED7AA" },
  WON: { bg: "#F0FDF4", text: "#22C55E", border: "#BBF7D0" },
  LOST: { bg: "#FEF2F2", text: "#EF4444", border: "#FECACA" },
} as const;

export const STATUS_COLORS = {
  LEAD: { bg: "#F0F9FF", text: "#0EA5E9", border: "#BAE6FD" },
  PROSPECT: { bg: "#EEF2FF", text: "#6366F1", border: "#C7D2FE" },
  CUSTOMER: { bg: "#F0FDF4", text: "#22C55E", border: "#BBF7D0" },
  CHURNED: { bg: "#FEF2F2", text: "#EF4444", border: "#FECACA" },
  ARCHIVED: { bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },
} as const;

export const ACTIVITY_COLORS = {
  CALL: { bg: "#F0FDF4", text: "#22C55E", icon: "phone" },
  EMAIL: { bg: "#EFF6FF", text: "#3B82F6", icon: "mail" },
  MEETING: { bg: "#F5F3FF", text: "#8B5CF6", icon: "calendar" },
  TASK: { bg: "#FFFBEB", text: "#F59E0B", icon: "check-square" },
  NOTE: { bg: "#F9FAFB", text: "#6B7280", icon: "file-text" },
} as const;

export const SIZE_COLORS = {
  STARTUP: { bg: "#F0FDF4", text: "#22C55E", border: "#BBF7D0" },
  SMALL: { bg: "#EFF6FF", text: "#3B82F6", border: "#BFDBFE" },
  MEDIUM: { bg: "#F5F3FF", text: "#8B5CF6", border: "#DDD6FE" },
  ENTERPRISE: { bg: "#FFF7ED", text: "#F97316", border: "#FED7AA" },
} as const;

export const SEQUENCE_STATUS_COLORS = {
  DRAFT: { bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },
  ACTIVE: { bg: "#F0FDF4", text: "#22C55E", border: "#BBF7D0" },
  PAUSED: { bg: "#FFFBEB", text: "#F59E0B", border: "#FDE68A" },
  ARCHIVED: { bg: "#F5F3FF", text: "#8B5CF6", border: "#DDD6FE" },
} as const;

export const HIGHLIGHT_COLORS = {
  overdue: "#FEE2E2",
  hotDeal: "#FFEDD5",
  vonRestorff: "#FEF3C7",
} as const;
