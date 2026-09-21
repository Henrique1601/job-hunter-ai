import { z } from "zod";

export const profileInputSchema = z.object({
  targetRoles: z.array(z.string().trim().min(2)).min(1),
  skills: z.array(z.string().trim().min(1)).min(1),
  seniority: z.enum(["INTERN", "JUNIOR", "MID", "SENIOR"]),
  workModes: z.array(z.enum(["REMOTE", "HYBRID", "ONSITE"])).min(1),
  locations: z.array(z.string().trim().min(2)).min(1),
  minimumSalary: z.number().int().positive().optional(),
});

export const jobInputSchema = z.object({
  source: z.string().trim().min(2),
  externalId: z.string().trim().min(1),
  canonicalUrl: z.url(),
  title: z.string().trim().min(3),
  company: z.string().trim().min(2),
  description: z.string().trim().min(20),
  location: z.string().trim().min(2),
  workMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
  seniority: z.enum(["INTERN", "JUNIOR", "MID", "SENIOR"]),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  requiredSkills: z.array(z.string().trim().min(1)),
  optionalSkills: z.array(z.string().trim().min(1)),
  requiresHumanReview: z.boolean().default(true),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type JobInput = z.infer<typeof jobInputSchema>;
