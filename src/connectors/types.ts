import type { JobInput } from "@/lib/validation";

export interface SearchCriteria {
  keywords?: string[];
  seniority?: "INTERN" | "JUNIOR" | "MID" | "SENIOR";
  workMode?: "REMOTE" | "HYBRID" | "ONSITE";
  limit?: number;
}

export interface JobDiscoveryConnector {
  readonly name: string;
  readonly sourceId: string;
  discover(criteria: SearchCriteria): Promise<JobInput[]>;
}
