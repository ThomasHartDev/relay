import { z } from "zod";

export const createNoteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(10000),
  pinned: z.boolean().optional().default(false),
  contactId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  dealId: z.string().cuid().optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const noteFilterSchema = z.object({
  search: z.string().optional(),
  contactId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  dealId: z.string().cuid().optional(),
  pinned: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NoteFilter = z.infer<typeof noteFilterSchema>;
