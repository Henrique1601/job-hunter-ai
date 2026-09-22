"use server";

import { revalidatePath } from "next/cache";

import { matchJob } from "@/domain/job-matcher";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { PrismaApplicationRepository } from "@/repositories/prisma-application-repository";
import { prepareApplication } from "@/services/prepare-application";
import { sendWebhookNotification } from "@/services/notification-service";
import type { ApplicationStatus } from "@/generated/prisma/enums";

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

export async function updateApplicationStatusAction(
  applicationId: string,
  newStatus: ApplicationStatus,
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();

    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId: user.id },
    });

    if (!application) {
      return { success: false, message: "Candidatura não encontrada." };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        appliedAt: newStatus === "APPLIED" ? new Date() : application.appliedAt,
      },
    });

    if (newStatus === "INTERVIEW") {
      const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });
      if (settings?.webhookUrl) {
        const job = await prisma.job.findUnique({ where: { id: application.jobId } });
        sendWebhookNotification(settings.webhookUrl, {
          title: "🎉 Candidatura Avançou para Entrevista!",
          description: `Parabéns! Sua candidatura para ${job?.title ?? "Vaga"} na ${job?.company ?? "Empresa"} avançou para a fase de Entrevista.`,
          score: application.matchScore,
        }).catch(() => {});
      }
    }

    revalidatePath("/candidaturas");
    revalidatePath("/");
    revalidatePath("/vagas");

    return { success: true, message: `Status atualizado para ${newStatus} com sucesso!` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao atualizar status.",
    };
  }
}

export async function deleteApplicationAction(
  applicationId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();

    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId: user.id },
    });

    if (!application) {
      return { success: false, message: "Candidatura não encontrada." };
    }

    await prisma.application.delete({
      where: { id: applicationId },
    });

    revalidatePath("/candidaturas");
    revalidatePath("/");
    revalidatePath("/vagas");

    return { success: true, message: "Candidatura removida do pipeline." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao remover candidatura.",
    };
  }
}
