"use server";

import { revalidatePath } from "next/cache";

import { LiveJobFeedConnector } from "@/connectors/live-job-feed-connector";
import { RemoteTechFeedConnector } from "@/connectors/remote-tech-feed-connector";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { PrismaApplicationRepository } from "@/repositories/prisma-application-repository";
import { PrismaJobRepository } from "@/repositories/prisma-job-repository";
import { PrismaProfileRepository } from "@/repositories/prisma-profile-repository";
import { JobDiscoveryService } from "@/services/job-discovery-service";

export interface DiscoveryActionResult {
  success: boolean;
  message: string;
  totalDiscovered: number;
  newJobsPersisted: number;
  matchedApplicationsPrepared: number;
}

export async function triggerDiscoveryAction(): Promise<DiscoveryActionResult> {
  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();

    const jobRepository = new PrismaJobRepository(prisma);
    const applicationRepository = new PrismaApplicationRepository(prisma);
    const profileRepository = new PrismaProfileRepository(prisma);

    const connectors = [
      new LiveJobFeedConnector(),
      new RemoteTechFeedConnector(),
    ];

    const discoveryService = new JobDiscoveryService({
      connectors,
      jobRepository,
      applicationRepository,
      profileRepository,
    });

    const reports = await discoveryService.runDiscovery({}, user.id);

    const totalDiscovered = reports.reduce((acc, r) => acc + r.discovered, 0);
    const newJobsPersisted = reports.reduce((acc, r) => acc + r.newJobsPersisted, 0);
    const matchedApplicationsPrepared = reports.reduce(
      (acc, r) => acc + r.matchedApplicationsPrepared,
      0,
    );

    revalidatePath("/");
    revalidatePath("/vagas");
    revalidatePath("/candidaturas");

    return {
      success: true,
      message: `Varredura concluída! ${newJobsPersisted} novas vagas adicionadas ao catálogo (${matchedApplicationsPrepared} candidaturas iniciadas).`,
      totalDiscovered,
      newJobsPersisted,
      matchedApplicationsPrepared,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao executar a varredura.",
      totalDiscovered: 0,
      newJobsPersisted: 0,
      matchedApplicationsPrepared: 0,
    };
  }
}
