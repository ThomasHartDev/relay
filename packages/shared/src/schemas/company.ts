import { z } from "zod";

export const COMPANY_SIZES = ["STARTUP", "SMALL", "MEDIUM", "ENTERPRISE"] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

export const companySizeSchema = z.enum(COMPANY_SIZES);

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(200),
  domain: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  size: companySizeSchema.optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export const companyFilterSchema = z.object({
  search: z.string().optional(),
  size: companySizeSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanyFilter = z.infer<typeof companyFilterSchema>;
