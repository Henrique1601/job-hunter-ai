import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL é obrigatória para executar o seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "henrique@example.com" },
    update: { name: "Henrique Silva" },
    create: { email: "henrique@example.com", name: "Henrique Silva" },
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      headline: "Desenvolvedor Full Stack Júnior",
      targetRoles: ["Desenvolvedor Full Stack", "Frontend Developer"],
      skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"],
      seniority: "JUNIOR",
      workModes: ["REMOTE", "HYBRID"],
      locations: ["São Paulo", "Brasil"],
      minimumSalary: 3500,
    },
  });

  const jobs = [
    {
      source: "career-page",
      externalId: "nuvemshop-fullstack",
      canonicalUrl: "https://example.com/jobs/nuvemshop-fullstack-jr",
      title: "Desenvolvedor Full Stack Júnior",
      company: "Nuvemshop",
      description: "Desenvolvimento de experiências de comércio digital, APIs e ferramentas internas com foco em qualidade.",
      location: "São Paulo",
      workMode: "REMOTE" as const,
      seniority: "JUNIOR" as const,
      salaryMin: 5000,
      salaryMax: 6500,
      requiredSkills: ["TypeScript", "React", "Node.js"],
      optionalSkills: ["AWS"],
      requiresHumanReview: false,
    },
    {
      source: "gupy",
      externalId: "quintoandar-frontend",
      canonicalUrl: "https://example.com/jobs/quintoandar-frontend-i",
      title: "Frontend Engineer I",
      company: "QuintoAndar",
      description: "Atuação em squad multidisciplinar responsável por simplificar jornadas imobiliárias em grande escala.",
      location: "Brasil",
      workMode: "REMOTE" as const,
      seniority: "JUNIOR" as const,
      requiredSkills: ["React", "TypeScript", "CSS"],
      optionalSkills: ["GraphQL"],
      requiresHumanReview: true,
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { canonicalUrl: job.canonicalUrl },
      update: job,
      create: job,
    });
  }
}

main()
  .then(() => console.log("Seed concluído."))
  .finally(() => prisma.$disconnect());
