export type PipelineStatus =
  | "DISCOVERED"
  | "MATCHED"
  | "REVIEW_REQUIRED"
  | "READY"
  | "APPLIED"
  | "INTERVIEW"
  | "REJECTED"
  | "OFFER";

export type ApplicationDecision =
  | {
      status: PipelineStatus;
      reason: "HUMAN_ACTION_REQUIRED" | "HIGH_MATCH" | "LOW_MATCH";
    }
  | { status: "BLOCKED"; reason: "DUPLICATE_APPLICATION" };

export function decideApplicationState(input: {
  matchScore: number;
  requiresHumanReview: boolean;
  alreadyApplied: boolean;
}): ApplicationDecision {
  if (input.alreadyApplied) {
    return { status: "BLOCKED", reason: "DUPLICATE_APPLICATION" };
  }

  if (input.requiresHumanReview) {
    return { status: "REVIEW_REQUIRED", reason: "HUMAN_ACTION_REQUIRED" };
  }

  if (input.matchScore >= 75) {
    return { status: "READY", reason: "HIGH_MATCH" };
  }

  return { status: "MATCHED", reason: "LOW_MATCH" };
}
