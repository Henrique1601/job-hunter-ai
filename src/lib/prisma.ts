import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const prismaGlobal = globalThis as typeof globalThis & {
  jobHunterPrisma?: PrismaClient;
};

export function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não configurada. Copie .env.example para .env e informe uma conexão PostgreSQL.",
    );
  }

  if (prismaGlobal.jobHunterPrisma) {
    return prismaGlobal.jobHunterPrisma;
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  if (process.env.NODE_ENV !== "production") {
    prismaGlobal.jobHunterPrisma = client;
  }

  return client;
}
