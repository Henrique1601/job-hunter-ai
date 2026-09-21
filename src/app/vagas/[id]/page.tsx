import { ArrowLeft, Building2, Check, CircleAlert, ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ScoreRing } from "@/components/score-ring";
import { findCatalogJob } from "@/services/job-catalog";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await findCatalogJob(id);
  if (!job) notFound();

  return (
    <div className="detail-page">
      <Link href="/vagas" className="back-link"><ArrowLeft size={16} /> Voltar para vagas</Link>
      <section className="job-hero">
        <div className="job-hero-main"><span className="company-mark hero-mark">{job.companyMark}</span><div><p className="eyebrow">{job.company}</p><h1>{job.title}</h1><p><MapPin size={15} /> {job.location} · {job.workMode} <span>•</span> <Building2 size={15} /> {job.source}</p></div></div>
        <div className="hero-score"><ScoreRing score={job.score} size="lg" /><div><strong>Match forte</strong><span>Vale sua atenção</span></div></div>
      </section>
      <div className="detail-grid">
        <div className="detail-main">
          <section className="content-card"><p className="eyebrow">Sobre a oportunidade</p><h2>O desafio</h2><p>{job.description}</p><h3>Competências encontradas</h3><div className="skill-tags positive">{job.skills.map((skill) => <span key={skill}><Check size={13} /> {skill}</span>)}</div></section>
          <section className="content-card"><p className="eyebrow">Leitura do agente</p><h2>Por que combina com você</h2><ul className="match-reasons"><li><Check /> Sua experiência cobre a maior parte da stack obrigatória.</li><li><Check /> Senioridade e modalidade estão alinhadas às preferências.</li><li><CircleAlert /> {job.missingSkills.join(", ")} aparece como lacuna, mas não elimina o match.</li></ul></section>
        </div>
        <aside className="action-card"><span className="safety-label"><ShieldCheck size={15} /> Candidatura segura</span><h2>{job.requiresHumanReview ? "Revise antes de enviar" : "Pronta para preparar"}</h2><p>{job.requiresHumanReview ? "Esta plataforma exige uma etapa manual. O agente prepara tudo e para antes do envio." : "O agente pode preparar os dados e colocar a candidatura na fila."}</p><button className="primary-button">Preparar candidatura</button><button className="secondary-button"><ExternalLink size={15} /> Abrir vaga original</button><dl><div><dt>Faixa salarial</dt><dd>{job.salary}</dd></div><div><dt>Publicação</dt><dd>{job.postedAt}</dd></div><div><dt>Fonte</dt><dd>{job.source}</dd></div></dl></aside>
      </div>
    </div>
  );
}
