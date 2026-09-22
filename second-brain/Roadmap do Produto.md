# Roadmap do Produto

## Fase 1 — Fundação do MVP

- [x] interface navegável e responsiva;
- [x] matcher e política de candidatura testados;
- [x] modelo de dados multiusuário;
- [x] migration inicial e validações;
- [x] segundo cérebro do projeto;
- [x] repositories Prisma e seed de desenvolvimento;
- [x] catálogo de vagas ligado à persistência real;
- [x] métricas do dashboard ligadas à persistência real;
- [x] pipeline Kanban de candidaturas ligado ao PostgreSQL Neon.

## Fase 2 — Identidade e dados

- [x] camada de resolução de identidade / autenticação multiusuário (`src/lib/auth.ts`);
- [x] CRUD do perfil profissional via Server Actions (`src/app/actions/profile.ts` e `ProfileForm`);
- [ ] upload privado de currículos (Storage S3/R2/Vercel Blob);
- [x] repositories Prisma;
- [x] seed de desenvolvimento;
- [x] configurar um banco PostgreSQL acessível no Neon.

## Fase 3 — Descoberta

- [x] primeiro conector para páginas públicas de carreira (`RemoteTechFeedConnector`);
- [x] serviço de descoberta com normalização e deduplicação (`JobDiscoveryService`);
- [x] testes unitários de ingestão e idempotência;
- [ ] execução programada com fila / workers;
- [ ] observabilidade e retentativas automáticas.

## Fase 4 — Inteligência aplicada

- [x] integração com Google Gemini API via SDK oficial `@google/genai` (modelo `gemini-3.8-flash`);
- [x] enriquecimento semântico com análise detalhada da vaga;
- [x] gerador de pontos de foco e preparação para entrevistas;
- [x] gerador de carta de apresentação contextual sem inventar fatos;
- [x] painel visual de inteligência (`AiInsightsPanel`).

## Fase 5 — Candidatura e acompanhamento

- [x] botão interativo de preparação de candidatura com Server Actions (`ApplyButton`);
- [x] bloqueio de duplicidades e parada em `REVIEW_REQUIRED`;
- [x] quadro Kanban dinâmico por etapas do pipeline;
- [ ] integração com Gmail para leitura automática de retornos;
- [ ] conectores de candidatura permitidos;
- [ ] métricas de conversão por origem.

Relacionadas: [[Visão do Produto]] · [[Playbook de Integrações]] · [[Registro de Decisões]] · [[Mapa da Arquitetura]]
