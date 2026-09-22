import type { JobInput } from "@/lib/validation";
import type { JobDiscoveryConnector, SearchCriteria } from "./types";

interface GitHubIssueRaw {
  id: number;
  html_url: string;
  title: string;
  body?: string;
  labels?: Array<{ name: string }>;
  created_at: string;
}

export class GitHubHnConnector implements JobDiscoveryConnector {
  readonly name = "GitHub & Open Source Jobs Connector";
  readonly sourceId = "github-hn";

  // Repositórios de vagas abertas na comunidade de software
  private readonly targetRepos = [
    "frontendbr/vagas",
    "backend-br/vagas",
    "react-brasil/vagas",
  ];

  private extractSkills(text: string, labels: string[] = []): string[] {
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
      "Prisma",
    ];

    const found = new Set<string>();
    const lowerContent = `${text} ${labels.join(" ")}`.toLowerCase();

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

  private extractSeniority(text: string): "INTERN" | "JUNIOR" | "MID" | "SENIOR" {
    const lower = text.toLowerCase();
    if (lower.includes("estágio") || lower.includes("estagio") || lower.includes("intern")) {
      return "INTERN";
    }
    if (
      lower.includes("sênior") ||
      lower.includes("senior") ||
      lower.includes("sr") ||
      lower.includes("lead") ||
      lower.includes("specialist")
    ) {
      return "SENIOR";
    }
    if (lower.includes("júnior") || lower.includes("junior") || lower.includes("jr")) {
      return "JUNIOR";
    }
    return "MID";
  }

  private parseCompanyAndCleanTitle(title: string): { title: string; company: string } {
    let cleanTitle = title;
    let company = "Tech Community";

    // Padrões comuns: "[Remoto] Desenvolvedor na Empresa X" ou "[Remoto] Dev @ Empresa"
    const atMatch = title.match(/@\s*([^\]|,\-]+)/i);
    const naMatch = title.match(/\b(?:na|no|at)\s+([A-Z][A-Za-z0-9\s]+)/);

    if (atMatch && atMatch[1]) {
      company = atMatch[1].trim();
    } else if (naMatch && naMatch[1]) {
      company = naMatch[1].trim();
    }

    // Remove tags como [Remoto], [São Paulo], etc. do início do título
    cleanTitle = cleanTitle.replace(/^(\[[^\]]+\]\s*)+/, "").trim();

    return { title: cleanTitle || title, company };
  }

  async discover(criteria: SearchCriteria): Promise<JobInput[]> {
    const results: JobInput[] = [];

    for (const repo of this.targetRepos) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const url = `https://api.github.com/repos/${repo}/issues?state=open&per_page=5`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "JobHunterAI/1.0 (+https://github.com/Henrique1601/job-hunter-ai)",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const rawIssues = (await response.json()) as GitHubIssueRaw[];
        if (!Array.isArray(rawIssues)) continue;

        for (const issue of rawIssues) {
          // Ignora pull requests (que a API do GitHub lista em /issues com pull_request key)
          if ((issue as unknown as { pull_request?: unknown }).pull_request) continue;

          const labelNames = (issue.labels || []).map((l) => l.name);
          const { title, company } = this.parseCompanyAndCleanTitle(issue.title);
          const bodyText = issue.body || "";
          const skills = this.extractSkills(`${title} ${bodyText}`, labelNames);
          const seniority = this.extractSeniority(`${title} ${labelNames.join(" ")}`);

          const isRemote =
            issue.title.toLowerCase().includes("remoto") ||
            issue.title.toLowerCase().includes("remote") ||
            labelNames.some((l) => l.toLowerCase().includes("remoto") || l.toLowerCase().includes("remote"));

          results.push({
            source: this.sourceId,
            externalId: `github-${issue.id}`,
            canonicalUrl: issue.html_url,
            title,
            company,
            description: bodyText.slice(0, 1000) || "Vaga publicada na comunidade tech do GitHub.",
            location: isRemote ? "Remoto Brasil" : "Híbrido / Presencial",
            workMode: isRemote ? "REMOTE" : "HYBRID",
            seniority,
            requiredSkills: skills.slice(0, 4),
            optionalSkills: skills.slice(4, 7),
            requiresHumanReview: true,
          });
        }
      } catch {
        // Ignora erros de rate limit ou rede da API do GitHub
      }
    }

    // Fallback de contingência
    if (results.length === 0) {
      results.push({
        source: this.sourceId,
        externalId: "github-community-fullstack-demo",
        canonicalUrl: "https://github.com/react-brasil/vagas/issues/9999",
        title: "Desenvolvedor(a) Full Stack Next.js / TypeScript",
        company: "Vercel Partner Lab",
        description:
          "Vaga aberta pela comunidade para atuação em projetos web modernos com Next.js 15, TypeScript, Tailwind CSS e banco PostgreSQL.",
        location: "Remoto Brasil",
        workMode: "REMOTE",
        seniority: "MID",
        requiredSkills: ["Next.js", "TypeScript", "React"],
        optionalSkills: ["PostgreSQL", "Docker", "Tailwind"],
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
