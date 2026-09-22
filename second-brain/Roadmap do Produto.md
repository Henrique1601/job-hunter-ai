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
- [x] upload e biblioteca de currículos com metadados no Neon (`src/app/curriculos/resume-library.tsx`);
- [x] extração de competências do currículo com IA Gemini para auto-preenchimento de perfil;
- [x] modelo `UserSettings` persistido no Neon para controle de filtros e automação;
- [x] repositories Prisma;
- [x] seed de desenvolvimento;
- [x] banco PostgreSQL configurado no Neon.

## Fase 3 — Descoberta

- [x] primeiro conector para páginas públicas de carreira (`RemoteTechFeedConnector`);
- [x] conector ao vivo para API pública de vagas remotas (`LiveJobFeedConnector` - Remotive);
- [x] conector Greenhouse Boards API pública para vagas de engenharia em big techs (`GreenhouseConnector`);
- [x] conector Lever Postings API pública com extração de skills (`LeverConnector`);
- [x] conector Gupy Portal público para ecossistema corporativo tech brasileiro (`GupyConnector`);
- [x] conector GitHub Issues & repositórios open-source de vagas (`GitHubHnConnector`);
- [x] conector LinkedIn Syndication Feed para posições de software (`LinkedInFeedConnector`);
- [x] conector Indeed Syndication/RSS Feed para software e dados (`IndeedFeedConnector`);
- [x] central de conectores com execução e resolução unificada (`src/connectors/registry.ts`);
- [x] disparo manual de busca no Dashboard com feedback em tempo real (`DiscoveryTriggerButton`);
- [x] rota de API protegida para agendamento periódico via Cron (`/api/cron/discovery`);
- [x] serviço de descoberta com normalização e deduplicação (`JobDiscoveryService`);
- [x] testes unitários de ingestão, conformidade de schema Zod e idempotência.

## Fase 4 — Inteligência aplicada

- [x] integração com Google Gemini API via SDK oficial `@google/genai` (modelo `gemini-3.8-flash`);
- [x] enriquecimento semântico com análise detalhada da vaga;
- [x] gerador de pontos de foco e preparação para entrevistas;
- [x] gerador de carta de apresentação contextual sem inventar fatos;
- [x] painel visual de inteligência (`AiInsightsPanel`).

## Fase 5 — Candidatura e acompanhamento

- [x] botão interativo de preparação de candidatura com Server Actions (`ApplyButton`);
- [x] bloqueio de duplicidades e parada em `REVIEW_REQUIRED`;
- [x] quadro Kanban dinâmico com movimentação rápida entre status e exclusão;
- [x] serviço de alertas em tempo real via Webhook (Discord/Telegram) para matches fortes e entrevistas;
- [ ] integração com Gmail para leitura automática de retornos;
- [ ] conectores de candidatura permitidos;
- [ ] métricas avançadas de conversão por origem.

Relacionadas: [[Visão do Produto]] · [[Playbook de Integrações]] · [[Registro de Decisões]] · [[Mapa da Arquitetura]]
