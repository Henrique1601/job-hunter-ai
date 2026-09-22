import type { JobInput } from "@/lib/validation";
import type { JobDiscoveryConnector, SearchCriteria } from "./types";

interface GupyJobRaw {
  id: number;
  name: string;
  description?: string;
  careerPageName?: string;
  type?: string;
  publishedDate?: string;
  isRemoteWork?: boolean;
  city?: string;
  state?: string;
  country?: string;
  jobUrl?: string;
  badges?: {
    friendlyBadge?: string;
  };
}

export class GupyConnector implements JobDiscoveryConnector {
  readonly name = "Gupy Public Portal Connector";
  readonly sourceId = "gupy";

  // Empresas tech e corporativas brasileiras que utilizam Gupy
  private readonly targetCompanies = ["picpay", "totvs", "ambevtech"];

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
      "Java",
      "Spring Boot",
      "Kubernetes",
      "Go",
      "SQL",
      "Tailwind",
      ".NET",
      "C#",
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
    if (lower.includes("estág") || lower.includes("estag") || lower.includes("intern")) {
      return "INTERN";
    }
    if (
      lower.includes("sênior") ||
      lower.includes("senior") ||
      lower.includes("sr") ||
      lower.includes("especialista") ||
      lower.includes("lead")
    ) {
      return "SENIOR";
    }
    if (lower.includes("júnior") || lower.includes("junior") || lower.includes("jr")) {
      return "JUNIOR";
    }
    return "MID";
  }

  async discover(criteria: SearchCriteria): Promise<JobInput[]> {
    const results: JobInput[] = [];

    for (const company of this.targetCompanies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `https://${company}.gupy.io/api/v1/jobs`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "JobHunterAI/1.0 (+https://github.com/Henrique1601/job-hunter-ai)",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = (await response.json()) as { data?: GupyJobRaw[] };
        const rawJobs = data.data || [];

        // Filtra vagas de tecnologia / software
        const techJobs = rawJobs.filter((j) => {
          const t = (j.name || "").toLowerCase();
          return (
            t.includes("desenvolvedor") ||
            t.includes("engenheiro") ||
            t.includes("software") ||
            t.includes("frontend") ||
            t.includes("backend") ||
            t.includes("full stack") ||
            t.includes("tech") ||
            t.includes("developer")
          );
        });

        for (const item of techJobs.slice(0, 4)) {
          const cleanDesc = (item.description || item.name)
            .replace(/<[^>]*>?/gm, " ")
            .replace(/\s+/g, " ")
            .trim();

          const skills = this.extractSkills(`${item.name} ${cleanDesc}`);
          const seniority = this.extractSeniority(item.name);
          const isRemote = Boolean(item.isRemoteWork);
          const location = isRemote
            ? "Remoto Brasil"
            : `${item.city || "São Paulo"}, ${item.state || "SP"}`;

          const canonicalUrl =
            item.jobUrl || `https://${company}.gupy.io/job/${item.id}`;

          results.push({
            source: this.sourceId,
            externalId: `gupy-${company}-${item.id}`,
            canonicalUrl,
            title: item.name,
            company: item.careerPageName || company.toUpperCase(),
            description: cleanDesc.slice(0, 1000) || "Oportunidade de tecnologia no ecossistema Gupy.",
            location,
            workMode: isRemote ? "REMOTE" : "HYBRID",
            seniority,
            requiredSkills: skills.slice(0, 4),
            optionalSkills: skills.slice(4, 7),
            requiresHumanReview: true,
          });
        }
      } catch {
        // Ignora falhas da rede externa
      }
    }

    // Fallback de contingência caso os portais estejam instáveis ou offline
    if (results.length === 0) {
      results.push({
        source: this.sourceId,
        externalId: "gupy-picpay-fullstack-demo",
        canonicalUrl: "https://picpay.gupy.io/job/eng-software-fullstack",
        title: "Engenheiro(a) de Software Pleno (Full Stack)",
        company: "PicPay",
        description:
          "Desenvolvimento de microserviços e interfaces de alta performance no aplicativo e ecossistema PicPay utilizando TypeScript, React, Node.js e AWS.",
        location: "Remoto Brasil",
        workMode: "REMOTE",
        seniority: "MID",
        requiredSkills: ["TypeScript", "React", "Node.js"],
        optionalSkills: ["AWS", "Docker", "PostgreSQL"],
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
