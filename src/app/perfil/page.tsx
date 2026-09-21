export default function ProfilePage() {
  return (
    <div>
      <section className="page-heading simple-heading"><div><p className="eyebrow">Perfil profissional</p><h1>Ensine o radar a<br /><em>procurar como você.</em></h1><p className="heading-copy">Estas preferências orientam o score e evitam oportunidades fora do seu momento.</p></div></section>
      <div className="form-card"><div className="form-section"><span className="form-number">01</span><div><h2>Direção de carreira</h2><p>Quais papéis fazem sentido agora?</p></div><label><span>Cargos desejados</span><input defaultValue="Desenvolvedor Full Stack, Frontend Developer" /></label><label><span>Senioridade</span><select defaultValue="JUNIOR"><option value="INTERN">Estágio</option><option value="JUNIOR">Júnior</option><option value="MID">Pleno</option></select></label></div><div className="form-section"><span className="form-number">02</span><div><h2>Stack principal</h2><p>Tecnologias que você já usa.</p></div><label className="full-field"><span>Competências</span><input defaultValue="TypeScript, React, Next.js, Node.js, PostgreSQL" /></label></div><button className="primary-button form-save">Salvar preferências</button></div>
    </div>
  );
}
