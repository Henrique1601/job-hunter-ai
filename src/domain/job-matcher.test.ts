import { describe, expect, it } from "vitest";

import { matchJob } from "./job-matcher";

describe("matchJob", () => {
  it("explica um match forte usando critérios profissionais conhecidos", () => {
    const result = matchJob(
      {
        targetRoles: ["Desenvolvedor Full Stack"],
        skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        seniority: "JUNIOR",
        workModes: ["REMOTE"],
        locations: ["São Paulo"],
        minimumSalary: 3500,
      },
      {
        title: "Desenvolvedor Full Stack Júnior",
        requiredSkills: ["TypeScript", "React", "Node.js"],
        optionalSkills: ["Docker"],
        seniority: "JUNIOR",
        workMode: "REMOTE",
        location: "São Paulo",
        salaryMin: 4500,
      },
    );

    expect(result).toEqual({
      score: 95,
      strengths: [
        "3 de 3 tecnologias obrigatórias compatíveis",
        "Senioridade alinhada ao seu perfil",
        "Modalidade remoto dentro das preferências",
        "Faixa salarial acima do mínimo desejado",
      ],
      gaps: ["Docker aparece como diferencial"],
      recommendation: "HIGH_MATCH",
    });
  });
});
