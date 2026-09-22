"use client";

import { useState } from "react";
import { Bot, Check, Copy, MessageSquareQuote, Sparkles } from "lucide-react";

import type { SemanticEvaluationResult } from "@/ai/semantic-evaluator";

interface AiInsightsPanelProps {
  insights: SemanticEvaluationResult;
}

export function AiInsightsPanel({ insights }: AiInsightsPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(insights.coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback simples
    }
  };

  return (
    <section className="content-card" style={{ marginTop: "24px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0 }}>
          <Sparkles size={14} /> Análise do Agente Inteligente
        </p>
        <span
          style={{
            fontSize: "10px",
            fontFamily: "Consolas, monospace",
            padding: "3px 8px",
            borderRadius: "6px",
            background: insights.aiPowered ? "rgba(106, 194, 103, 0.15)" : "rgba(8, 166, 183, 0.1)",
            color: insights.aiPowered ? "#2d6b2b" : "var(--cyan)",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Bot size={12} />
          {insights.aiPowered ? "Gemini 3.8 Flash" : "Análise Determinística"}
        </span>
      </div>

      <div style={{ display: "grid", gap: "18px" }}>
        <div>
          <h3 style={{ fontSize: "15px", margin: "0 0 6px", fontWeight: "600", color: "var(--ink)" }}>
            Conexão com seu perfil
          </h3>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "var(--ink-soft)" }}>
            {insights.analysis}
          </p>
        </div>

        {insights.interviewTips.length > 0 && (
          <div>
            <h3 style={{ fontSize: "15px", margin: "0 0 8px", fontWeight: "600", color: "var(--ink)" }}>
              Pontos de foco para entrevista
            </h3>
            <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "6px", fontSize: "13px", color: "var(--ink-soft)" }}>
              {insights.interviewTips.map((tip, idx) => (
                <li key={idx} style={{ lineHeight: "1.5" }}>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ background: "#f8fafb", border: "1px solid var(--line)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--ink)", display: "flex", alignItems: "center", gap: "6px" }}>
              <MessageSquareQuote size={15} color="var(--cyan)" />
              Carta de apresentação sugerida
            </span>
            <button
              onClick={handleCopy}
              type="button"
              style={{
                border: "1px solid var(--line)",
                background: "#fff",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: copied ? "#2d6b2b" : "var(--ink)",
                fontWeight: "600",
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copiado!" : "Copiar mensagem"}
            </button>
          </div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
              fontFamily: "inherit",
              fontSize: "13px",
              lineHeight: "1.6",
              color: "var(--ink-soft)",
            }}
          >
            {insights.coverLetter}
          </pre>
        </div>
      </div>
    </section>
  );
}
