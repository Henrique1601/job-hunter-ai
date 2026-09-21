import type { ProfileInput } from "@/lib/validation";
import type { PrismaClient } from "@/generated/prisma/client";

import type { ProfileRepository } from "./contracts";

export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<ProfileInput | null> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    if (!profile) return null;

    return {
      targetRoles: profile.targetRoles,
      skills: profile.skills,
      seniority: profile.seniority,
      workModes: profile.workModes,
      locations: profile.locations,
      minimumSalary: profile.minimumSalary ?? undefined,
    };
  }

  async save(userId: string, profile: ProfileInput): Promise<void> {
    await this.prisma.profile.upsert({
      where: { userId },
      create: { userId, ...profile },
      update: profile,
    });
  }
}
