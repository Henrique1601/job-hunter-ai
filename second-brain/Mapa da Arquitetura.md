# Mapa da Arquitetura

```text
Fontes de vagas (APIs / Portais)
      │
      ▼
Discovery Connectors ──► normalização e deduplicação (`src/connectors`)
      │
      ▼
Job Repository ──► Job Matcher ──► Application Policy
      │                  │                  │
      │                  ▼                  ▼
      └────────────► PostgreSQL ◄──── pipeline
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
   Next.js App Router             Gemini AI (`src/ai`)
            │                           │
    Server Components                   │
    & Server Actions                    ▼
            │               Insights & Cover Letters
            ▼                           │
       Interface ◄──────────────────────┘
```

## Limites de Responsabilidade

- `src/domain`: regras de negócio puras (matcher e policy), sem banco, HTTP ou UI.
- `src/repositories`: contratos e implementações Prisma para persistência.
- `src/services`: casos de uso que orquestram domínio, persistência, métricas e descoberta.
- `src/connectors`: adaptadores externos de extração e normalização de vagas.
- `src/ai`: cliente Gemini API (`@google/genai`), avaliação semântica e geração de cartas.
- `src/lib`: validação com Zod, cliente Prisma e autenticação.
- `src/app/actions`: Server Actions para mutação de dados (perfil, candidaturas).
- `src/app`: rotas e composição de páginas Server-First.
- `src/components`: componentes visuais e client components interativos.
- `.agents`: skills e definição do agente autônomo `job-hunter-agent`.
- `prisma`: modelo de dados, configuração e migrations Neon.

## Decisão de dados

Leituras internas ocorrem em Server Components por meio de services/repositories, sem criar API HTTP desnecessária. Mutações da interface usam Server Actions com `useActionState` e revalidação de caminhos.

## Persistência e Inteligência Conectadas

Os repositories de perfil, vaga e candidatura usam Prisma com o banco Neon dedicado em São Paulo. O catálogo, dashboard, candidaturas e detalhes de vagas operam 100% integrados ao banco em tempo real. A camada de inteligência com Gemini 3.8 Flash oferece análise semântica e dicas para entrevistas de forma ética e determinística.

Relacionadas: [[Registro de Decisões]] · [[Playbook de Integrações]] · [[Linguagem do Domínio]] · [[Roadmap do Produto]]
