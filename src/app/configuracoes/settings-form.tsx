"use client";

import { useActionState, useState, useTransition } from "react";
import { BellRing, Check, CircleAlert, Loader2, Save, Send } from "lucide-react";

import {
  testWebhookAction,
  updateSettingsAction,
  type SettingsActionResult,
} from "@/app/actions/settings";

interface UserSettingsData {
  autoDiscovery: boolean;
  requireHumanReview: boolean;
  minMatchScore: number;
  webhookUrl: string | null;
}

export function SettingsForm({ initialSettings }: { initialSettings: UserSettingsData | null }) {
  const [state, formAction, isPending] = useActionState<SettingsActionResult | null, FormData>(
    updateSettingsAction,
    null,
  );

  const [isTestingWebhook, startTransition] = useTransition();
  const [webhookUrl, setWebhookUrl] = useState(initialSettings?.webhookUrl || "");
  const [webhookFeedback, setWebhookFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const [minScore, setMinScore] = useState(initialSettings?.minMatchScore ?? 75);

  const handleTestWebhook = () => {
    startTransition(async () => {
      const res = await testWebhookAction(webhookUrl);
      setWebhookFeedback(res);
      setTimeout(() => setWebhookFeedback(null), 6000);
    });
  };

  return (
    <form action={formAction} className="form-card">
      {state?.message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            background: state.success ? "rgba(106, 194, 103, 0.15)" : "rgba(255, 109, 90, 0.15)",
            color: state.success ? "#2d6b2b" : "var(--coral)",
            border: `1px solid ${state.success ? "rgba(106, 194, 103, 0.3)" : "rgba(255, 109, 90, 0.3)"}`,
          }}
        >
          {state.success ? <Check size={16} /> : <CircleAlert size={16} />}
          <span>{state.message}</span>
        </div>
      )}

      <div className="setting-row">
        <div>
          <strong>Varredura e Busca Automática</strong>
          <p>Permitir que o radar descubra vagas continuamente via cron jobs.</p>
        </div>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input
            type="checkbox"
            name="autoDiscovery"
            defaultChecked={initialSettings?.autoDiscovery ?? true}
            style={{ width: "18px", height: "18px", accentColor: "var(--cyan)", cursor: "pointer" }}
          />
        </label>
      </div>

      <div className="setting-row">
        <div>
          <strong>Sempre revisar antes do envio (Candidatura Segura)</strong>
          <p>Nenhuma candidatura será submetida sem confirmação humana explícita.</p>
        </div>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input
            type="checkbox"
            name="requireHumanReview"
            defaultChecked={initialSettings?.requireHumanReview ?? true}
            style={{ width: "18px", height: "18px", accentColor: "var(--cyan)", cursor: "pointer" }}
          />
        </label>
      </div>

      <div className="setting-row" style={{ display: "block" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div>
            <strong>Pontuação Mínima para Candidatura Automática</strong>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>
              Vagas com score abaixo deste valor não avançarão automaticamente no pipeline.
            </p>
          </div>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--cyan)" }}>
            {minScore}%
          </span>
        </div>
        <input
          type="range"
          name="minMatchScore"
          min="50"
          max="95"
          step="5"
          value={minScore}
          onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
          style={{ width: "100%", accentColor: "var(--cyan)", cursor: "pointer" }}
        />
      </div>

      <div className="form-section" style={{ borderTop: "1px solid var(--line)", paddingTop: "20px", marginTop: "10px" }}>
        <span className="form-number">
          <BellRing size={18} />
        </span>
        <div>
          <h2>Notificações e Alertas em Tempo Real</h2>
          <p>Receba alertas no Discord, Slack ou Telegram quando encontrar vagas com alto match ou entrevistas.</p>
        </div>

        <label className="full-field">
          <span>URL do Webhook (Discord / Slack / Endpoint HTTP)</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              name="webhookUrl"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isTestingWebhook || !webhookUrl}
              style={{
                border: "1px solid var(--line)",
                background: "#fff",
                borderRadius: "10px",
                padding: "0 14px",
                fontSize: "12px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: isTestingWebhook || !webhookUrl ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                color: "var(--ink)",
              }}
            >
              {isTestingWebhook ? (
                <Loader2 size={14} className="spin" />
              ) : (
                <Send size={14} />
              )}
              <span>Testar Webhook</span>
            </button>
          </div>
        </label>

        {webhookFeedback && (
          <p
            style={{
              fontSize: "12px",
              margin: "4px 0 0",
              color: webhookFeedback.success ? "#2d6b2b" : "var(--coral)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {webhookFeedback.success ? <Check size={14} /> : <CircleAlert size={14} />}
            <span>{webhookFeedback.message}</span>
          </p>
        )}
      </div>

      <button
        type="submit"
        className="primary-button form-save"
        disabled={isPending}
        style={{
          marginTop: "20px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          cursor: isPending ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="spin" />
            <span>Salvando no Neon...</span>
          </>
        ) : (
          <>
            <Save size={16} />
            <span>Salvar configurações</span>
          </>
        )}
      </button>
    </form>
  );
}
