import { NextResponse, type NextRequest } from "next/server";

import { getAllConnectors } from "@/connectors/registry";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { PrismaApplicationRepository } from "@/repositories/prisma-application-repository";
import { PrismaJobRepository } from "@/repositories/prisma-job-repository";
import { PrismaProfileRepository } from "@/repositories/prisma-profile-repository";
import { JobDiscoveryService } from "@/services/job-discovery-service";

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();

    const jobRepository = new PrismaJobRepository(prisma);
    const applicationRepository = new PrismaApplicationRepository(prisma);
    const profileRepository = new PrismaProfileRepository(prisma);

    const connectors = getAllConnectors();

    const discoveryService = new JobDiscoveryService({
      connectors,
      jobRepository,
      applicationRepository,
      profileRepository,
    });

    const reports = await discoveryService.runDiscovery({}, user.id);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      reports,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro na execução do Cron",
      },
      { status: 500 },
    );
  }
}
