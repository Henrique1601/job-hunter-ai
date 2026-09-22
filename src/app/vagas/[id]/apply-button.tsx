"use client";

import { useState, useTransition } from "react";
import { Check, CheckCircle2, CircleAlert, Loader2, SendHorizontal, ShieldAlert } from "lucide-react";

import { prepareApplicationAction } from "@/app/actions/application";

interface ApplyButtonProps {
  jobExternalId: string;
  initialStatus?: string;
  requiresHumanReview: boolean;
}

export function ApplyButton({
  jobExternalId,
  initialStatus,
  requiresHumanReview,
}: ApplyButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | undefined>(initialStatus);
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);

  const isAlreadyProcessed =
    status === "READY" ||
    status === "REVIEW_REQUIRED" ||
    status === "APPLIED" ||
    status === "INTERVIEW" ||
    status === "OFFER";

  const handleApply = () => {
    startTransition(async () => {
      const result = await prepareApplicationAction(jobExternalId);
      setFeedback({ message: result.message, success: result.success });
      if (result.success && result.status) {
        setStatus(result.status);
      }
    });
  };

  return (
    <div style={{ display: "grid", gap: "10px", width: "100%" }}>
      {isAlreadyProcessed ? (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: status === "REVIEW_REQUIRED" ? "rgba(255, 109, 90, 0.12)" : "rgba(8, 166, 183, 0.12)",
            color: status === "REVIEW_REQUIRED" ? "var(--coral)" : "var(--cyan)",
            border: `1px solid ${status === "REVIEW_REQUIRED" ? "rgba(255, 109, 90, 0.3)" : "rgba(8, 166, 183, 0.3)"}`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {status === "REVIEW_REQUIRED" ? (
            <>
              <ShieldAlert size={16} />
              <span>No seu pipeline: aguarda sua revisão</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>Candidatura registrada no pipeline ({status})</span>
            </>
          )}
        </div>
      ) : (
        <button
          className="primary-button"
          onClick={handleApply}
          disabled={isPending}
          style={{
            cursor: isPending ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="spin" />
              <span>Preparando no banco Neon...</span>
            </>
          ) : (
            <>
              <SendHorizontal size={16} />
              <span>{requiresHumanReview ? "Preparar para revisão" : "Preparar candidatura"}</span>
            </>
          )}
        </button>
      )}

      {feedback && (
        <p
          style={{
            fontSize: "12px",
            margin: "0",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: feedback.success ? "#2d6b2b" : "var(--coral)",
          }}
        >
          {feedback.success ? <Check size={14} /> : <CircleAlert size={14} />}
          <span>{feedback.message}</span>
        </p>
      )}
    </div>
  );
}
