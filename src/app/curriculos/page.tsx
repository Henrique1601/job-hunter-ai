import { ResumeLibrary, type ResumeItem } from "./resume-library";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResumesPage() {
  const user = await getCurrentUser();
  const prisma = getPrismaClient();

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const resumeItems: ResumeItem[] = resumes.map((r) => ({
    id: r.id,
    name: r.name,
    storageKey: r.storageKey,
    mimeType: r.mimeType,
    isDefault: r.isDefault,
    createdAt: formatter.format(r.createdAt),
  }));

  return (
    <div>
      <section className="page-heading simple-heading">
        <div>
          <p className="eyebrow">Biblioteca de currículos</p>
          <h1>
            Uma versão para<br />
            <em>cada conversa.</em>
          </h1>
          <p className="heading-copy">
            Faça upload do seu currículo em PDF ou DOCX. Use a inteligência artificial do Gemini para extrair suas competências e calibrar o radar automaticamente.
          </p>
        </div>
      </section>

      <ResumeLibrary initialResumes={resumeItems} />
    </div>
  );
}
