"use client";

import { MapPin, Radar, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { DemoJob } from "@/data/demo";
import { ScoreRing } from "./score-ring";

export function JobsExplorer({ jobs }: { jobs: DemoJob[] }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("Todos");
  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const searchable = `${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (mode === "Todos" || job.workMode === mode);
  }), [jobs, mode, query]);

  return (
    <>
      <div className="job-filters">
        <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cargo, empresa ou tecnologia" /></label>
        <div className="mode-switch" aria-label="Filtrar por modalidade">
          {["Todos", "Remoto", "Híbrido", "Presencial"].map((item) => <button className={mode === item ? "active" : ""} onClick={() => setMode(item)} key={item}>{item}</button>)}
        </div>
        <button className="filter-button"><SlidersHorizontal size={16} /> Mais filtros</button>
      </div>
      <p className="result-count"><strong>{filteredJobs.length}</strong> oportunidades encontradas</p>
      <div className="job-cards">
        {filteredJobs.map((job) => (
          <Link href={`/vagas/${job.id}`} className="job-card" key={job.id}>
            <div className="job-card-top"><span className="company-mark large">{job.companyMark}</span><ScoreRing score={job.score} size="md" /></div>
            <div className="job-card-title"><small>{job.company}</small><h2>{job.title}</h2></div>
            <p className="job-location"><MapPin size={15} /> {job.location} · {job.workMode}</p>
            <div className="skill-tags">{job.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
            <div className="job-card-footer"><span>{job.salary}</span><small>{job.postedAt}</small></div>
          </Link>
        ))}
        {filteredJobs.length === 0 ? <div className="empty-state"><Radar size={28} /><h2>Nenhuma vaga neste recorte</h2><p>Altere a busca ou a modalidade para ampliar o radar.</p></div> : null}
      </div>
    </>
  );
}
