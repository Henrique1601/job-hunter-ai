---
name: job-matcher-tuning
description: Guia de calibração e teste do algoritmo determinístico de pontuação (Job Matcher), pesagem de requisitos, senioridade, faixa salarial e prevenção de vieses.
---

# Skill: Job Matcher Tuning

Esta skill orienta o ajuste de pesos, normalização linguística e prevenção de falsos positivos/negativos no algoritmo de pontuação de vagas do **Job Hunter AI**.

## 1. Distribuição Atual de Pesos (Score de 0 a 100)

O algoritmo em [`src/domain/job-matcher.ts`](file:///c:/Users/conta/OneDrive/Documentos/ChatGPT/Job_hunterAI/src/domain/job-matcher.ts) opera com a seguinte decomposição:

| Critério | Peso Máximo | Condição |
| :--- | :---: | :--- |
| **Tecnologias Obrigatórias** | **45 pts** | Proporcional à fração de skills exigidas presentes no perfil do candidato |
| **Senioridade** | **15 pts** | Match exato entre `candidate.seniority` e `job.seniority` |
| **Modalidade** | **15 pts** | Modalidade da vaga contida na lista de preferências do candidato |
| **Localização** | **10 pts** | Localidade contida na lista de cidades/estados aceitos |
| **Faixa Salarial** | **10 pts** | Salário mínimo da vaga maior ou igual à pretensão do candidato |
| **Cargo Pretendido** | **5 pts** | Título da vaga contém um dos cargos desejados |
| **Diferenciais Ausentes** | **-5 pts** | Penalidade leve quando há diferenciais/opcionais não atendidos |

## 2. Limiares de Decisão (Recommendations)

* **`score >= 75`**: `HIGH_MATCH` (Oportunidade de alta prioridade, candidaturas automáticas podem ser permitidas se não houver etapa manual).
* **`50 <= score < 75`**: `REVIEW` (Requer avaliação humana sobre gaps técnicos ou condições limítrofes).
* **`score < 50`**: `LOW_MATCH` (Descartada ou mantida em segundo plano).

## 3. Diretrizes de Normalização Linguística

O matcher utiliza `normalize()` com NFD para remover diacríticos e acentos comuns em português:
```typescript
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}
```

Ao adicionar sinônimos (ex: `JS` -> `JavaScript`, `TS` -> `TypeScript`, `Postgres` -> `PostgreSQL`), isole a tabela de alias em um mapa determinístico testável para não gerar correspondências falsas.

## 4. Validação por Testes de Regressão

Antes de qualquer alteração de peso:
1. Adicione um caso de teste em [`src/domain/job-matcher.test.ts`](file:///c:/Users/conta/OneDrive/Documentos/ChatGPT/Job_hunterAI/src/domain/job-matcher.test.ts).
2. Execute `npm test` para certificar-se de que os scores de referência não sofreram regressão inesperada.
