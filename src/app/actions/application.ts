"use server";

import { revalidatePath } from "next/cache";

import { matchJob } from "@/domain/job-matcher";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { PrismaApplicationRepository } from "@/repositories/prisma-application-repository";
import { prepareApplication } from "@/services/prepare-application";

export interface PrepareApplicationActionResult {
  success: boolean;
  status?: string;
  message: string;
}

export async function prepareApplicationAction(
  jobExternalId: string,
): Promise<PrepareApplicationActionResult> {
  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    if (!dbUser?.profile) {
      return {
        success: false,
        message: "Perfil não encontrado. Complete suas preferências antes de se candidatar.",
      };
    }

    const job = await prisma.job.findFirst({
      where: { externalId: jobExternalId },
    });

    if (!job) {
      return {
        success: false,
        message: "Vaga não encontrada no catálogo.",
      };
    }

    const match = matchJob(
      {
        targetRoles: dbUser.profile.targetRoles,
        skills: dbUser.profile.skills,
        seniority: dbUser.profile.seniority,
        workModes: dbUser.profile.workModes,
        locations: dbUser.profile.locations,
        minimumSalary: dbUser.profile.minimumSalary ?? undefined,
      },
      {
        title: job.title,
        requiredSkills: job.requiredSkills,
        optionalSkills: job.optionalSkills,
        seniority: job.seniority,
        workMode: job.workMode,
        location: job.location,
        salaryMin: job.salaryMin ?? undefined,
      },
    );

    const applicationRepository = new PrismaApplicationRepository(prisma);

    const decision = await prepareApplication(
      {
        userId: dbUser.id,
        jobId: job.id,
        matchScore: match.score,
        requiresHumanReview: job.requiresHumanReview,
        matchStrengths: match.strengths,
        matchGaps: match.gaps,
      },
      applicationRepository,
    );

    revalidatePath("/vagas");
    revalidatePath(`/vagas/${jobExternalId}`);
    revalidatePath("/candidaturas");
    revalidatePath("/");

    if (decision.status === "BLOCKED") {
      return {
        success: false,
        status: "BLOCKED",
        message: "Esta vaga já foi adicionada ao seu pipeline anteriormente.",
      };
    }

    return {
      success: true,
      status: decision.status,
      message:
        decision.status === "REVIEW_REQUIRED"
          ? "Candidatura preparada! Esta vaga exige sua revisão antes do envio."
          : "Candidatura pronta e adicionada ao seu pipeline com sucesso!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao preparar candidatura.",
    };
  }
}
