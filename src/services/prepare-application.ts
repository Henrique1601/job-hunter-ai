import {
  decideApplicationState,
  type ApplicationDecision,
} from "@/domain/application-policy";
import type { ApplicationRepository } from "@/repositories/contracts";

export interface PrepareApplicationInput {
  userId: string;
  jobId: string;
  matchScore: number;
  requiresHumanReview: boolean;
  matchStrengths?: string[];
  matchGaps?: string[];
  resumeId?: string;
}

export async function prepareApplication(
  input: PrepareApplicationInput,
  repository: ApplicationRepository,
): Promise<ApplicationDecision> {
  const alreadyApplied = await repository.existsForUserAndJob(
    input.userId,
    input.jobId,
  );
  const decision = decideApplicationState({
    matchScore: input.matchScore,
    requiresHumanReview: input.requiresHumanReview,
    alreadyApplied,
  });

  if (decision.status === "BLOCKED") {
    return decision;
  }

  await repository.create({
    userId: input.userId,
    jobId: input.jobId,
    resumeId: input.resumeId,
    matchScore: input.matchScore,
    matchStrengths: input.matchStrengths,
    matchGaps: input.matchGaps,
    status: decision.status,
  });

  return decision;
}
