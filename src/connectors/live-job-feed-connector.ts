import type { JobInput } from "@/lib/validation";
import type { JobDiscoveryConnector, SearchCriteria } from "./types";

interface RemotiveJobRaw {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  tags?: string[];
  job_type?: string;
  publication_date: string;
  candidate_required_location?: string;
  salary?: string;
  description: string;
}

export class LiveJobFeedConnector implements JobDiscoveryConnector {
  readonly name = "Remotive Public API Connector";
  readonly sourceId = "remotive-api";

  private extractSkills(text: string, tags: string[] = []): string[] {
    const knownTech = [
      "TypeScript",
      "JavaScript",
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Python",
      "Docker",
      "AWS",
      "GraphQL",
      "Tailwind",
      "Vue",
      "Java",
      "Go",
      "Rust",
    ];

    const found = new Set<string>();
    const lowerContent = `${text} ${tags.join(" ")}`.toLowerCase();

    for (const tech of knownTech) {
      if (lowerContent.includes(tech.toLowerCase())) {
        found.add(tech);
      }
    }

    if (found.size === 0) {
      found.add("TypeScript");
      found.add("React");
    }

    return Array.from(found);
  }

  private extractSeniority(title: string): "INTERN" | "JUNIOR" | "MID" | "SENIOR" {
    const lower = title.toLowerCase();
    if (lower.includes("intern") || lower.includes("estag") || lower.includes("estág")) {
      return "INTERN";
    }
    if (lower.includes("senior") || lower.includes("sr") || lower.includes("lead")) {
      return "SENIOR";
    }
    if (lower.includes("junior") || lower.includes("jr") || lower.includes("entry")) {
      return "JUNIOR";
    }
    return "MID";
  }

  async discover(criteria: SearchCriteria): Promise<JobInput[]> {
    const url = "https://remotive.com/api/remote-jobs?category=software-dev&limit=8";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "JobHunterAI/1.0 (+https://github.com/Henrique1601/job-hunter-ai)",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Status ${response.status} ao consultar Remotive API.`);
      }

      const data = (await response.json()) as { jobs?: RemotiveJobRaw[] };
      const rawJobs = data.jobs || [];

      const parsedJobs: JobInput[] = [];

      for (const item of rawJobs) {
        const skills = this.extractSkills(item.description, item.tags);
        const seniority = this.extractSeniority(item.title);

        const cleanDescription = item.description
          .replace(/<[^>]*>?/gm, " ")
          .replace(/\s+/g, " ")
          .trim();

        parsedJobs.push({
          source: this.sourceId,
          externalId: `remotive-${item.id}`,
          canonicalUrl: item.url,
          title: item.title,
          company: item.company_name,
          description: cleanDescription.slice(0, 1000) || "Oportunidade remota em desenvolvimento de software.",
          location: item.candidate_required_location || "Remoto Global",
          workMode: "REMOTE",
          seniority,
          requiredSkills: skills.slice(0, 4),
          optionalSkills: skills.slice(4, 7),
          requiresHumanReview: true,
        });
      }

      let filtered = parsedJobs;
      if (criteria.seniority) {
        filtered = filtered.filter((j) => j.seniority === criteria.seniority);
      }
      if (criteria.limit && criteria.limit > 0) {
        filtered = filtered.slice(0, criteria.limit);
      }

      return filtered;
    } catch {
      // Retorna vazio caso ocorra timeout ou offline na máquina local
      return [];
    }
  }
}
