"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { sendWebhookNotification } from "@/services/notification-service";

export interface SettingsActionResult {
  success: boolean;
  message: string;
}

export async function updateSettingsAction(
  _prevState: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();

    const autoDiscovery = formData.get("autoDiscovery") === "on";
    const requireHumanReview = formData.get("requireHumanReview") === "on";
    const minMatchScore = parseInt(formData.get("minMatchScore")?.toString() || "75", 10);
    const webhookUrl = formData.get("webhookUrl")?.toString().trim() || null;

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        autoDiscovery,
        requireHumanReview,
        minMatchScore,
        webhookUrl,
      },
      update: {
        autoDiscovery,
        requireHumanReview,
        minMatchScore,
        webhookUrl,
      },
    });

    revalidatePath("/configuracoes");
    revalidatePath("/");

    return {
      success: true,
      message: "Configurações atualizadas com sucesso no banco Neon!",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao salvar configurações.",
    };
  }
}

export async function testWebhookAction(
  webhookUrl: string,
): Promise<{ success: boolean; message: string }> {
  try {
    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      return { success: false, message: "Informe uma URL válida começando com http:// ou https://" };
    }

    const res = await sendWebhookNotification(webhookUrl, {
      title: "🚀 Teste de Notificação — Job Hunter AI",
      description: "Seu canal de alerta está configurado e pronto para receber notificações de vagas e entrevistas!",
      score: 95,
      fields: [
        { name: "Canal", value: "Webhook Conectado" },
        { name: "Ambiente", value: "PostgreSQL Neon (São Paulo)" },
      ],
    });

    if (!res.success) {
      return { success: false, message: `Falha ao disparar webhook: ${res.error}` };
    }

    return { success: true, message: "Mensagem de teste enviada com sucesso ao seu Webhook!" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao testar Webhook.",
    };
  }
}
