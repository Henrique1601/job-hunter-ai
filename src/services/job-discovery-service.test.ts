import { describe, expect, it } from "vitest";

import type { JobDiscoveryConnector } from "@/connectors/types";
import type {
  ApplicationRecord,
  ApplicationRepository,
  JobRecord,
  JobRepository,
  ProfileRepository,
} from "@/repositories/contracts";
import type { JobInput, ProfileInput } from "@/lib/validation";
import { JobDiscoveryService } from "./job-discovery-service";

class InMemoryJobRepo implements JobRepository {
  public jobs: JobRecord[] = [];

  async findByCanonicalUrl(canonicalUrl: string): Promise<JobRecord | null> {
    return this.jobs.find((j) => j.canonicalUrl === canonicalUrl) ?? null;
  }

  async save(job: JobInput): Promise<JobRecord> {
    const idx = this.jobs.findIndex((j) => j.canonicalUrl === job.canonicalUrl);
    const record: JobRecord = { ...job, id: `job-${this.jobs.length + 1}` };
    if (idx >= 0) {
      this.jobs[idx] = record;
    } else {
      this.jobs.push(record);
    }
    return record;
  }
}

class InMemoryAppRepo implements ApplicationRepository {
  public apps: ApplicationRecord[] = [];

  async existsForUserAndJob(userId: string, jobId: string): Promise<boolean> {
    return this.apps.some((a) => a.userId === userId && a.jobId === jobId);
  }

  async create(application: ApplicationRecord): Promise<void> {
    this.apps.push(application);
  }

  async listForUser(userId: string): Promise<ApplicationRecord[]> {
    return this.apps.filter((a) => a.userId === userId);
  }
}

class InMemoryProfileRepo implements ProfileRepository {
  constructor(private profile: ProfileInput | null) {}

  async findByUserId(): Promise<ProfileInput | null> {
    return this.profile;
  }

  async save(_userId: string, profile: ProfileInput): Promise<void> {
    this.profile = profile;
  }
}

describe("JobDiscoveryService", () => {
  const mockConnector: JobDiscoveryConnector = {
    name: "Mock Tech Connector",
    sourceId: "mock-source",
    async discover(): Promise<JobInput[]> {
      return [
        {
          source: "mock-source",
          externalId: "job-1",
          canonicalUrl: "https://example.com/jobs/1",
          title: "Desenvolvedor Full Stack Júnior",
          company: "Empresa Inovadora",
          description: "Desenvolver novas features usando TypeScript, React e Node.js com qualidade.",
          location: "São Paulo, SP",
          workMode: "REMOTE",
          seniority: "JUNIOR",
          requiredSkills: ["TypeScript", "React", "Node.js"],
          optionalSkills: ["PostgreSQL"],
          requiresHumanReview: true,
        },
      ];
    },
  };

  it("descobre novas vagas e persiste com sucesso", async () => {
    const jobRepo = new InMemoryJobRepo();
    const appRepo = new InMemoryAppRepo();
    const profileRepo = new InMemoryProfileRepo({
      targetRoles: ["Desenvolvedor Full Stack"],
      skills: ["TypeScript", "React", "Node.js"],
      seniority: "JUNIOR",
      workModes: ["REMOTE"],
      locations: ["São Paulo, SP"],
    });

    const service = new JobDiscoveryService({
      connectors: [mockConnector],
      jobRepository: jobRepo,
      applicationRepository: appRepo,
      profileRepository: profileRepo,
    });

    const reports = await service.runDiscovery({ seniority: "JUNIOR" }, "user-123");

    expect(reports).toHaveLength(1);
    expect(reports[0].discovered).toBe(1);
    expect(reports[0].newJobsPersisted).toBe(1);
    expect(reports[0].matchedApplicationsPrepared).toBe(1);
    expect(jobRepo.jobs).toHaveLength(1);
  });

  it("não duplica vagas já persistidas em execuções subsequentes", async () => {
    const jobRepo = new InMemoryJobRepo();
    const service = new JobDiscoveryService({
      connectors: [mockConnector],
      jobRepository: jobRepo,
    });

    // Primeira execução
    await service.runDiscovery({});
    expect(jobRepo.jobs).toHaveLength(1);

    // Segunda execução idempotente
    const reportsSecondRun = await service.runDiscovery({});
    expect(reportsSecondRun[0].newJobsPersisted).toBe(0);
    expect(jobRepo.jobs).toHaveLength(1);
  });
});
