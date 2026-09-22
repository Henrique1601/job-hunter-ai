"use client";

import { useActionState, useState, useTransition } from "react";
import {
  Bot,
  Check,
  CircleAlert,
  Download,
  FileCheck2,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";

import {
  deleteResumeAction,
  extractProfileFromResumeAction,
  setDefaultResumeAction,
  uploadResumeAction,
  type ResumeActionResult,
} from "@/app/actions/resume";

export interface ResumeItem {
  id: string;
  name: string;
  storageKey: string;
  mimeType: string;
  isDefault: boolean;
  createdAt: string;
}

export function ResumeLibrary({ initialResumes }: { initialResumes: ResumeItem[] }) {
  const [uploadState, formAction, isUploading] = useActionState<ResumeActionResult | null, FormData>(
    uploadResumeAction,
    null,
  );

  const [isPending, startTransition] = useTransition();
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const handleSetDefault = (resumeId: string) => {
    startTransition(async () => {
      await setDefaultResumeAction(resumeId);
    });
  };

  const handleDelete = (resumeId: string) => {
    if (confirm("Deseja realmente excluir este currículo?")) {
      startTransition(async () => {
        await deleteResumeAction(resumeId);
      });
    }
  };

  const handleAiExtract = (resumeId: string) => {
    startTransition(async () => {
      const result = await extractProfileFromResumeAction(resumeId);
      setAiMessage(result.message);
      setTimeout(() => setAiMessage(null), 6000);
    });
  };

  return (
    <div style={{ display: "grid", gap: "28px" }}>
      {uploadState?.message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            background: uploadState.success ? "rgba(106, 194, 103, 0.15)" : "rgba(255, 109, 90, 0.15)",
            color: uploadState.success ? "#2d6b2b" : "var(--coral)",
            border: `1px solid ${uploadState.success ? "rgba(106, 194, 103, 0.3)" : "rgba(255, 109, 90, 0.3)"}`,
          }}
        >
          {uploadState.success ? <Check size={16} /> : <CircleAlert size={16} />}
          <span>{uploadState.message}</span>
        </div>
      )}

      {aiMessage && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            background: "rgba(8, 166, 183, 0.12)",
            color: "var(--cyan)",
            border: "1px solid rgba(8, 166, 183, 0.3)",
          }}
        >
          <Sparkles size={16} />
          <span>{aiMessage}</span>
        </div>
      )}

      <div className="resume-grid">
        {initialResumes.map((resume) => (
          <article className="resume-card" key={resume.id} style={{ position: "relative" }}>
            {resume.isDefault ? (
              <FileCheck2 color="var(--cyan)" size={28} />
            ) : (
              <FileText color="var(--muted)" size={28} />
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <small style={{ color: resume.isDefault ? "var(--cyan)" : "var(--muted)" }}>
                  {resume.isDefault ? "Currículo Principal" : "Versão Alternativa"}
                </small>
                {resume.isDefault && (
                  <span
                    style={{
                      fontSize: "9px",
                      padding: "2px 5px",
                      borderRadius: "4px",
                      background: "rgba(8, 166, 183, 0.12)",
                      color: "var(--cyan)",
                      fontWeight: "700",
                    }}
                  >
                    Ativo
                  </span>
                )}
              </div>

              <h2
                style={{
                  fontSize: "14px",
                  margin: "0 0 4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {resume.name}
              </h2>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)" }}>
                Enviado em {resume.createdAt}
              </p>

              {/* Botões de Ação */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                <a
                  href={resume.storageKey}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={resume.name}
                  style={{
                    border: "1px solid var(--line)",
                    background: "#fff",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--ink)",
                  }}
                >
                  <Download size={12} /> Baixar
                </a>

                <button
                  type="button"
                  onClick={() => handleAiExtract(resume.id)}
                  disabled={isPending}
                  style={{
                    border: "1px solid rgba(8, 166, 183, 0.3)",
                    background: "rgba(8, 166, 183, 0.08)",
                    color: "var(--cyan)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                  }}
                >
                  <Bot size={12} /> Auto-preencher Perfil
                </button>

                {!resume.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(resume.id)}
                    disabled={isPending}
                    style={{
                      border: "1px solid var(--line)",
                      background: "#fff",
                      color: "var(--ink)",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Definir Principal
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(resume.id)}
                  disabled={isPending}
                  title="Excluir currículo"
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#9cafb8",
                    padding: "4px",
                    cursor: "pointer",
                    marginLeft: "auto",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}

        {/* Card de Upload */}
        <form action={formAction} style={{ width: "100%", margin: 0 }}>
          <label
            className="upload-card"
            style={{
              cursor: isUploading ? "wait" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <input
              type="file"
              name="file"
              accept=".pdf,.docx,.txt"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  e.target.form?.requestSubmit();
                }
              }}
              disabled={isUploading}
            />
            {isUploading ? (
              <>
                <Loader2 className="spin" size={24} color="var(--cyan)" />
                <strong style={{ marginTop: "8px" }}>Enviando e indexando...</strong>
              </>
            ) : (
              <>
                <UploadCloud size={28} />
                <strong>Adicionar novo currículo</strong>
                <span>PDF, DOCX ou TXT até 10 MB</span>
              </>
            )}
          </label>
        </form>
      </div>
    </div>
  );
}
