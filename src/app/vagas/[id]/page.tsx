import { ArrowLeft, Building2, Check, CircleAlert, ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { evaluateJobSemantics } from "@/ai/semantic-evaluator";
import { AiInsightsPanel } from "@/components/ai-insights-panel";
import { ScoreRing } from "@/components/score-ring";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { findCatalogJob } from "@/services/job-catalog";
import { ApplyButton } from "./apply-button";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const prisma = getPrismaClient();

  const [job, dbUser] = await Promise.all([
    findCatalogJob(id),
    prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    }),
  ]);

  if (!job) notFound();

  const candidateProfile = dbUser?.profile;

  const insights = await evaluateJobSemantics({
    candidate: {
      name: dbUser?.name ?? "Candidato",
      targetRoles: candidateProfile?.targetRoles ?? ["Desenvolvedor Full Stack"],
      skills: candidateProfile?.skills ?? ["TypeScript", "React", "Node.js"],
      seniority: candidateProfile?.seniority ?? "JUNIOR",
    },
    job: {
      title: job.title,
      company: job.company,
      description: job.description,
      requiredSkills: job.skills,
      optionalSkills: [],
      missingSkills: job.missingSkills,
    },
  });

  return (
    <div className="detail-page">
      <Link href="/vagas" className="back-link">
        <ArrowLeft size={16} /> Voltar para vagas
      </Link>

      <section className="job-hero">
        <div className="job-hero-main">
          <span className="company-mark hero-mark">{job.companyMark}</span>
          <div>
            <p className="eyebrow">{job.company}</p>
            <h1>{job.title}</h1>
            <p>
              <MapPin size={15} /> {job.location} · {job.workMode}{" "}
              <span>•</span> <Building2 size={15} /> {job.source}
            </p>
          </div>
        </div>
        <div className="hero-score">
          <ScoreRing score={job.score} size="lg" />
          <div>
            <strong>{job.score >= 75 ? "Match forte" : "Em análise"}</strong>
            <span>{job.score >= 75 ? "Alta aderência técnica" : "Vale sua atenção"}</span>
          </div>
        </div>
      </section>

      <div className="detail-grid">
        <div className="detail-main">
          <section className="content-card">
            <p className="eyebrow">Sobre a oportunidade</p>
            <h2>O desafio</h2>
            <p>{job.description}</p>
            <h3>Competências encontradas</h3>
            <div className="skill-tags positive">
              {job.skills.map((skill) => (
                <span key={skill}>
                  <Check size={13} /> {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="content-card">
            <p className="eyebrow">Leitura do agente</p>
            <h2>Critérios de compatibilidade</h2>
            <ul className="match-reasons">
              <li>
                <Check /> Sua stack cobre as principais tecnologias obrigatórias.
              </li>
              <li>
                <Check /> Modalidade ({job.workMode}) e senioridade estão nas preferências do seu perfil.
              </li>
              {job.missingSkills.length > 0 ? (
                <li>
                  <CircleAlert /> {job.missingSkills.join(", ")} aparece como lacuna a ser observada.
                </li>
              ) : (
                <li>
                  <Check /> Nenhuma lacuna crítica detectada nos requisitos obrigatórios.
                </li>
              )}
            </ul>
          </section>

          <AiInsightsPanel insights={insights} />
        </div>

        <aside className="action-card">
          <span className="safety-label">
            <ShieldCheck size={15} /> Candidatura segura
          </span>
          <h2>
            {job.requiresHumanReview
              ? "Revise antes de enviar"
              : "Pronta para preparar"}
          </h2>
          <p>
            {job.requiresHumanReview
              ? "Esta plataforma ou vaga requer intervenção pessoal. O agente prepara os dados e para no status de revisão."
              : "O agente pode preparar os dados e registrar a candidatura no pipeline automaticamente."}
          </p>

          <ApplyButton
            jobExternalId={job.id}
            initialStatus={job.status}
            requiresHumanReview={job.requiresHumanReview}
          />

          <a
            href={job.source.startsWith("http") ? job.source : "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", width: "100%" }}
          >
            <button className="secondary-button" style={{ width: "100%" }}>
              <ExternalLink size={15} /> Abrir vaga original
            </button>
          </a>

          <dl>
            <div>
              <dt>Faixa salarial</dt>
              <dd>{job.salary}</dd>
            </div>
            <div>
              <dt>Publicação</dt>
              <dd>{job.postedAt}</dd>
            </div>
            <div>
              <dt>Fonte</dt>
              <dd>{job.source}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
