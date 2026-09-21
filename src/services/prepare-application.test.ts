import { describe, expect, it } from "vitest";

import type {
  ApplicationRecord,
  ApplicationRepository,
} from "@/repositories/contracts";
import { prepareApplication } from "./prepare-application";

class InMemoryApplications implements ApplicationRepository {
  private readonly records: ApplicationRecord[];

  constructor(initial: ApplicationRecord[] = []) {
    this.records = [...initial];
  }

  async existsForUserAndJob(userId: string, jobId: string) {
    return this.records.some(
      (record) => record.userId === userId && record.jobId === jobId,
    );
  }

  async create(application: ApplicationRecord) {
    this.records.push(application);
  }

  async listForUser(userId: string) {
    return this.records.filter((record) => record.userId === userId);
  }
}

describe("prepareApplication", () => {
  it("não cria uma segunda candidatura para a mesma vaga", async () => {
    const repository = new InMemoryApplications([
      {
        userId: "user-1",
        jobId: "job-1",
        matchScore: 88,
        status: "APPLIED",
      },
    ]);

    const decision = await prepareApplication(
      {
        userId: "user-1",
        jobId: "job-1",
        matchScore: 94,
        requiresHumanReview: false,
      },
      repository,
    );

    expect(decision).toEqual({
      status: "BLOCKED",
      reason: "DUPLICATE_APPLICATION",
    });
    expect(await repository.listForUser("user-1")).toHaveLength(1);
  });
});
