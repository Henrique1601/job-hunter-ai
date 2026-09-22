# Registro de Decisões

## ADR-001 — Next.js App Router como aplicação principal

**Decisão:** usar Server Components para leitura e Server Actions para mutações internas.

**Motivo:** reduz round-trips e mantém credenciais e acesso ao banco no servidor.

## ADR-002 — Regras de negócio puras

**Decisão:** Job Matcher e Application Policy não conhecem Prisma, UI nem serviços externos.

**Motivo:** as regras ficam rápidas de testar e podem ser reutilizadas por workers.

## ADR-003 — PostgreSQL com unicidade explícita

**Decisão:** uma candidatura é única por `userId + jobId`; vagas são únicas pela origem/ID e URL canônica.

**Motivo:** prevenção de duplicidade não pode depender apenas da aplicação.

## ADR-004 — Automação com parada humana

**Decisão:** `REVIEW_REQUIRED` é um estado de primeira classe.

**Motivo:** intervenção humana é parte normal do produto, não uma exceção ou falha.

## ADR-005 — Segundo cérebro versionado com o código

**Decisão:** manter notas Markdown conectadas no repositório.

**Motivo:** arquitetura, domínio e roadmap evoluem na mesma revisão que a implementação.

## ADR-006 — Neon como PostgreSQL gerenciado

**Decisão:** usar conexão agrupada para a aplicação e conexão direta para migrations.

**Motivo:** o tráfego da aplicação reutiliza conexões, enquanto operações de schema mantêm uma sessão direta e previsível.

## ADR-007 — Server Actions para Mutações de Usuário e Candidaturas

**Decisão:** operações de alteração de preferências de perfil e preparação de candidatura passam por Server Actions (`src/app/actions/`).

**Motivo:** elimina rotas de API HTTP desnecessárias, simplifica o tratamento de formulários com `useActionState` e aciona `revalidatePath` automaticamente.

## ADR-008 — Conectores Desacoplados de Descoberta

**Decisão:** isolar fontes de vagas em classes que implementam a interface `JobDiscoveryConnector`, com ingestão centralizada em `JobDiscoveryService`.

**Motivo:** permite plugar novos portais e APIs de emprego sem alterar o pipeline central ou a lógica do banco.

## ADR-009 — Camada de Inteligência Híbrida com Gemini API

**Decisão:** integrar o SDK oficial `@google/genai` com modelo `gemini-3.8-flash` para avaliação semântica e geração de cartas de apresentação, provendo fallback determinístico quando nenhuma chave estiver configurada.

**Motivo:** enriquece a experiência do usuário com IA generativa sem quebrar o funcionamento offline ou de desenvolvimento básico.

## ADR-010 — Extração de Competências de Currículos via Gemini

**Decisão:** permitir que o usuário faça upload de currículos e dispare a extração estruturada de competências com o Gemini para auto-preenchimento do perfil.

**Motivo:** reduz a fricção de onboarding do usuário de digitar manualmente suas skills, garantindo alinhamento imediato com as vagas do radar.

## ADR-011 — Notificações em Tempo Real por Webhook

**Decisão:** disponibilizar canal de saída assíncrono via Webhooks (compatível com Discord, Telegram e Slack) para alertar sobre matches de pontuação alta e candidaturas em fase de entrevista.

**Motivo:** mantém o usuário informado no momento exato em que novas oportunidades são detectadas pelo radar ou quando um processo seletivo avança.

Relacionadas: [[Mapa da Arquitetura]] · [[Regras de Operação]] · [[Job Hunter AI Index]]
