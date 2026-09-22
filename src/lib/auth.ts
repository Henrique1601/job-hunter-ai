import { cookies } from "next/headers";

import { getPrismaClient } from "@/lib/prisma";

export const DEFAULT_USER_EMAIL = "henrique@example.com";
export const SESSION_COOKIE_NAME = "job_hunter_user_email";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Obtém o usuário da sessão atual.
 * Caso nenhum cookie de sessão seja encontrado, usa o usuário padrão de desenvolvimento.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const prisma = getPrismaClient();
  let userEmail = DEFAULT_USER_EMAIL;

  try {
    const cookieStore = await cookies();
    const cookieEmail = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (cookieEmail) {
      userEmail = cookieEmail;
    }
  } catch {
    // Caso esteja rodando fora de contexto de requisição HTTP (ex: testes ou scripts), usa o fallback padrão
  }

  let user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    user = await prisma.user.upsert({
      where: { email: DEFAULT_USER_EMAIL },
      update: {},
      create: {
        email: DEFAULT_USER_EMAIL,
        name: "Henrique Silva",
      },
      select: { id: true, email: true, name: true },
    });
  }

  return user;
}
