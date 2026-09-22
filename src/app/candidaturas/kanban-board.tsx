"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, Clock, Loader2, ShieldAlert, Trash2 } from "lucide-react";

import { deleteApplicationAction, updateApplicationStatusAction } from "@/app/actions/application";
import type { ApplicationStatus } from "@/generated/prisma/enums";

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

const availableStatuses: { value: ApplicationStatus; label: string }[] = [
  { value: "MATCHED", label: "Compatível" },
  { value: "REVIEW_REQUIRED", label: "Revisão Necessária" },
  { value: "READY", label: "Pronta para envio" },
  { value: "APPLIED", label: "Enviada" },
  { value: "INTERVIEW", label: "Em Entrevista" },
  { value: "OFFER", label: "Proposta Recebida" },
  { value: "REJECTED", label: "Encerrada" },
];

export function KanbanBoard({ applications }: { applications: KanbanApplication[] }) {
  const [isPending, startTransition] = useTransition();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    setActiveCardId(applicationId);
    startTransition(async () => {
      await updateApplicationStatusAction(applicationId, newStatus);
      setActiveCardId(null);
    });
  };

  const handleDelete = (applicationId: string) => {
    if (confirm("Deseja realmente remover esta candidatura do pipeline?")) {
      setActiveCardId(applicationId);
      startTransition(async () => {
        await deleteApplicationAction(applicationId);
        setActiveCardId(null);
      });
    }
  };

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
              {columnApps.map((item) => {
                const isItemPending = isPending && activeCardId === item.id;

                return (
                  <article
                    className="kanban-card"
                    key={item.id}
                    style={{
                      transition: "0.2s transform, 0.2s opacity",
                      opacity: isItemPending ? 0.6 : 1,
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Link
                        href={`/vagas/${item.jobExternalId}`}
                        style={{ textDecoration: "none" }}
                      >
                        <small style={{ fontWeight: 700, color: "var(--cyan)", cursor: "pointer" }}>
                          {item.company}
                        </small>
                      </Link>
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

                    <Link
                      href={`/vagas/${item.jobExternalId}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <strong style={{ display: "block", marginTop: "4px", fontSize: "14px" }}>
                        {item.role}
                      </strong>
                    </Link>

                    <div style={{ fontSize: "11px", color: "var(--muted)", margin: "4px 0 10px" }}>
                      {item.workMode} · {item.location}
                    </div>

                    {/* Controles de movimentação rápida */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        margin: "8px 0",
                        padding: "6px 8px",
                        background: "#f4f8fa",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    >
                      <ArrowRight size={13} color="var(--muted)" />
                      <select
                        value={item.status}
                        disabled={isItemPending}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value as ApplicationStatus)
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--ink)",
                          fontSize: "11px",
                          fontWeight: 600,
                          width: "100%",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        {availableStatuses.map((st) => (
                          <option key={st.value} value={st.value}>
                            Mover: {st.label}
                          </option>
                        ))}
                      </select>
                      {isItemPending && <Loader2 size={13} className="spin" color="var(--cyan)" />}
                    </div>

                    <footer
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid #eef2f4",
                        paddingTop: "8px",
                        marginTop: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Clock size={11} /> {item.date}
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {item.requiresHumanReview && item.status === "REVIEW_REQUIRED" && (
                          <span
                            style={{
                              fontSize: "10px",
                              color: "var(--coral)",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              fontWeight: "600",
                            }}
                          >
                            <ShieldAlert size={12} /> Revisar
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Remover do pipeline"
                          disabled={isItemPending}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#9cafb8",
                            cursor: "pointer",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </footer>
                  </article>
                );
              })}
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
