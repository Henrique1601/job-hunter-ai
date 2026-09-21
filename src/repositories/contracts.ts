import type { PipelineStatus } from "@/domain/application-policy";
import type { JobInput, ProfileInput } from "@/lib/validation";

export interface ApplicationRecord {
  userId: string;
  jobId: string;
  matchScore: number;
  status: PipelineStatus;
  matchStrengths?: string[];
  matchGaps?: string[];
  resumeId?: string;
}

export interface ProfileRepository {
  findByUserId(userId: string): Promise<ProfileInput | null>;
  save(userId: string, profile: ProfileInput): Promise<void>;
}

export interface JobRepository {
  findByCanonicalUrl(canonicalUrl: string): Promise<JobInput | null>;
  save(job: JobInput): Promise<void>;
}

export interface ApplicationRepository {
  existsForUserAndJob(userId: string, jobId: string): Promise<boolean>;
  create(application: ApplicationRecord): Promise<void>;
  listForUser(userId: string): Promise<ApplicationRecord[]>;
}
