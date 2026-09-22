"use client";

import Link from "next/link";
import { Clock, ShieldAlert } from "lucide-react";

export interface KanbanApplication {
  id: string;
  jobId: string;
  jobExternalId: string;
  company: string;
  role: string;
  status: string;
  score: number;
  date: string;
  location: string;
  workMode: string;
  requiresHumanReview: boolean;
}

const columns = [
  { status: "MATCHED", label: "Com match" },
  { status: "REVIEW_REQUIRED", label: "Sua revisão" },
  { status: "READY", label: "Prontas" },
  { status: "APPLIED", label: "Enviadas" },
  { status: "INTERVIEW", label: "Entrevistas" },
  { status: "OFFER", label: "Propostas" },
];

export function KanbanBoard({ applications }: { applications: KanbanApplication[] }) {
  return (
    <div className="kanban-board">
      {columns.map((column) => {
        const columnApps = applications.filter((app) => app.status === column.status);

        return (
          <section className="kanban-column" key={column.status}>
            <header>
              <span>{column.label}</span>
              <b>{columnApps.length}</b>
            </header>
            <div className="kanban-stack">
              {columnApps.map((item) => (
                <Link
                  href={`/vagas/${item.jobExternalId}`}
                  key={item.id}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article className="kanban-card" style={{ transition: "0.2s transform", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <small style={{ fontWeight: 700, color: "var(--cyan)" }}>{item.company}</small>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "6px",
                          background: item.score >= 75 ? "rgba(106, 194, 103, 0.15)" : "rgba(8, 166, 183, 0.12)",
                          color: item.score >= 75 ? "#2d6b2b" : "var(--cyan)",
                        }}
                      >
                        {item.score}%
                      </span>
                    </div>
                    <strong style={{ display: "block", marginTop: "4px", fontSize: "14px" }}>
                      {item.role}
                    </strong>
                    <div style={{ fontSize: "11px", color: "var(--muted)", margin: "4px 0 8px" }}>
                      {item.workMode} · {item.location}
                    </div>
                    <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #eef2f4", paddingTop: "8px", marginTop: "8px" }}>
                      <span style={{ fontSize: "10px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={11} /> {item.date}
                      </span>
                      {item.requiresHumanReview && item.status === "REVIEW_REQUIRED" && (
                        <span style={{ fontSize: "10px", color: "var(--coral)", display: "flex", alignItems: "center", gap: "3px", fontWeight: "600" }}>
                          <ShieldAlert size={12} /> Revisar
                        </span>
                      )}
                    </footer>
                  </article>
                </Link>
              ))}
              {columnApps.length === 0 && (
                <div
                  style={{
                    padding: "28px 14px",
                    textAlign: "center",
                    color: "#9cafb8",
                    fontSize: "12px",
                    border: "1px dashed var(--line)",
                    borderRadius: "10px",
                  }}
                >
                  Nenhuma vaga nesta etapa
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
