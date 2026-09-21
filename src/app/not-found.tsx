import Link from "next/link";

export default function NotFound() {
  return <div className="empty-state full-page"><span>404</span><h1>Esta oportunidade saiu do radar.</h1><p>A vaga pode ter sido removida ou o endereço está incorreto.</p><Link className="primary-button" href="/vagas">Voltar para vagas</Link></div>;
}
