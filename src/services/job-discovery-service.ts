import { matchJob } from "@/domain/job-matcher";
import { jobInputSchema } from "@/lib/validation";
import type { JobDiscoveryConnector, SearchCriteria } from "@/connectors/types";
import type { ApplicationRepository, JobRepository, ProfileRepository } from "@/repositories/contracts";
import { prepareApplication } from "./prepare-application";

export interface DiscoveryExecutionReport {
  connectorName: string;
  discovered: number;
  newJobsPersisted: number;
  matchedApplicationsPrepared: number;
}

export interface JobDiscoveryServiceDependencies {
  connectors: JobDiscoveryConnector[];
  jobRepository: JobRepository;
  applicationRepository?: ApplicationRepository;
  profileRepository?: ProfileRepository;
}

export class JobDiscoveryService {
  constructor(private readonly deps: JobDiscoveryServiceDependencies) {}

  async runDiscovery(
    criteria: SearchCriteria,
    userId?: string,
  ): Promise<DiscoveryExecutionReport[]> {
    const reports: DiscoveryExecutionReport[] = [];

    const profile = userId && this.deps.profileRepository
      ? await this.deps.profileRepository.findByUserId(userId)
      : null;

    for (const connector of this.deps.connectors) {
      let discoveredCount = 0;
      let persistedCount = 0;
      let applicationsCount = 0;

      const rawJobs = await connector.discover(criteria);
      discoveredCount = rawJobs.length;

      for (const rawJob of rawJobs) {
        const parsed = jobInputSchema.safeParse(rawJob);
        if (!parsed.success) {
          continue;
        }

        const validJob = parsed.data;

        let persistedJob = await this.deps.jobRepository.findByCanonicalUrl(validJob.canonicalUrl);
        if (!persistedJob) {
          persistedJob = await this.deps.jobRepository.save(validJob);
          persistedCount++;
        }

        if (userId && profile && this.deps.applicationRepository && persistedJob) {
          const match = matchJob(
            {
              targetRoles: profile.targetRoles,
              skills: profile.skills,
              seniority: profile.seniority,
              workModes: profile.workModes,
              locations: profile.locations,
              minimumSalary: profile.minimumSalary,
            },
            {
              title: validJob.title,
              requiredSkills: validJob.requiredSkills,
              optionalSkills: validJob.optionalSkills,
              seniority: validJob.seniority,
              workMode: validJob.workMode,
              location: validJob.location,
              salaryMin: validJob.salaryMin,
            },
          );

          if (match.score >= 70) {
            const decision = await prepareApplication(
              {
                userId,
                jobId: persistedJob.id,
                matchScore: match.score,
                requiresHumanReview: validJob.requiresHumanReview,
                matchStrengths: match.strengths,
                matchGaps: match.gaps,
              },
              this.deps.applicationRepository,
            );

            if (decision.status !== "BLOCKED") {
              applicationsCount++;
            }
          }
        }
      }

      reports.push({
        connectorName: connector.name,
        discovered: discoveredCount,
        newJobsPersisted: persistedCount,
        matchedApplicationsPrepared: applicationsCount,
      });
    }

    return reports;
  }
}
