import { ArrowUpRight, Bot, Clock3, Radar, Sparkles } from "lucide-react";
import Link from "next/link";

import { ScoreRing } from "@/components/score-ring";
import { applications, demoJobs, pipeline } from "@/data/demo";

const statusLabels: Record<string, string> = {
  INTERVIEW: "Entrevista",
  APPLIED: "Enviada",
  REJECTED: "Encerrada",
};

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <section className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">Domingo, 21 de setembro</p>
          <h1>Seu radar encontrou<br /><em>boas conversas.</em></h1>
          <p className="heading-copy">Quatro vagas pedem sua atenção. Duas candidaturas avançaram desde a última busca.</p>
        </div>
        <div className="agent-card">
          <span className="agent-orbit"><Bot size={24} /></span>
          <div><small>Próxima varredura</small><strong>Hoje, 18:30</strong></div>
          <button aria-label="Executar busca agora"><Radar size={17} /> Buscar agora</button>
        </div>
      </section>

      <section className="metric-strip" aria-label="Resumo da semana">
        <article><span>Vagas analisadas</span><strong>48</strong><small>+16 nesta semana</small></article>
        <article><span>Matches fortes</span><strong>12</strong><small>25% das analisadas</small></article>
        <article><span>Candidaturas</span><strong>09</strong><small>3 aguardam envio</small></article>
        <article className="metric-highlight"><span>Entrevistas</span><strong>02</strong><small>Seu melhor resultado</small></article>
      </section>

      <section className="pipeline-section">
        <div className="section-heading">
          <div><p className="eyebrow">Fluxo ao vivo</p><h2>Da descoberta à entrevista</h2></div>
          <Link href="/candidaturas">Ver pipeline <ArrowUpRight size={15} /></Link>
        </div>
        <div className="pipeline-track">
          {pipeline.map((item, index) => (
            <div className="pipeline-step" key={item.status}>
              <span className="step-index">0{index + 1}</span>
              <strong>{item.count}</strong>
              <small>{item.label}</small>
              {index < pipeline.length - 1 ? <i aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="matches-panel">
          <div className="section-heading compact">
            <div><p className="eyebrow">Melhores oportunidades</p><h2>Matches para revisar</h2></div>
            <Link href="/vagas">Todas as vagas <ArrowUpRight size={15} /></Link>
          </div>
          <div className="match-list">
            {demoJobs.slice(0, 3).map((job) => (
              <Link href={`/vagas/${job.id}`} className="match-row" key={job.id}>
                <span className="company-mark">{job.companyMark}</span>
                <span className="match-info"><small>{job.company}</small><strong>{job.title}</strong><span>{job.workMode} · {job.location}</span></span>
                <span className="skill-preview">{job.skills.slice(0, 2).map((skill) => <i key={skill}>{skill}</i>)}</span>
                <ScoreRing score={job.score} size="sm" />
                <ArrowUpRight className="row-arrow" size={17} />
              </Link>
            ))}
          </div>
        </section>

        <aside className="activity-panel">
          <div className="section-heading compact"><div><p className="eyebrow">Movimentações</p><h2>Últimas candidaturas</h2></div></div>
          <div className="activity-list">
            {applications.map((application) => (
              <div className="activity-item" key={application.company}>
                <span className={`status-dot status-${application.status.toLowerCase()}`} />
                <div><strong>{application.company}</strong><span>{application.role}</span></div>
                <div className="activity-meta"><small>{application.date}</small><b>{statusLabels[application.status]}</b></div>
              </div>
            ))}
          </div>
          <div className="insight-card"><Sparkles size={18} /><div><strong>Seu perfil está em alta</strong><p>React + TypeScript aparece em 68% dos seus melhores matches.</p></div></div>
        </aside>
      </div>

      <footer className="dashboard-footnote"><Clock3 size={14} /> Dados de demonstração · última atualização agora</footer>
    </div>
  );
}
