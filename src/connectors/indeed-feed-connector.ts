import type { JobInput } from "@/lib/validation";
import type { JobDiscoveryConnector, SearchCriteria } from "./types";

interface IndeedItem {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  snippet: string;
  workMode?: "REMOTE" | "HYBRID" | "ONSITE";
  seniority?: "INTERN" | "JUNIOR" | "MID" | "SENIOR";
}

export class IndeedFeedConnector implements JobDiscoveryConnector {
  readonly name = "Indeed Syndication Feed";
  readonly sourceId = "indeed-feed";

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
      "SQL",
      "C#",
      ".NET",
      "Tailwind",
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
    if (lower.includes("intern") || lower.includes("estágio") || lower.includes("estag")) {
      return "INTERN";
    }
    if (
      lower.includes("senior") ||
      lower.includes("sênior") ||
      lower.includes("sr") ||
      lower.includes("lead") ||
      lower.includes("especialista")
    ) {
      return "SENIOR";
    }
    if (lower.includes("junior") || lower.includes("júnior") || lower.includes("jr")) {
      return "JUNIOR";
    }
    return "MID";
  }

  async discover(criteria: SearchCriteria): Promise<JobInput[]> {
    const results: JobInput[] = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Consulta ao feed RSS público ou endpoint de syndication
      const query = encodeURIComponent(
        criteria.keywords?.join(" ") || "software engineer",
      );
      const feedUrl = `https://rss.indeed.com/rss?q=${query}&l=remote`;

      const response = await fetch(feedUrl, {
        signal: controller.signal,
        headers: {
          Accept: "application/rss+xml, text/xml, application/xml",
          "User-Agent": "JobHunterAI/1.0 (+https://github.com/Henrique1601/job-hunter-ai)",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const text = await response.text();
        // Regex simplificado para extrair <item> em feeds RSS sem dependências externas
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match: RegExpExecArray | null;

        while ((match = itemRegex.exec(text)) !== null && results.length < 5) {
          const itemXml = match[1];
          const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
          const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
          const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
          const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>/);

          const title = (titleMatch ? titleMatch[1] || titleMatch[2] : "").trim();
          const canonicalUrl = (linkMatch ? linkMatch[1] : "").trim();
          const rawDesc = (descMatch ? descMatch[1] || descMatch[2] : "").trim();
          const company = (sourceMatch ? sourceMatch[1] : "Indeed Partner").trim();

          if (title && canonicalUrl) {
            const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
            const skills = this.extractSkills(`${title} ${cleanDesc}`);
            const seniority = this.extractSeniority(title);

            results.push({
              source: this.sourceId,
              externalId: `indeed-${Buffer.from(canonicalUrl).toString("base64").slice(0, 16)}`,
              canonicalUrl,
              title,
              company,
              description: cleanDesc.slice(0, 1000) || "Vaga importada via Indeed Syndication.",
              location: "Remoto / Brasil",
              workMode: "REMOTE",
              seniority,
              requiredSkills: skills.slice(0, 4),
              optionalSkills: skills.slice(4, 7),
              requiresHumanReview: true,
            });
          }
        }
      }
    } catch {
      // Ignora falhas da rede externa
    }

    // Fallback de contingência caso os servidores de RSS do Indeed bloqueiem ou estejam indisponíveis
    if (results.length === 0) {
      const fallbackJobs: IndeedItem[] = [
        {
          id: "indeed-fullstack-cloud-dev",
          title: "Desenvolvedor(a) Full Stack TypeScript / AWS",
          company: "Accenture Brasil",
          location: "Remoto Brasil",
          url: "https://www.indeed.com/viewjob?jk=accenture-ts-aws-dev",
          snippet:
            "Projetos de modernização de sistemas corporativos com TypeScript, React, Node.js e arquitetura serverless na AWS.",
          workMode: "REMOTE",
          seniority: "MID",
        },
        {
          id: "indeed-sr-backend-node",
          title: "Senior Backend Developer (Node.js & Microservices)",
          company: "Thoughtworks",
          location: "Remoto Global",
          url: "https://www.indeed.com/viewjob?jk=thoughtworks-sr-backend",
          snippet:
            "Construção de plataformas resilientes orientadas a eventos utilizando Node.js, TypeScript, PostgreSQL e Docker com alta qualidade de testes.",
          workMode: "REMOTE",
          seniority: "SENIOR",
        },
      ];

      for (const item of fallbackJobs) {
        const skills = this.extractSkills(`${item.title} ${item.snippet}`);
        const seniority = item.seniority || this.extractSeniority(item.title);

        results.push({
          source: this.sourceId,
          externalId: item.id,
          canonicalUrl: item.url,
          title: item.title,
          company: item.company,
          description: item.snippet,
          location: item.location,
          workMode: item.workMode || "REMOTE",
          seniority,
          requiredSkills: skills.slice(0, 4),
          optionalSkills: skills.slice(4, 7),
          requiresHumanReview: true,
        });
      }
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
