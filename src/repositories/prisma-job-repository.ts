import type { PrismaClient } from "@/generated/prisma/client";
import type { JobInput } from "@/lib/validation";

import type { JobRecord, JobRepository } from "./contracts";

export class PrismaJobRepository implements JobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCanonicalUrl(canonicalUrl: string): Promise<JobRecord | null> {
    const job = await this.prisma.job.findUnique({ where: { canonicalUrl } });

    if (!job) return null;

    return {
      id: job.id,
      source: job.source,
      externalId: job.externalId,
      canonicalUrl: job.canonicalUrl,
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      workMode: job.workMode,
      seniority: job.seniority,
      salaryMin: job.salaryMin ?? undefined,
      salaryMax: job.salaryMax ?? undefined,
      requiredSkills: job.requiredSkills,
      optionalSkills: job.optionalSkills,
      requiresHumanReview: job.requiresHumanReview,
    };
  }

  async save(job: JobInput): Promise<JobRecord> {
    const saved = await this.prisma.job.upsert({
      where: { canonicalUrl: job.canonicalUrl },
      create: job,
      update: job,
    });

    return {
      id: saved.id,
      source: saved.source,
      externalId: saved.externalId,
      canonicalUrl: saved.canonicalUrl,
      title: saved.title,
      company: saved.company,
      description: saved.description,
      location: saved.location,
      workMode: saved.workMode,
      seniority: saved.seniority,
      salaryMin: saved.salaryMin ?? undefined,
      salaryMax: saved.salaryMax ?? undefined,
      requiredSkills: saved.requiredSkills,
      optionalSkills: saved.optionalSkills,
      requiresHumanReview: saved.requiresHumanReview,
    };
  }
}
