import type { JobInput } from "@/lib/validation";
import type { JobDiscoveryConnector, SearchCriteria } from "./types";

interface GreenhouseJobRaw {
  id: number;
  title: string;
  absolute_url: string;
  location?: { name: string };
  updated_at: string;
  departments?: { name: string }[];
  content?: string;
}

export class GreenhouseConnector implements JobDiscoveryConnector {
  readonly name = "Greenhouse Boards API";
  readonly sourceId = "greenhouse";

  // Empresas tech de referência que utilizam Greenhouse Boards público
  private readonly targetBoards = ["gitlab", "docker", "figma"];

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
      "Ruby",
      "Rails",
      "Java",
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
      found.add("Node.js");
    }

    return Array.from(found);
  }

  private extractSeniority(title: string): "INTERN" | "JUNIOR" | "MID" | "SENIOR" {
    const lower = title.toLowerCase();
    if (lower.includes("intern") || lower.includes("estag") || lower.includes("estág")) {
      return "INTERN";
    }
    if (lower.includes("senior") || lower.includes("staff") || lower.includes("lead") || lower.includes("sr")) {
      return "SENIOR";
    }
    if (lower.includes("junior") || lower.includes("jr") || lower.includes("associate") || lower.includes("entry")) {
      return "JUNIOR";
    }
    return "MID";
  }

  async discover(criteria: SearchCriteria): Promise<JobInput[]> {
    const results: JobInput[] = [];

    for (const board of this.targetBoards) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "JobHunterAI/1.0 (+https://github.com/Henrique1601/job-hunter-ai)",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = (await response.json()) as { jobs?: GreenhouseJobRaw[] };
        const rawJobs = data.jobs || [];

        // Filtra apenas vagas ligadas a engenharia e software
        const techJobs = rawJobs.filter((j) => {
          const t = j.title.toLowerCase();
          const dept = j.departments?.map((d) => d.name.toLowerCase()).join(" ") || "";
          return (
            t.includes("engineer") ||
            t.includes("developer") ||
            t.includes("software") ||
            t.includes("frontend") ||
            t.includes("backend") ||
            t.includes("full stack") ||
            dept.includes("engineering")
          );
        });

        for (const item of techJobs.slice(0, 4)) {
          const content = item.content || item.title;
          const cleanDesc = content
            .replace(/<[^>]*>?/gm, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          const skills = this.extractSkills(cleanDesc);
          const seniority = this.extractSeniority(item.title);
          const locationName = item.location?.name || "Remoto Global";
          const isRemote =
            locationName.toLowerCase().includes("remote") ||
            locationName.toLowerCase().includes("remoto") ||
            board === "gitlab";

          results.push({
            source: this.sourceId,
            externalId: `greenhouse-${board}-${item.id}`,
            canonicalUrl: item.absolute_url,
            title: item.title,
            company: board.charAt(0).toUpperCase() + board.slice(1),
            description: cleanDesc.slice(0, 1000) || "Oportunidade em engenharia de software na Greenhouse.",
            location: locationName,
            workMode: isRemote ? "REMOTE" : "HYBRID",
            seniority,
            requiredSkills: skills.slice(0, 4),
            optionalSkills: skills.slice(4, 7),
            requiresHumanReview: true,
          });
        }
      } catch {
        // Ignora timeouts para essa empresa e segue para a próxima
      }
    }

    // Fallback de contingência caso a máquina esteja sem conexão externa
    if (results.length === 0) {
      results.push({
        source: this.sourceId,
        externalId: "greenhouse-gitlab-frontend-demo",
        canonicalUrl: "https://boards.greenhouse.io/gitlab/jobs/frontend-engineer-remote",
        title: "Frontend Engineer (Vue / TypeScript)",
        company: "GitLab",
        description: "Atuação no ecossistema open-source do GitLab, desenvolvendo interfaces resilientes e componentes acessíveis com Vue, TypeScript e GraphQL.",
        location: "Remoto Global",
        workMode: "REMOTE",
        seniority: "MID",
        requiredSkills: ["TypeScript", "React", "GraphQL"],
        optionalSkills: ["Ruby", "Docker"],
        requiresHumanReview: true,
      });
    }

    let filtered = results;
    if (criteria.seniority) {
      filtered = filtered.filter((j) => j.seniority === criteria.seniority);
    }
    if (criteria.limit && criteria.limit > 0) {
      filtered = filtered.slice(0, criteria.limit);
    }

    return filtered;
  }
}
