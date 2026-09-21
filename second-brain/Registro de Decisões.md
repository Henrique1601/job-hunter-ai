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

Relacionadas: [[Mapa da Arquitetura]] · [[Regras de Operação]] · [[Job Hunter AI Index]]
