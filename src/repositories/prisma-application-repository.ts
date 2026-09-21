import type { PrismaClient } from "@/generated/prisma/client";

import type {
  ApplicationRecord,
  ApplicationRepository,
} from "./contracts";

export class PrismaApplicationRepository implements ApplicationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async existsForUserAndJob(userId: string, jobId: string) {
    const application = await this.prisma.application.findUnique({
      where: { userId_jobId: { userId, jobId } },
      select: { id: true },
    });

    return application !== null;
  }

  async create(application: ApplicationRecord): Promise<void> {
    await this.prisma.application.create({
      data: {
        userId: application.userId,
        jobId: application.jobId,
        resumeId: application.resumeId,
        matchScore: application.matchScore,
        matchStrengths: application.matchStrengths ?? [],
        matchGaps: application.matchGaps ?? [],
        status: application.status,
      },
    });
  }

  async listForUser(userId: string): Promise<ApplicationRecord[]> {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return applications.map((application) => ({
      userId: application.userId,
      jobId: application.jobId,
      resumeId: application.resumeId ?? undefined,
      matchScore: application.matchScore,
      matchStrengths: application.matchStrengths,
      matchGaps: application.matchGaps,
      status: application.status,
    }));
  }
}
