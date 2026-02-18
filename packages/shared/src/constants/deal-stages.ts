import type { DealStage } from "../schemas/deal";

export interface DealStageConfig {
  label: string;
  color: string;
  bgColor: string;
  order: number;
}

export const DEAL_STAGE_CONFIG: Record<DealStage, DealStageConfig> = {
  PROSPECT: {
    label: "Prospect",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    order: 0,
  },
  QUALIFIED: {
    label: "Qualified",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    order: 1,
  },
  PROPOSAL: {
    label: "Proposal",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    order: 2,
  },
  NEGOTIATION: {
    label: "Negotiation",
    color: "#F97316",
    bgColor: "#FFF7ED",
    order: 3,
  },
  WON: {
    label: "Won",
    color: "#22C55E",
    bgColor: "#F0FDF4",
    order: 4,
  },
  LOST: {
    label: "Lost",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    order: 5,
  },
};

export const ACTIVE_DEAL_STAGES: DealStage[] = ["PROSPECT", "QUALIFIED", "PROPOSAL", "NEGOTIATION"];

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  PROSPECT: "Prospect",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};
