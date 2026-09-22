export interface NotificationPayload {
  title: string;
  description: string;
  score?: number;
  url?: string;
  fields?: { name: string; value: string }[];
}

export async function sendWebhookNotification(
  webhookUrl: string,
  payload: NotificationPayload,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      return { success: false, error: "URL de Webhook inválida." };
    }

    // Formato compatível com Discord Webhook e genéricos
    const isDiscord = webhookUrl.includes("discord.com/api/webhooks");

    const body = isDiscord
      ? {
          username: "Job Hunter AI",
          avatar_url: "https://raw.githubusercontent.com/Henrique1601/job-hunter-ai/main/public/favicon.ico",
          embeds: [
            {
              title: payload.title,
              description: payload.description,
              url: payload.url,
              color: payload.score && payload.score >= 80 ? 0x08a6b7 : 0xff6d5a,
              fields: [
                ...(payload.score ? [{ name: "Match Score", value: `${payload.score}%`, inline: true }] : []),
                ...(payload.fields || []).map((f) => ({ name: f.name, value: f.value, inline: true })),
              ],
              footer: {
                text: "Job Hunter AI • Radar Ativo",
              },
              timestamp: new Date().toISOString(),
            },
          ],
        }
      : {
          event: "job_hunter_alert",
          ...payload,
          timestamp: new Date().toISOString(),
        };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { success: false, error: `Servidor retornou HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Falha na conexão com o webhook.",
    };
  }
}
