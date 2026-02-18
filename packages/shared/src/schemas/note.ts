import { z } from "zod";

export const createNoteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(10000),
  pinned: z.boolean().optional().default(false),
  contactId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  dealId: z.string().cuid().optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
