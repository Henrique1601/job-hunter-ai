import { decideApplicationState } from "@/domain/application-policy";
import { matchJob } from "@/domain/job-matcher";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import type { DemoJob } from "@/data/demo";

function companyMark(company: string) {
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toLocaleUpperCase("pt-BR");
}

function formatSalary(minimum: number | null, maximum: number | null) {
  if (!minimum && !maximum) return "Faixa não divulgada";

  const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  if (minimum && maximum) return `${money.format(minimum)}–${money.format(maximum)}`;
  if (minimum) return `A partir de ${money.format(minimum)}`;
  return `Até ${money.format(maximum ?? 0)}`;
}

function workModeLabel(mode: "REMOTE" | "HYBRID" | "ONSITE") {
  return { REMOTE: "Remoto", HYBRID: "Híbrido", ONSITE: "Presencial" }[
    mode
  ] as DemoJob["workMode"];
}

export async function listCatalogJobs(userEmail?: string): Promise<DemoJob[]> {
  const prisma = getPrismaClient();
  const currentUser = await getCurrentUser();
  const targetEmail = userEmail ?? currentUser.email;

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: { profile: true },
  });

  if (!user?.profile) return [];

  const [jobs, applications] = await Promise.all([
    prisma.job.findMany({ orderBy: { discoveredAt: "desc" } }),
    prisma.application.findMany({ where: { userId: user.id } }),
  ]);
  const applicationByJob = new Map(
    applications.map((application) => [application.jobId, application]),
  );

  return jobs.map((job) => {
    const match = matchJob(
      {
        targetRoles: user.profile!.targetRoles,
        skills: user.profile!.skills,
        seniority: user.profile!.seniority,
        workModes: user.profile!.workModes,
        locations: user.profile!.locations,
        minimumSalary: user.profile!.minimumSalary ?? undefined,
      },
      {
        title: job.title,
        requiredSkills: job.requiredSkills,
        optionalSkills: job.optionalSkills,
        seniority: job.seniority,
        workMode: job.workMode,
        location: job.location,
        salaryMin: job.salaryMin ?? undefined,
      },
    );
    const existingApplication = applicationByJob.get(job.id);
    const decision = decideApplicationState({
      matchScore: match.score,
      requiresHumanReview: job.requiresHumanReview,
      alreadyApplied: Boolean(existingApplication),
    });

    return {
      id: job.externalId,
      company: job.company,
      companyMark: companyMark(job.company),
      title: job.title,
      location: job.location,
      workMode: workModeLabel(job.workMode),
      salary: formatSalary(job.salaryMin, job.salaryMax),
      score: match.score,
      postedAt: "salva no Neon",
      source: job.source,
      canonicalUrl: job.canonicalUrl,
      status:
        existingApplication?.status ??
        (decision.status === "BLOCKED" ? "MATCHED" : decision.status),
      skills: job.requiredSkills,
      missingSkills: match.gaps,
      description: job.description,
      requiresHumanReview: job.requiresHumanReview,
    };
  });
}

export async function findCatalogJob(externalId: string, userEmail?: string) {
  const jobs = await listCatalogJobs(userEmail);
  return jobs.find((job) => job.id === externalId) ?? null;
}
