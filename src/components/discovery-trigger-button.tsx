"use client";

import { useState, useTransition } from "react";
import { Check, CircleAlert, Loader2, Radar } from "lucide-react";

import { triggerDiscoveryAction } from "@/app/actions/discovery";

export function DiscoveryTriggerButton() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ message: string; success: boolean } | null>(null);

  const handleDiscovery = () => {
    startTransition(async () => {
      const result = await triggerDiscoveryAction();
      setFeedback({ message: result.message, success: result.success });
      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    });
  };

  return (
    <div style={{ display: "grid", gap: "6px", width: "100%" }}>
      <button
        onClick={handleDiscovery}
        disabled={isPending}
        aria-label="Executar busca de vagas no radar"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          cursor: isPending ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="spin" />
            <span>Varrendo radar...</span>
          </>
        ) : (
          <>
            <Radar size={17} />
            <span>Buscar agora</span>
          </>
        )}
      </button>

      {feedback && (
        <div
          style={{
            fontSize: "11px",
            padding: "6px 8px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: feedback.success ? "rgba(106, 194, 103, 0.15)" : "rgba(255, 109, 90, 0.15)",
            color: feedback.success ? "#2d6b2b" : "var(--coral)",
          }}
        >
          {feedback.success ? <Check size={13} /> : <CircleAlert size={13} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
