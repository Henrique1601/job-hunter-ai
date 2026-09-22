import { ArrowUpRight, Bot, Clock3, Sparkles } from "lucide-react";
import Link from "next/link";

import { DiscoveryTriggerButton } from "@/components/discovery-trigger-button";
import { ScoreRing } from "@/components/score-ring";
import { getDashboardMetrics } from "@/services/dashboard-metrics";
import { listCatalogJobs } from "@/services/job-catalog";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  INTERVIEW: "Entrevista",
  APPLIED: "Enviada",
  READY: "Pronta",
  REVIEW_REQUIRED: "Aguardando revisão",
  MATCHED: "Compatível",
  DISCOVERED: "Descoberta",
  REJECTED: "Encerrada",
  OFFER: "Proposta recebida",
};

export default async function DashboardPage() {
  const [metrics, jobs] = await Promise.all([
    getDashboardMetrics(),
    listCatalogJobs(),
  ]);

  const topJobs = jobs
    .filter((j) => j.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const displayJobs = topJobs.length > 0 ? topJobs : jobs.slice(0, 3);

  const todayStr = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="dashboard-page">
      <section className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow" style={{ textTransform: "capitalize" }}>{todayStr}</p>
          <h1>
            Seu radar encontrou<br />
            <em>boas conversas.</em>
          </h1>
          <p className="heading-copy">
            {metrics.strongMatches > 0
              ? `${metrics.strongMatches} vagas possuem alta compatibilidade técnica com seu perfil no banco Neon.`
              : "Explore as vagas descobertas e ajuste suas preferências para calibrar o score."}
          </p>
        </div>
        <div className="agent-card">
          <span className="agent-orbit">
            <Bot size={24} />
          </span>
          <div>
            <small>Próxima varredura</small>
            <strong>Hoje, 18:30</strong>
          </div>
          <DiscoveryTriggerButton />
        </div>
      </section>

      <section className="metric-strip" aria-label="Resumo do radar">
        <article>
          <span>Vagas no catálogo</span>
          <strong>{String(metrics.jobsAnalyzed).padStart(2, "0")}</strong>
          <small>salvas no PostgreSQL Neon</small>
        </article>
        <article>
          <span>Matches fortes</span>
          <strong>{String(metrics.strongMatches).padStart(2, "0")}</strong>
          <small>
            {metrics.jobsAnalyzed > 0
              ? `${Math.round((metrics.strongMatches / metrics.jobsAnalyzed) * 100)}% das analisadas`
              : "score ≥ 75"}
          </small>
        </article>
        <article>
          <span>Candidaturas</span>
          <strong>{String(metrics.totalApplications).padStart(2, "0")}</strong>
          <small>no seu pipeline</small>
        </article>
        <article className="metric-highlight">
          <span>Entrevistas</span>
          <strong>{String(metrics.interviewsCount).padStart(2, "0")}</strong>
          <small>Meta principal</small>
        </article>
      </section>

      <section className="pipeline-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Fluxo ao vivo</p>
            <h2>Da descoberta à entrevista</h2>
          </div>
          <Link href="/candidaturas">
            Ver pipeline <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="pipeline-track">
          {metrics.pipeline.map((item, index) => (
            <div className="pipeline-step" key={item.status}>
              <span className="step-index">0{index + 1}</span>
              <strong>{item.count}</strong>
              <small>{item.label}</small>
              {index < metrics.pipeline.length - 1 ? <i aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="matches-panel">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Melhores oportunidades</p>
              <h2>Matches para revisar</h2>
            </div>
            <Link href="/vagas">
              Todas as vagas <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="match-list">
            {displayJobs.map((job) => (
              <Link href={`/vagas/${job.id}`} className="match-row" key={job.id}>
                <span className="company-mark">{job.companyMark}</span>
                <span className="match-info">
                  <small>{job.company}</small>
                  <strong>{job.title}</strong>
                  <span>{job.workMode} · {job.location}</span>
                </span>
                <span className="skill-preview">
                  {job.skills.slice(0, 2).map((skill) => (
                    <i key={skill}>{skill}</i>
                  ))}
                </span>
                <ScoreRing score={job.score} size="sm" />
                <ArrowUpRight className="row-arrow" size={17} />
              </Link>
            ))}
            {displayJobs.length === 0 && (
              <p style={{ color: "var(--muted)", padding: "20px 0" }}>
                Nenhuma vaga encontrada no catálogo. Adicione oportunidades ou execute uma busca.
              </p>
            )}
          </div>
        </section>

        <aside className="activity-panel">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Movimentações</p>
              <h2>Últimas candidaturas</h2>
            </div>
          </div>
          <div className="activity-list">
            {metrics.recentActivities.length > 0 ? (
              metrics.recentActivities.map((activity) => (
                <div className="activity-item" key={activity.id}>
                  <span className={`status-dot status-${activity.status.toLowerCase().replace("_", "-")}`} />
                  <div>
                    <strong>{activity.company}</strong>
                    <span>{activity.role}</span>
                  </div>
                  <div className="activity-meta">
                    <small>{activity.date}</small>
                    <b>{statusLabels[activity.status] ?? activity.status}</b>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px 0", color: "var(--muted)", fontSize: "13px" }}>
                <p>Nenhuma candidatura iniciada ainda.</p>
                <p style={{ marginTop: "6px" }}>
                  Acesse as <Link href="/vagas" style={{ color: "var(--cyan)", fontWeight: "600" }}>vagas</Link> e prepare sua primeira candidatura!
                </p>
              </div>
            )}
          </div>
          <div className="insight-card">
            <Sparkles size={18} />
            <div>
              <strong>Seu perfil está sincronizado</strong>
              <p>O Job Matcher utiliza suas preferências do Neon para calcular a aderência das vagas.</p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="dashboard-footnote">
        <Clock3 size={14} /> Dados reais sincronizados com PostgreSQL Neon · última atualização agora
      </footer>
    </div>
  );
}
