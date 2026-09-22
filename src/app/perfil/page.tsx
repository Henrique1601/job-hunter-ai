import { ProfileForm } from "./profile-form";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { PrismaProfileRepository } from "@/repositories/prisma-profile-repository";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const prisma = getPrismaClient();
  const profileRepository = new PrismaProfileRepository(prisma);

  const profile = await profileRepository.findByUserId(user.id);

  return (
    <div>
      <section className="page-heading simple-heading">
        <div>
          <p className="eyebrow">Perfil profissional</p>
          <h1>
            Ensine o radar a<br />
            <em>procurar como você.</em>
          </h1>
          <p className="heading-copy">
            Estas preferências orientam o score do Job Matcher, filtram oportunidades e garantem que o radar priorize vagas alinhadas ao seu momento.
          </p>
        </div>
      </section>

      <ProfileForm initialProfile={profile} />
    </div>
  );
}
