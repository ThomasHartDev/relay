import { z } from "zod";

export const ACTIVITY_TYPES = ["CALL", "EMAIL", "MEETING", "TASK", "NOTE"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const activityTypeSchema = z.enum(ACTIVITY_TYPES);

export const createActivitySchema = z.object({
  type: activityTypeSchema,
  title: z.string().min(1, "Activity title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.coerce.date().optional(),
  contactId: z.string().cuid().optional(),
  dealId: z.string().cuid().optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

export const activityFilterSchema = z.object({
  search: z.string().optional(),
  type: activityTypeSchema.optional(),
  completed: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(100),
  sortBy: z.enum(["dueDate", "createdAt", "title"]).default("dueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityFilter = z.infer<typeof activityFilterSchema>;
