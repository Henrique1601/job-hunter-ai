# Job Hunter AI

Central inteligente para descobrir vagas, explicar compatibilidade e acompanhar candidaturas sem contornar as proteções das plataformas.

## Estado atual

Esta primeira entrega contém:

- dashboard responsivo com métricas, pipeline e movimentações;
- radar de vagas com busca e filtro por modalidade;
- página detalhada da vaga com score, pontos fortes e lacunas;
- páginas de candidaturas, perfil, currículos e configurações;
- Job Matcher determinístico com score de 0 a 100;
- política de candidatura que bloqueia duplicidades e respeita revisão humana;
- modelo multiusuário em Prisma para perfil, currículo, vaga e candidatura;
- banco Neon dedicado, com migration inicial e seed aplicados;
- catálogo e detalhe de vagas lidos do PostgreSQL em tempo real;
- contratos de repositories e validações Zod;
- testes unitários das principais regras de negócio.

O catálogo de vagas já usa dados persistidos no Neon. As demais métricas e páginas ainda combinam conteúdo demonstrativo com a fundação real do domínio. Autenticação e conectores de descoberta entram nas próximas etapas.

## Stack

- Next.js 16 e React 19
- TypeScript
- PostgreSQL e Prisma
- Zod
- Vitest
- ESLint

## Rodando localmente

```bash
npm install
copy .env.example .env
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Verificações

```bash
npm test
npm run lint
npm run build
```

## Banco de dados

Configure `DATABASE_URL` com a conexão agrupada e `DATABASE_URL_UNPOOLED` com a conexão direta no arquivo `.env`. Depois execute:

```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

O banco usa uma chave única por usuário e vaga para impedir candidaturas duplicadas. Vagas também são deduplicadas pela fonte/identificador externo e URL canônica.

## Princípios de automação

- nunca contornar CAPTCHA, autenticação, rate limits ou proteções;
- parar em `REVIEW_REQUIRED` quando houver ação humana;
- enviar apenas candidaturas compatíveis com os critérios definidos;
- manter rastreabilidade das decisões e do status do pipeline.

## Próximas etapas

1. ligar as métricas restantes do dashboard aos repositories Prisma;
2. adicionar autenticação e upload real de currículos;
3. criar o primeiro Job Discovery Connector para páginas de carreira;
4. integrar um LLM para análise semântica complementar;
5. adicionar workers, filas e notificações.

## Segundo cérebro

O conhecimento vivo do projeto começa em [`second-brain/Job Hunter AI Index.md`](second-brain/Job%20Hunter%20AI%20Index.md). As notas usam wikilinks do Obsidian e permanecem versionadas junto com o código.
