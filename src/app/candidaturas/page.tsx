import { applications, pipeline } from "@/data/demo";

export default function ApplicationsPage() {
  return (
    <div>
      <section className="page-heading simple-heading"><div><p className="eyebrow">Pipeline pessoal</p><h1>Cada candidatura<br /><em>no lugar certo.</em></h1><p className="heading-copy">Acompanhe decisões, próximos passos e o que ainda depende de você.</p></div></section>
      <div className="kanban-board">
        {pipeline.slice(2).map((column) => (
          <section className="kanban-column" key={column.status}><header><span>{column.label}</span><b>{column.count}</b></header><div className="kanban-stack">{applications.filter((_, index) => index % 4 === pipeline.slice(2).indexOf(column)).map((item) => <article className="kanban-card" key={item.company}><small>{item.company}</small><strong>{item.role}</strong><span>Match {item.score}%</span><footer>{item.date}</footer></article>)}</div></section>
        ))}
      </div>
    </div>
  );
}
