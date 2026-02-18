import type { DealStage } from "@relay/shared";
import { DEAL_STAGES, DEAL_STAGE_CONFIG } from "@relay/shared";

export interface PipelineDeal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  createdAt: string;
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
  owner: { id: string; name: string } | null;
}

export interface PipelineColumn {
  stage: DealStage;
  label: string;
  color: string;
  bgColor: string;
  deals: PipelineDeal[];
  totalValue: number;
}

export function groupDealsByStage(deals: PipelineDeal[]): PipelineColumn[] {
  const groups = new Map<DealStage, PipelineDeal[]>();

  for (const stage of DEAL_STAGES) {
    groups.set(stage, []);
  }

  for (const deal of deals) {
    const existing = groups.get(deal.stage);
    if (existing) {
      existing.push(deal);
    }
  }

  return DEAL_STAGES.map((stage) => {
    const stageDeals = groups.get(stage) ?? [];
    const config = DEAL_STAGE_CONFIG[stage];
    return {
      stage,
      label: config.label,
      color: config.color,
      bgColor: config.bgColor,
      deals: stageDeals,
      totalValue: stageDeals.reduce((sum, d) => sum + d.value, 0),
    };
  });
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}k`;
  }
  return `$${value.toLocaleString()}`;
}

export function daysSinceCreated(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 86_400_000);
}
