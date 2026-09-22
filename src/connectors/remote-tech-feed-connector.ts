import type { JobInput } from "@/lib/validation";
import type { JobDiscoveryConnector, SearchCriteria } from "./types";

export class RemoteTechFeedConnector implements JobDiscoveryConnector {
  readonly name = "Tech Remote Feed Connector";
  readonly sourceId = "remote-tech-feed";

  // Vagas normalizadas disponíveis para ingestão controlada
  private readonly defaultDataset: JobInput[] = [
    {
      source: "remote-tech-feed",
      externalId: "mercadolivre-fullstack-jr",
      canonicalUrl: "https://mercadolivre.com/jobs/fullstack-junior-br",
      title: "Desenvolvedor(a) Full Stack Júnior",
      company: "Mercado Livre",
      description: "Construção de microsserviços escaláveis, APIs RESTful e interfaces ágeis com React, TypeScript e Node.js para o maior ecossistema de e-commerce da América Latina.",
      location: "Brasil (Remoto)",
      workMode: "REMOTE",
      seniority: "JUNIOR",
      salaryMin: 5500,
      salaryMax: 7000,
      requiredSkills: ["TypeScript", "React", "Node.js"],
      optionalSkills: ["PostgreSQL", "Docker", "AWS"],
      requiresHumanReview: true,
    },
    {
      source: "remote-tech-feed",
      externalId: "nubank-frontend-i",
      canonicalUrl: "https://nubank.com/jobs/frontend-engineer-i",
      title: "Engenheiro(a) de Software Frontend I",
      company: "Nubank",
      description: "Desenvolva experiências financeiras simples, intuitivas e resilientes utilizando React, TypeScript e GraphQL com cultura forte de testes unitários.",
      location: "São Paulo, SP",
      workMode: "HYBRID",
      seniority: "JUNIOR",
      salaryMin: 6000,
      salaryMax: 8000,
      requiredSkills: ["React", "TypeScript"],
      optionalSkills: ["GraphQL", "Next.js"],
      requiresHumanReview: true,
    },
    {
      source: "remote-tech-feed",
      externalId: "ifood-backend-jr",
      canonicalUrl: "https://ifood.com/jobs/backend-junior",
      title: "Desenvolvedor Backend Júnior (Node.js)",
      company: "iFood",
      description: "Atuação na squad de logística para processamento de pedidos em tempo real, integrando mensageria, banco relacional e alta disponibilidade.",
      location: "Brasil (Remoto)",
      workMode: "REMOTE",
      seniority: "JUNIOR",
      salaryMin: 5200,
      salaryMax: 6800,
      requiredSkills: ["Node.js", "TypeScript", "PostgreSQL"],
      optionalSkills: ["Kafka", "Redis"],
      requiresHumanReview: false,
    },
  ];

  async discover(criteria: SearchCriteria): Promise<JobInput[]> {
    let results = [...this.defaultDataset];

    if (criteria.seniority) {
      results = results.filter((job) => job.seniority === criteria.seniority);
    }

    if (criteria.workMode) {
      results = results.filter((job) => job.workMode === criteria.workMode);
    }

    if (criteria.keywords && criteria.keywords.length > 0) {
      const lowerKeywords = criteria.keywords.map((k) => k.toLowerCase());
      results = results.filter((job) => {
        const text = `${job.title} ${job.company} ${job.requiredSkills.join(" ")}`.toLowerCase();
        return lowerKeywords.some((kw) => text.includes(kw));
      });
    }

    if (criteria.limit && criteria.limit > 0) {
      results = results.slice(0, criteria.limit);
    }

    return results;
  }
}
