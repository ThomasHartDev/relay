import { z } from "zod";

export const DEAL_STAGES = [
  "PROSPECT",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const dealStageSchema = z.enum(DEAL_STAGES);

export const createDealSchema = z.object({
  title: z.string().min(1, "Deal title is required").max(200),
  value: z.coerce.number().nonnegative("Deal value must be positive").default(0),
  stage: dealStageSchema.optional().default("PROSPECT"),
  priority: z.coerce.number().int().min(0).max(5).default(0),
  closeDate: z.coerce.date().optional(),
  contactId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  ownerId: z.string().cuid().optional(),
});

export const updateDealSchema = createDealSchema.partial().extend({
  lostReason: z.string().max(500).optional(),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
