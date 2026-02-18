import { z } from "zod";

export const CONTACT_STATUSES = ["LEAD", "PROSPECT", "CUSTOMER", "CHURNED", "ARCHIVED"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const contactStatusSchema = z.enum(CONTACT_STATUSES);

export const createContactSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().max(30).optional(),
  title: z.string().max(200).optional(),
  status: contactStatusSchema.optional().default("LEAD"),
  companyId: z.string().cuid().optional(),
  ownerId: z.string().cuid().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const contactFilterSchema = z.object({
  search: z.string().optional(),
  status: contactStatusSchema.optional(),
  companyId: z.string().cuid().optional(),
  ownerId: z.string().cuid().optional(),
  tagId: z.string().cuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  sortBy: z.enum(["firstName", "lastName", "email", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactFilter = z.infer<typeof contactFilterSchema>;
