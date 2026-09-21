import { JobsExplorer } from "@/components/jobs-explorer";
import { listCatalogJobs } from "@/services/job-catalog";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await listCatalogJobs();

  return (
    <div>
      <section className="page-heading simple-heading"><div><p className="eyebrow">Radar de oportunidades</p><h1>Vagas com contexto,<br /><em>não só palavras-chave.</em></h1><p className="heading-copy">O score considera sua stack, momento de carreira, modalidade e preferências salariais.</p></div></section>
      <JobsExplorer jobs={jobs} />
    </div>
  );
}
