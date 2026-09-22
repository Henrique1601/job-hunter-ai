import { SettingsForm } from "./settings-form";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const prisma = getPrismaClient();

  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  return (
    <div>
      <section className="page-heading simple-heading">
        <div>
          <p className="eyebrow">Configurações</p>
          <h1>
            Ritmo e limites<br />
            <em>do seu agente.</em>
          </h1>
          <p className="heading-copy">
            Ajuste a frequência de busca, determine a nota de corte para candidaturas automáticas e configure alertas em tempo real.
          </p>
        </div>
      </section>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
