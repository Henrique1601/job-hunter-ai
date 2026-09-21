import { describe, expect, it } from "vitest";

import { decideApplicationState } from "./application-policy";

describe("decideApplicationState", () => {
  it("mantém em revisão uma candidatura que exige ação humana", () => {
    expect(
      decideApplicationState({
        matchScore: 92,
        requiresHumanReview: true,
        alreadyApplied: false,
      }),
    ).toEqual({ status: "REVIEW_REQUIRED", reason: "HUMAN_ACTION_REQUIRED" });
  });

  it("bloqueia uma candidatura duplicada antes de entrar no pipeline", () => {
    expect(
      decideApplicationState({
        matchScore: 96,
        requiresHumanReview: false,
        alreadyApplied: true,
      }),
    ).toEqual({ status: "BLOCKED", reason: "DUPLICATE_APPLICATION" });
  });
});
