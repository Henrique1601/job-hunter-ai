import type { PipelineStatus } from "@/domain/application-policy";

export interface DemoJob {
  id: string;
  company: string;
  companyMark: string;
  title: string;
  location: string;
  workMode: "Remoto" | "Híbrido" | "Presencial";
  salary: string;
  score: number;
  postedAt: string;
  source: string;
  canonicalUrl: string;
  status: PipelineStatus;
  skills: string[];
  missingSkills: string[];
  description: string;
  requiresHumanReview: boolean;
}

export const demoJobs: DemoJob[] = [
  {
    id: "nuvemshop-fullstack",
    company: "Nuvemshop",
    companyMark: "NV",
    title: "Desenvolvedor Full Stack Júnior",
    location: "São Paulo, SP",
    workMode: "Remoto",
    salary: "R$ 5.000–6.500",
    score: 92,
    postedAt: "há 2 horas",
    source: "Página da empresa",
    canonicalUrl: "https://example.com/jobs/nuvemshop-fullstack-jr",
    status: "READY",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    missingSkills: ["AWS"],
    description:
      "Time de produto busca pessoa desenvolvedora para construir experiências de comércio digital, APIs e ferramentas internas com foco em qualidade e autonomia.",
    requiresHumanReview: false,
  },
  {
    id: "quintoandar-frontend",
    company: "QuintoAndar",
    companyMark: "QA",
    title: "Frontend Engineer I",
    location: "Brasil",
    workMode: "Remoto",
    salary: "Faixa não divulgada",
    score: 86,
    postedAt: "há 5 horas",
    source: "Gupy",
    canonicalUrl: "https://example.com/jobs/quintoandar-frontend-i",
    status: "REVIEW_REQUIRED",
    skills: ["React", "TypeScript", "CSS", "Testes"],
    missingSkills: ["GraphQL"],
    description:
      "Atuação em uma squad multidisciplinar responsável por simplificar jornadas imobiliárias em uma plataforma de grande escala.",
    requiresHumanReview: true,
  },
  {
    id: "loft-backend",
    company: "Loft",
    companyMark: "LF",
    title: "Backend Developer Júnior",
    location: "São Paulo, SP",
    workMode: "Híbrido",
    salary: "R$ 4.500–5.800",
    score: 78,
    postedAt: "ontem",
    source: "LinkedIn",
    canonicalUrl: "https://example.com/jobs/loft-backend-jr",
    status: "MATCHED",
    skills: ["Node.js", "PostgreSQL", "REST", "Docker"],
    missingSkills: ["Kafka"],
    description:
      "Desenvolvimento de serviços para produtos financeiros e imobiliários, com observabilidade, testes e colaboração entre engenharia e produto.",
    requiresHumanReview: true,
  },
  {
    id: "contaazul-software",
    company: "Conta Azul",
    companyMark: "CA",
    title: "Pessoa Desenvolvedora de Software",
    location: "Joinville, SC",
    workMode: "Remoto",
    salary: "R$ 4.000–5.200",
    score: 71,
    postedAt: "há 2 dias",
    source: "Indeed",
    canonicalUrl: "https://example.com/jobs/contaazul-software-dev",
    status: "DISCOVERED",
    skills: ["JavaScript", "React", "SQL"],
    missingSkills: ["Java", "Spring"],
    description:
      "Construção de soluções para pequenas empresas brasileiras, com cultura de produto, melhoria contínua e decisões guiadas por dados.",
    requiresHumanReview: true,
  },
];

export const pipeline = [
  { status: "DISCOVERED", label: "Descobertas", count: 28 },
  { status: "MATCHED", label: "Com match", count: 12 },
  { status: "REVIEW_REQUIRED", label: "Sua revisão", count: 4 },
  { status: "READY", label: "Prontas", count: 3 },
  { status: "APPLIED", label: "Enviadas", count: 9 },
  { status: "INTERVIEW", label: "Entrevistas", count: 2 },
] as const;

export const applications = [
  { company: "Nubank", role: "Software Engineer", status: "INTERVIEW", date: "20 set", score: 89 },
  { company: "RD Station", role: "Frontend Developer", status: "APPLIED", date: "19 set", score: 84 },
  { company: "Mercado Livre", role: "Developer Júnior", status: "APPLIED", date: "18 set", score: 81 },
  { company: "iFood", role: "Full Stack Developer", status: "REJECTED", date: "15 set", score: 76 },
] as const;
