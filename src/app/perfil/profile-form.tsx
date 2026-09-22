"use client";

import { useActionState } from "react";
import { Check, CircleAlert, Loader2, Save } from "lucide-react";

import { updateProfileAction, type ProfileActionResult } from "@/app/actions/profile";
import type { ProfileInput } from "@/lib/validation";

interface ProfileFormProps {
  initialProfile: ProfileInput | null;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileActionResult | null, FormData>(
    updateProfileAction,
    null,
  );

  return (
    <form action={formAction} className="form-card">
      {state?.message && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            background: state.success ? "rgba(106, 194, 103, 0.15)" : "rgba(255, 109, 90, 0.15)",
            color: state.success ? "#2d6b2b" : "#b3261e",
            border: `1px solid ${state.success ? "rgba(106, 194, 103, 0.3)" : "rgba(255, 109, 90, 0.3)"}`,
          }}
        >
          {state.success ? <Check size={18} /> : <CircleAlert size={18} />}
          <span>{state.message}</span>
        </div>
      )}

      <div className="form-section">
        <span className="form-number">01</span>
        <div>
          <h2>Direção de carreira</h2>
          <p>Quais papéis e momentos fazem sentido agora?</p>
        </div>

        <label className="full-field">
          <span>Cargos desejados (separados por vírgula)</span>
          <input
            name="targetRoles"
            defaultValue={initialProfile?.targetRoles?.join(", ") ?? "Desenvolvedor Full Stack, Frontend Developer"}
            placeholder="Ex: Desenvolvedor Full Stack, Frontend Developer, Backend Node.js"
            required
          />
          {state?.errors?.targetRoles && (
            <small style={{ color: "var(--coral)", marginTop: "4px" }}>
              {state.errors.targetRoles.join(", ")}
            </small>
          )}
        </label>

        <label>
          <span>Senioridade desejada</span>
          <select name="seniority" defaultValue={initialProfile?.seniority ?? "JUNIOR"}>
            <option value="INTERN">Estágio</option>
            <option value="JUNIOR">Júnior</option>
            <option value="MID">Pleno</option>
            <option value="SENIOR">Sênior</option>
          </select>
        </label>

        <label>
          <span>Pretensão salarial mínima (R$)</span>
          <input
            name="minimumSalary"
            type="number"
            min="0"
            step="100"
            defaultValue={initialProfile?.minimumSalary ?? 3500}
            placeholder="Ex: 4000"
          />
        </label>
      </div>

      <div className="form-section">
        <span className="form-number">02</span>
        <div>
          <h2>Stack principal</h2>
          <p>Tecnologias que você já domina ou utiliza em projetos.</p>
        </div>

        <label className="full-field">
          <span>Competências técnicas (separadas por vírgula)</span>
          <input
            name="skills"
            defaultValue={initialProfile?.skills?.join(", ") ?? "TypeScript, React, Next.js, Node.js, PostgreSQL"}
            placeholder="Ex: TypeScript, React, Next.js, Node.js, PostgreSQL, Docker"
            required
          />
          {state?.errors?.skills && (
            <small style={{ color: "var(--coral)", marginTop: "4px" }}>
              {state.errors.skills.join(", ")}
            </small>
          )}
        </label>
      </div>

      <div className="form-section">
        <span className="form-number">03</span>
        <div>
          <h2>Localização e Modalidade</h2>
          <p>Onde e como você deseja trabalhar.</p>
        </div>

        <label className="full-field">
          <span>Localidades aceitas (separadas por vírgula)</span>
          <input
            name="locations"
            defaultValue={initialProfile?.locations?.join(", ") ?? "São Paulo, Brasil"}
            placeholder="Ex: São Paulo, Brasil, Remoto"
            required
          />
        </label>

        <div className="full-field" style={{ display: "grid", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>
            Modalidades aceitas
          </span>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "4px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="workModes"
                value="REMOTE"
                defaultChecked={initialProfile?.workModes?.includes("REMOTE") ?? true}
              />
              <span>Remoto</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="workModes"
                value="HYBRID"
                defaultChecked={initialProfile?.workModes?.includes("HYBRID") ?? true}
              />
              <span>Híbrido</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="workModes"
                value="ONSITE"
                defaultChecked={initialProfile?.workModes?.includes("ONSITE") ?? false}
              />
              <span>Presencial</span>
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="primary-button form-save"
        disabled={isPending}
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: isPending ? "not-allowed" : "pointer" }}
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="spin" />
            <span>Salvando no Neon...</span>
          </>
        ) : (
          <>
            <Save size={16} />
            <span>Salvar preferências</span>
          </>
        )}
      </button>
    </form>
  );
}
