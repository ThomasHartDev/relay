import { z } from "zod";

export const SEQUENCE_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"] as const;
export type SequenceStatus = (typeof SEQUENCE_STATUSES)[number];

export const STEP_TYPES = ["EMAIL", "DELAY", "CONDITION"] as const;
export type StepType = (typeof STEP_TYPES)[number];

export const CONDITION_TYPES = ["OPENED", "CLICKED", "REPLIED"] as const;
export type ConditionType = (typeof CONDITION_TYPES)[number];

export const ENROLLMENT_STATUSES = [
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "BOUNCED",
  "REPLIED",
  "UNSUBSCRIBED",
] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const sequenceStatusSchema = z.enum(SEQUENCE_STATUSES);
export const stepTypeSchema = z.enum(STEP_TYPES);
export const conditionTypeSchema = z.enum(CONDITION_TYPES);
export const enrollmentStatusSchema = z.enum(ENROLLMENT_STATUSES);

export const createSequenceSchema = z.object({
  name: z.string().min(1, "Sequence name is required").max(200),
  status: sequenceStatusSchema.optional().default("DRAFT"),
});

export const createSequenceStepSchema = z.object({
  type: stepTypeSchema,
  order: z.coerce.number().int().nonnegative(),
  delayMs: z.coerce.number().int().nonnegative().optional(),
  subject: z.string().max(200).optional(),
  body: z.string().max(10000).optional(),
  conditionType: conditionTypeSchema.optional(),
});

export type CreateSequenceInput = z.infer<typeof createSequenceSchema>;
export type CreateSequenceStepInput = z.infer<typeof createSequenceStepSchema>;
