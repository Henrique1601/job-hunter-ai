---
name: job-discovery
description: Guia e procedimentos para criar, testar e manter conectores de descoberta de vagas no Job Hunter AI, com foco em normalização de dados, deduplicação canônica e respeito às plataformas.
---

# Skill: Job Discovery Connector Development

Esta skill orienta o desenvolvimento e a manutenção de conectores de busca e ingestão de vagas no **Job Hunter AI**.

## 1. Princípios Invioláveis

1. **Nunca contornar proteções ativas**: Proibido tentar bypass de CAPTCHA, autenticações não autorizadas ou burlar bloqueios de Cloudflare/Datadome.
2. **Respeito a Taxas (Rate Limits)**: Sempre aplicar espaçamento mínimo de requisições e cabeçalhos `User-Agent` identificáveis.
3. **Deduplicação Canônica**: Vagas devem sempre possuir uma URL canônica limpa (`canonicalUrl`) sem parâmetros de tracking (`utm_*`, `ref`, etc.) e um identificador composto `source + externalId`.

## 2. Contrato de um Conector

Todo novo conector deve implementar a interface `JobDiscoveryConnector` localizada em [`src/connectors/types.ts`](file:///c:/Users/conta/OneDrive/Documentos/ChatGPT/Job_hunterAI/src/connectors/types.ts):

```typescript
import type { JobInput } from "@/lib/validation";
import type { JobDiscoveryConnector, SearchCriteria } from "./types";

export class ExemploConnector implements JobDiscoveryConnector {
  readonly name = "Nome da Fonte";
  readonly sourceId = "fonte-slug";

  async discover(criteria: SearchCriteria): Promise<JobInput[]> {
    // 1. Coletar dados da API ou Feed
    // 2. Normalizar campos para JobInput
    // 3. Retornar array validado
  }
}
```

## 3. Checklist de Normalização

Para cada vaga extraída, garanta:
- `canonicalUrl`: URL final sem query params de rastreamento.
- `workMode`: Mapear com precisão para `"REMOTE" | "HYBRID" | "ONSITE"`.
- `seniority`: Mapear para `"INTERN" | "JUNIOR" | "MID" | "SENIOR"`.
- `requiresHumanReview`: Definir como `true` caso a candidatura envolva perguntas personalizadas, upload manual de portfólio ou testes externos.
- `requiredSkills`: Lista de strings normalizadas sem repetições.

## 4. Testes de Idempotência

Ao criar ou atualizar um conector:
1. Crie um teste com mock em `src/services/job-discovery-service.test.ts`.
2. Garanta que chamar `runDiscovery` duas vezes consecutivas não duplique registros no `JobRepository`.
3. Execute `npm test` para validar.
