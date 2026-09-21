import { FileCheck2, UploadCloud } from "lucide-react";

export default function ResumesPage() {
  return <div><section className="page-heading simple-heading"><div><p className="eyebrow">Biblioteca de currículos</p><h1>Uma versão para<br /><em>cada conversa.</em></h1><p className="heading-copy">Mantenha um currículo-base e prepare variações alinhadas às vagas.</p></div></section><div className="resume-grid"><article className="resume-card"><FileCheck2 /><div><small>Currículo principal</small><h2>Henrique_Silva_FullStack.pdf</h2><p>Atualizado em 21 set · PDF · 184 KB</p></div><span>Em uso</span></article><button className="upload-card"><UploadCloud /><strong>Adicionar currículo</strong><span>PDF ou DOCX até 10 MB</span></button></div></div>;
}
