export type Seniority = "INTERN" | "JUNIOR" | "MID" | "SENIOR";
export type WorkMode = "REMOTE" | "HYBRID" | "ONSITE";

export interface CandidatePreferences {
  targetRoles: string[];
  skills: string[];
  seniority: Seniority;
  workModes: WorkMode[];
  locations: string[];
  minimumSalary?: number;
}

export interface JobCriteria {
  title: string;
  requiredSkills: string[];
  optionalSkills: string[];
  seniority: Seniority;
  workMode: WorkMode;
  location: string;
  salaryMin?: number;
}

export type MatchRecommendation = "HIGH_MATCH" | "REVIEW" | "LOW_MATCH";

export interface JobMatch {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: MatchRecommendation;
}

const workModeLabels: Record<WorkMode, string> = {
  REMOTE: "remoto",
  HYBRID: "híbrido",
  ONSITE: "presencial",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function matchJob(
  candidate: CandidatePreferences,
  job: JobCriteria,
): JobMatch {
  const skills = new Set(candidate.skills.map(normalize));
  const matchedRequired = job.requiredSkills.filter((skill) =>
    skills.has(normalize(skill)),
  );
  const missingRequired = job.requiredSkills.filter(
    (skill) => !skills.has(normalize(skill)),
  );
  const missingOptional = job.optionalSkills.filter(
    (skill) => !skills.has(normalize(skill)),
  );

  const strengths: string[] = [];
  const gaps: string[] = [];
  let score = 0;

  const skillRatio = job.requiredSkills.length
    ? matchedRequired.length / job.requiredSkills.length
    : 1;
  score += skillRatio * 45;

  if (matchedRequired.length > 0 || job.requiredSkills.length === 0) {
    strengths.push(
      `${matchedRequired.length} de ${job.requiredSkills.length} tecnologias obrigatórias compatíveis`,
    );
  }
  gaps.push(...missingRequired.map((skill) => `${skill} é requisito obrigatório`));

  if (candidate.seniority === job.seniority) {
    score += 15;
    strengths.push("Senioridade alinhada ao seu perfil");
  } else {
    gaps.push("Senioridade diferente da preferência definida");
  }

  if (candidate.workModes.includes(job.workMode)) {
    score += 15;
    strengths.push(
      `Modalidade ${workModeLabels[job.workMode]} dentro das preferências`,
    );
  } else {
    gaps.push(
      `Modalidade ${workModeLabels[job.workMode]} fora das preferências`,
    );
  }

  if (candidate.locations.some((location) => normalize(location) === normalize(job.location))) {
    score += 10;
  }

  if (
    candidate.minimumSalary === undefined ||
    (job.salaryMin !== undefined && job.salaryMin >= candidate.minimumSalary)
  ) {
    score += 10;
    strengths.push("Faixa salarial acima do mínimo desejado");
  } else {
    gaps.push("Faixa salarial abaixo do mínimo desejado");
  }

  if (
    candidate.targetRoles.some((role) => normalize(job.title).includes(normalize(role)))
  ) {
    score += 5;
  }

  if (missingOptional.length > 0) {
    score -= 5;
    gaps.push(...missingOptional.map((skill) => `${skill} aparece como diferencial`));
  }

  const roundedScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: roundedScore,
    strengths,
    gaps,
    recommendation:
      roundedScore >= 75
        ? "HIGH_MATCH"
        : roundedScore >= 50
          ? "REVIEW"
          : "LOW_MATCH",
  };
}
