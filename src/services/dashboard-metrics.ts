import { matchJob } from "@/domain/job-matcher";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export interface PipelineSummaryItem {
  status: string;
  label: string;
  count: number;
}

export interface RecentActivityItem {
  id: string;
  company: string;
  role: string;
  status: string;
  date: string;
  score: number;
}

export interface DashboardMetrics {
  jobsAnalyzed: number;
  strongMatches: number;
  totalApplications: number;
  interviewsCount: number;
  pipeline: PipelineSummaryItem[];
  recentActivities: RecentActivityItem[];
}

const pipelineLabels: Record<string, string> = {
  DISCOVERED: "Descobertas",
  MATCHED: "Com match",
  REVIEW_REQUIRED: "Sua revisão",
  READY: "Prontas",
  APPLIED: "Enviadas",
  INTERVIEW: "Entrevistas",
  OFFER: "Propostas",
  REJECTED: "Encerradas",
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const prisma = getPrismaClient();
  const user = await getCurrentUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });

  const [totalJobs, applications, jobs] = await Promise.all([
    prisma.job.count(),
    prisma.application.findMany({
      where: { userId: user.id },
      include: { job: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.job.findMany(),
  ]);

  let strongMatchesCount = 0;

  if (dbUser?.profile) {
    for (const job of jobs) {
      const match = matchJob(
        {
          targetRoles: dbUser.profile.targetRoles,
          skills: dbUser.profile.skills,
          seniority: dbUser.profile.seniority,
          workModes: dbUser.profile.workModes,
          locations: dbUser.profile.locations,
          minimumSalary: dbUser.profile.minimumSalary ?? undefined,
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
      if (match.score >= 75) {
        strongMatchesCount++;
      }
    }
  }

  const statusCounts = new Map<string, number>();
  for (const app of applications) {
    statusCounts.set(app.status, (statusCounts.get(app.status) ?? 0) + 1);
  }

  const pipelineOrder = [
    "DISCOVERED",
    "MATCHED",
    "REVIEW_REQUIRED",
    "READY",
    "APPLIED",
    "INTERVIEW",
  ];

  const pipeline: PipelineSummaryItem[] = pipelineOrder.map((status) => {
    let count = statusCounts.get(status) ?? 0;
    if (status === "DISCOVERED") {
      count = Math.max(totalJobs, count);
    }
    if (status === "MATCHED" && count === 0) {
      count = strongMatchesCount;
    }
    return {
      status,
      label: pipelineLabels[status] ?? status,
      count,
    };
  });

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  const recentActivities: RecentActivityItem[] = applications.slice(0, 5).map((app) => ({
    id: app.id,
    company: app.job.company,
    role: app.job.title,
    status: app.status,
    date: formatter.format(app.updatedAt),
    score: app.matchScore,
  }));

  const interviewsCount = statusCounts.get("INTERVIEW") ?? 0;

  return {
    jobsAnalyzed: totalJobs,
    strongMatches: strongMatchesCount,
    totalApplications: applications.length,
    interviewsCount,
    pipeline,
    recentActivities,
  };
}
