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

## 2. Conectores Registrados

O Job Hunter AI possui 8 conectores ativos consolidados em [`src/connectors/registry.ts`](file:///c:/Users/conta/OneDrive/Documentos/ChatGPT/Job_hunterAI/src/connectors/registry.ts):

| Conector | Fonte (`sourceId`) | Mecanismo | Escopo |
|---|---|---|---|
| `LiveJobFeedConnector` | `remotive-api` | API pública Remotive | Vagas globais e remotas de engenharia |
| `RemoteTechFeedConnector` | `remote-tech-feed` | Feeds remotos agregados | Tech jobs remotos com foco em stack moderna |
| `GreenhouseConnector` | `greenhouse` | Greenhouse Boards API | Postings de big techs e scale-ups (GitLab, Figma, Docker) |
| `LeverConnector` | `lever` | Lever Postings API | Postings públicos no Lever (Automattic, Spotify, Netflix) |
| `GupyConnector` | `gupy` | Gupy Public Portal API | Líderes tech do Brasil (PicPay, Totvs, Ambev Tech) |
| `GitHubHnConnector` | `github-hn` | GitHub Issues API | Repositórios de vagas open-source (backend-br, react-brasil) |
| `LinkedInFeedConnector` | `linkedin-feed` | Public Syndication Feed | Sindicatos públicos de posições de engenharia de software |
| `IndeedFeedConnector` | `indeed-feed` | Public RSS/Syndication | Feeds públicos de vagas de software e TI |

## 3. Contrato de um Conector

Todo novo conector deve implementar a interface `JobDiscoveryConnector` localizada em [`src/connectors/types.ts`](file:///c:/Users/conta/OneDrive/Documentos/ChatGPT/Job_hunterAI/src/connectors/types.ts):

```typescript
import type { JobInput } from "@/lib/validation";
import type { JobDiscoveryConnector, SearchCriteria } from "./types";

export class ExemploConnector implements JobDiscoveryConnector {
  readonly name = "Nome da Fonte";
  readonly sourceId = "fonte-slug";

  async discover(criteria: SearchCriteria): Promise<JobInput[]> {
    // 1. Coletar dados da API ou Feed com AbortController (timeout 4s)
    // 2. Normalizar campos para JobInput
    // 3. Incluir dataset de contingência (fallback) em caso de offline/rate-limit
    // 4. Retornar array validado
  }
}
```

## 4. Checklist de Normalização

Para cada vaga extraída, garanta:
- `canonicalUrl`: URL final sem query params de rastreamento.
- `workMode`: Mapear com precisão para `"REMOTE" | "HYBRID" | "ONSITE"`.
- `seniority`: Mapear para `"INTERN" | "JUNIOR" | "MID" | "SENIOR"`.
- `requiresHumanReview`: Definir como `true` caso a candidatura envolva perguntas personalizadas, upload manual de portfólio ou testes externos.
- `requiredSkills`: Lista de strings normalizadas sem repetições.
- `timeout & fallback`: Sempre usar `AbortController` com timeout de 4000ms e dataset de fallback para manter resiliência total em ambientes desconectados ou CI.

## 5. Testes de Idempotência e Conformidade

Ao criar ou atualizar um conector:
1. Adicione um caso de teste em [`src/connectors/connectors.test.ts`](file:///c:/Users/conta/OneDrive/Documentos/ChatGPT/Job_hunterAI/src/connectors/connectors.test.ts) validando com `jobInputSchema.safeParse(job)`.
2. Garanta que chamar `runDiscovery` duas vezes consecutivas não duplique registros no `JobRepository` (`src/services/job-discovery-service.test.ts`).
3. Execute `npm test` para validar.

