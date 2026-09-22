import { KanbanBoard, type KanbanApplication } from "./kanban-board";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function workModeLabel(mode: "REMOTE" | "HYBRID" | "ONSITE") {
  return { REMOTE: "Remoto", HYBRID: "Híbrido", ONSITE: "Presencial" }[mode];
}

export default async function ApplicationsPage() {
  const user = await getCurrentUser();
  const prisma = getPrismaClient();

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { job: true },
    orderBy: { updatedAt: "desc" },
  });

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  const kanbanData: KanbanApplication[] = applications.map((app) => ({
    id: app.id,
    jobId: app.jobId,
    jobExternalId: app.job.externalId,
    company: app.job.company,
    role: app.job.title,
    status: app.status,
    score: app.matchScore,
    date: formatter.format(app.updatedAt),
    location: app.job.location,
    workMode: workModeLabel(app.job.workMode),
    requiresHumanReview: app.job.requiresHumanReview,
  }));

  return (
    <div>
      <section className="page-heading simple-heading">
        <div>
          <p className="eyebrow">Pipeline pessoal</p>
          <h1>
            Cada candidatura<br />
            <em>no lugar certo.</em>
          </h1>
          <p className="heading-copy">
            Acompanhe decisões, próximos passos e o que ainda depende de sua intervenção.
          </p>
        </div>
      </section>

      <KanbanBoard applications={kanbanData} />
    </div>
  );
}
