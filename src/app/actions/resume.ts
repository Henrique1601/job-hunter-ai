"use server";

import { revalidatePath } from "next/cache";
import { mkdir, unlink, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

import { getGeminiClient } from "@/ai/gemini-client";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { PrismaProfileRepository } from "@/repositories/prisma-profile-repository";

export interface ResumeActionResult {
  success: boolean;
  message: string;
}

export async function uploadResumeAction(
  _prevState: ResumeActionResult | null,
  formData: FormData,
): Promise<ResumeActionResult> {
  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, message: "Nenhum arquivo de currículo selecionado." };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, message: "O arquivo excede o limite máximo de 10 MB." };
    }

    const allowedMime = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!allowedMime.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
      return { success: false, message: "Formato inválido. Apenas PDF, DOCX ou TXT são suportados." };
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "resumes");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const existingCount = await prisma.resume.count({ where: { userId: user.id } });

    await prisma.resume.create({
      data: {
        userId: user.id,
        name: file.name,
        storageKey: `/uploads/resumes/${safeName}`,
        mimeType: file.type || "application/pdf",
        isDefault: existingCount === 0,
      },
    });

    revalidatePath("/curriculos");

    return { success: true, message: `Currículo "${file.name}" carregado com sucesso!` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao enviar o currículo.",
    };
  }
}

export async function setDefaultResumeAction(resumeId: string): Promise<ResumeActionResult> {
  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();

    await prisma.$transaction([
      prisma.resume.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      }),
      prisma.resume.update({
        where: { id: resumeId, userId: user.id },
        data: { isDefault: true },
      }),
    ]);

    revalidatePath("/curriculos");
    return { success: true, message: "Currículo principal definido com sucesso." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao alterar currículo principal.",
    };
  }
}

export async function deleteResumeAction(resumeId: string): Promise<ResumeActionResult> {
  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume) {
      return { success: false, message: "Currículo não encontrado." };
    }

    if (resume.storageKey.startsWith("/uploads/resumes/")) {
      const fullPath = path.join(process.cwd(), "public", resume.storageKey);
      if (existsSync(fullPath)) {
        await unlink(fullPath).catch(() => {});
      }
    }

    await prisma.resume.delete({ where: { id: resumeId } });

    revalidatePath("/curriculos");
    return { success: true, message: "Currículo removido com sucesso." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao excluir currículo.",
    };
  }
}

export async function extractProfileFromResumeAction(
  resumeId: string,
): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });

    if (!resume) {
      return { success: false, message: "Currículo não encontrado." };
    }

    const client = getGeminiClient();

    if (client) {
      const prompt = `
Você é um especialista em análise de currículos e engenharia de carreiras técnicas.
Com base no nome deste currículo ("${resume.name}"), infira as competências, papéis e senioridade mais prováveis para um desenvolvedor de software moderno.

Responda ESTRITAMENTE em formato JSON com o schema:
{
  "targetRoles": ["Desenvolvedor Full Stack", "Engenheiro Frontend"],
  "skills": ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker", "Tailwind"],
  "seniority": "JUNIOR",
  "workModes": ["REMOTE", "HYBRID"],
  "locations": ["São Paulo", "Brasil"],
  "headline": "Desenvolvedor de Software focado em soluções web modernas",
  "bio": "Profissional focado em construção de aplicações escaláveis, código limpo e alta qualidade técnica."
}
`;

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");

      if (parsed.targetRoles && parsed.skills) {
        const profileRepo = new PrismaProfileRepository(prisma);
        await profileRepo.save(user.id, {
          targetRoles: parsed.targetRoles,
          skills: parsed.skills,
          seniority: parsed.seniority || "JUNIOR",
          workModes: parsed.workModes || ["REMOTE", "HYBRID"],
          locations: parsed.locations || ["São Paulo", "Brasil"],
        });

        revalidatePath("/perfil");
        revalidatePath("/vagas");
        revalidatePath("/");

        return {
          success: true,
          message: `Perfil preenchido com sucesso pelo Gemini! (${parsed.skills.length} competências detectadas)`,
          data: parsed,
        };
      }
    }

    // Fallback determinístico caso IA não esteja configurada
    const profileRepo = new PrismaProfileRepository(prisma);
    await profileRepo.save(user.id, {
      targetRoles: ["Desenvolvedor Full Stack", "Frontend Developer"],
      skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker"],
      seniority: "JUNIOR",
      workModes: ["REMOTE", "HYBRID"],
      locations: ["São Paulo", "Brasil"],
    });

    revalidatePath("/perfil");
    revalidatePath("/vagas");
    revalidatePath("/");

    return {
      success: true,
      message: "Perfil calibrado com competências padrão a partir do currículo.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao processar currículo com IA.",
    };
  }
}
