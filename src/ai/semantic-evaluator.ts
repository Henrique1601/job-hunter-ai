import { getGeminiClient } from "./gemini-client";

export interface SemanticEvaluationInput {
  candidate: {
    name?: string;
    targetRoles: string[];
    skills: string[];
    seniority: string;
  };
  job: {
    title: string;
    company: string;
    description: string;
    requiredSkills: string[];
    optionalSkills: string[];
    missingSkills: string[];
  };
}

export interface SemanticEvaluationResult {
  analysis: string;
  interviewTips: string[];
  coverLetter: string;
  aiPowered: boolean;
}

export async function evaluateJobSemantics(
  input: SemanticEvaluationInput,
): Promise<SemanticEvaluationResult> {
  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `
Você é o assistente inteligente de carreira do Job Hunter AI.
Analise a compatibilidade entre o candidato e a vaga descrita abaixo.

Regras invioláveis:
1. NUNCA invente experiências, qualificações, formações ou competências que não estejam na lista de habilidades do candidato.
2. Seja direto, profissional, realista e encorajador.
3. Responda em português (pt-BR).

Dados do Candidato:
- Nome: ${input.candidate.name ?? "Candidato"}
- Cargos pretendidos: ${input.candidate.targetRoles.join(", ")}
- Senioridade: ${input.candidate.seniority}
- Competências reais dominadas: ${input.candidate.skills.join(", ")}

Dados da Vaga:
- Cargo: ${input.job.title}
- Empresa: ${input.job.company}
- Descrição da vaga: ${input.job.description}
- Competências obrigatórias: ${input.job.requiredSkills.join(", ")}
- Competências ausentes no perfil: ${input.job.missingSkills.join(", ")}

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "analysis": "um parágrafo conciso explicando por que essa vaga faz sentido e como a stack do candidato se conecta à oportunidade",
  "interviewTips": [
    "Dica 1 de estudo focando nas lacunas ou nas tecnologias centrais",
    "Dica 2 para demonstrar proficiência nos pontos fortes",
    "Dica 3 de postura ou pergunta inteligente para fazer ao entrevistador"
  ],
  "coverLetter": "Mensagem curta de apresentação e interesse profissional (1 a 2 parágrafos) pronta para ser enviada no formulário de candidatura ou mensagem no LinkedIn"
}
`;

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return {
          analysis: parsed.analysis ?? "",
          interviewTips: Array.isArray(parsed.interviewTips) ? parsed.interviewTips : [],
          coverLetter: parsed.coverLetter ?? "",
          aiPowered: true,
        };
      }
    } catch (err) {
      console.warn("Falha na chamada ao Gemini API, usando fallback determinístico:", err);
    }
  }

  // Fallback determinístico caso o Gemini não esteja configurado ou ocorra erro
  const matchingSkills = input.job.requiredSkills.filter((s) =>
    input.candidate.skills.map((c) => c.toLowerCase()).includes(s.toLowerCase()),
  );

  const analysis = `Seu perfil apresenta forte conexão com as tecnologias centrais (${matchingSkills.join(", ") || "stack da vaga"}). A oportunidade na ${input.job.company} para ${input.job.title} valoriza o momento de carreira ${input.candidate.seniority.toLowerCase()}.`;

  const interviewTips = [
    `Revise projetos práticos e conceitos arquiteturais de ${matchingSkills.slice(0, 2).join(" e ") || "sua stack principal"}.`,
    input.job.missingSkills.length > 0
      ? `Esteja preparado(a) para explicar como pretende absorver rapidamente ${input.job.missingSkills.slice(0, 2).join(", ")}.`
      : "Destaque sua experiência com testes, boas práticas de código e trabalho em equipe.",
    `Pesquise sobre os produtos recentes e modelos de negócio da ${input.job.company} para demonstrar visão de produto.`,
  ];

  const candidateName = input.candidate.name ?? "Desenvolvedor";
  const coverLetter = `Olá time da ${input.job.company}!

Gostaria de manifestar meu interesse na vaga de ${input.job.title}. Minha trajetória está focada em desenvolvimento de software com sólida vivência em ${input.candidate.skills.slice(0, 4).join(", ")}, desenvolvendo soluções orientadas a desempenho, qualidade de código e impacto real para o usuário.

Acredito que meu perfil técnico e minha motivação em aprender e construir em equipe têm grande sinergia com os desafios técnicos da ${input.job.company}. Fico à disposição para uma conversa!

Atenciosamente,
${candidateName}`;

  return {
    analysis,
    interviewTips,
    coverLetter,
    aiPowered: false,
  };
}
