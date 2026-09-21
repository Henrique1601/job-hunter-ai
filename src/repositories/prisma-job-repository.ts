import type { PrismaClient } from "@/generated/prisma/client";
import type { JobInput } from "@/lib/validation";

import type { JobRepository } from "./contracts";

export class PrismaJobRepository implements JobRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCanonicalUrl(canonicalUrl: string): Promise<JobInput | null> {
    const job = await this.prisma.job.findUnique({ where: { canonicalUrl } });

    if (!job) return null;

    return {
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

  async save(job: JobInput): Promise<void> {
    await this.prisma.job.upsert({
      where: { canonicalUrl: job.canonicalUrl },
      create: job,
      update: job,
    });
  }
}
