"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { profileInputSchema } from "@/lib/validation";
import { PrismaProfileRepository } from "@/repositories/prisma-profile-repository";

export interface ProfileActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function updateProfileAction(
  _prevState: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
  try {
    const user = await getCurrentUser();
    const prisma = getPrismaClient();
    const profileRepository = new PrismaProfileRepository(prisma);

    const targetRolesRaw = formData.get("targetRoles")?.toString() || "";
    const skillsRaw = formData.get("skills")?.toString() || "";
    const seniorityRaw = formData.get("seniority")?.toString() || "JUNIOR";
    const workModesRaw = formData.getAll("workModes").map(String);
    const locationsRaw = formData.get("locations")?.toString() || "";
    const minimumSalaryRaw = formData.get("minimumSalary")?.toString();

    const parsed = profileInputSchema.safeParse({
      targetRoles: targetRolesRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      skills: skillsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      seniority: seniorityRaw,
      workModes: workModesRaw.length > 0 ? workModesRaw : ["REMOTE"],
      locations: locationsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      minimumSalary: minimumSalaryRaw ? parseInt(minimumSalaryRaw, 10) : undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Dados de perfil inválidos. Verifique os campos informados.",
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    await profileRepository.save(user.id, parsed.data);

    revalidatePath("/perfil");
    revalidatePath("/vagas");
    revalidatePath("/");

    return {
      success: true,
      message: "Preferências salvas com sucesso no banco Neon!",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao salvar o perfil.",
    };
  }
}
