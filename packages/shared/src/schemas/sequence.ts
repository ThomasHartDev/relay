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

export const updateSequenceSchema = z.object({
  name: z.string().min(1, "Sequence name is required").max(200).optional(),
  status: sequenceStatusSchema.optional(),
});

export const sequenceFilterSchema = z.object({
  search: z.string().optional(),
  status: sequenceStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const SEQUENCE_STATUS_LABELS: Record<SequenceStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};

export const enrollContactsSchema = z.object({
  contactIds: z.array(z.string().cuid()).min(1, "Select at least one contact"),
});

export const updateEnrollmentSchema = z.object({
  status: enrollmentStatusSchema,
});

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  BOUNCED: "Bounced",
  REPLIED: "Replied",
  UNSUBSCRIBED: "Unsubscribed",
};

export type CreateSequenceInput = z.infer<typeof createSequenceSchema>;
export type CreateSequenceStepInput = z.infer<typeof createSequenceStepSchema>;
export type UpdateSequenceInput = z.infer<typeof updateSequenceSchema>;
export type SequenceFilterInput = z.infer<typeof sequenceFilterSchema>;
export type EnrollContactsInput = z.infer<typeof enrollContactsSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
