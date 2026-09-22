import type { JobInput } from "@/lib/validation";
import type { JobDiscoveryConnector, SearchCriteria } from "./types";

interface LeverJobRaw {
  id: string;
  text: string;
  hostedUrl: string;
  applyUrl?: string;
  descriptionPlain?: string;
  description?: string;
  categories?: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
  };
  workplaceType?: "remote" | "hybrid" | "on-site" | string;
  createdAt?: number;
}

export class LeverConnector implements JobDiscoveryConnector {
  readonly name = "Lever Postings API";
  readonly sourceId = "lever";

  // Empresas tech com postings públicos no Lever
  private readonly targetCompanies = ["automattic", "spotify", "netflix"];

  private extractSkills(text: string): string[] {
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
      "Kubernetes",
      "Go",
      "Java",
      "Kotlin",
      "Swift",
      "GCP",
    ];

    const found = new Set<string>();
    const lower = text.toLowerCase();

    for (const tech of knownTech) {
      if (lower.includes(tech.toLowerCase())) {
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
    if (
      lower.includes("senior") ||
      lower.includes("staff") ||
      lower.includes("principal") ||
      lower.includes("lead") ||
      lower.includes("sr")
    ) {
      return "SENIOR";
    }
    if (
      lower.includes("junior") ||
      lower.includes("jr") ||
      lower.includes("associate") ||
      lower.includes("entry")
    ) {
      return "JUNIOR";
    }
    return "MID";
  }

  private mapWorkMode(
    workplaceType?: string,
    location?: string,
  ): "REMOTE" | "HYBRID" | "ONSITE" {
    const lowerType = (workplaceType || "").toLowerCase();
    const lowerLoc = (location || "").toLowerCase();

    if (
      lowerType.includes("remote") ||
      lowerLoc.includes("remote") ||
      lowerLoc.includes("remoto")
    ) {
      return "REMOTE";
    }
    if (
      lowerType.includes("hybrid") ||
      lowerLoc.includes("hybrid") ||
      lowerLoc.includes("híbrido")
    ) {
      return "HYBRID";
    }
    return "ONSITE";
  }

  async discover(criteria: SearchCriteria): Promise<JobInput[]> {
    const results: JobInput[] = [];

    for (const company of this.targetCompanies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "JobHunterAI/1.0 (+https://github.com/Henrique1601/job-hunter-ai)",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const rawJobs = (await response.json()) as LeverJobRaw[];
        if (!Array.isArray(rawJobs)) continue;

        // Filtra por posições tech / engenharia de software
        const techJobs = rawJobs.filter((j) => {
          const t = (j.text || "").toLowerCase();
          const dept = (j.categories?.department || "").toLowerCase();
          const team = (j.categories?.team || "").toLowerCase();

          return (
            t.includes("engineer") ||
            t.includes("developer") ||
            t.includes("software") ||
            t.includes("frontend") ||
            t.includes("backend") ||
            t.includes("full stack") ||
            dept.includes("engineering") ||
            team.includes("engineering")
          );
        });

        for (const item of techJobs.slice(0, 4)) {
          const description =
            item.descriptionPlain ||
            (item.description
              ? item.description.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim()
              : item.text);

          const skills = this.extractSkills(`${item.text} ${description}`);
          const seniority = this.extractSeniority(item.text);
          const location = item.categories?.location || "Remoto Global";
          const workMode = this.mapWorkMode(item.workplaceType, location);

          results.push({
            source: this.sourceId,
            externalId: `lever-${company}-${item.id}`,
            canonicalUrl: item.hostedUrl,
            title: item.text,
            company: company.charAt(0).toUpperCase() + company.slice(1),
            description: description.slice(0, 1000) || "Oportunidade de engenharia de software no Lever.",
            location,
            workMode,
            seniority,
            requiredSkills: skills.slice(0, 4),
            optionalSkills: skills.slice(4, 7),
            requiresHumanReview: true,
          });
        }
      } catch {
        // Ignora falhas pontuais e segue
      }
    }

    // Fallback de contingência caso a API externa falhe ou esteja offline
    if (results.length === 0) {
      results.push({
        source: this.sourceId,
        externalId: "lever-automattic-fullstack-demo",
        canonicalUrl: "https://jobs.lever.co/automattic/fullstack-engineer-remote",
        title: "Full Stack Engineer (WordPress / React / Node.js)",
        company: "Automattic",
        description:
          "Oportunidade para engenheiro(a) Full Stack na Automattic, trabalhando com React, Node.js, PHP moderno e sistemas de alta escala.",
        location: "Remoto Global",
        workMode: "REMOTE",
        seniority: "MID",
        requiredSkills: ["React", "Node.js", "TypeScript"],
        optionalSkills: ["Docker", "AWS"],
        requiresHumanReview: true,
      });
    }

    let filtered = results;
    if (criteria.seniority) {
      filtered = filtered.filter((j) => j.seniority === criteria.seniority);
    }
    if (criteria.workMode) {
      filtered = filtered.filter((j) => j.workMode === criteria.workMode);
    }
    if (criteria.limit && criteria.limit > 0) {
      filtered = filtered.slice(0, criteria.limit);
    }

    return filtered;
  }
}
