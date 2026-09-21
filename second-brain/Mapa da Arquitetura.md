# Mapa da Arquitetura

```text
Fontes de vagas
      │
      ▼
Discovery Connectors ──► normalização e deduplicação
      │
      ▼
Job Repository ──► Job Matcher ──► Application Policy
      │                  │                  │
      │                  ▼                  ▼
      └────────────► PostgreSQL ◄──── pipeline
                         │
                         ▼
                 Next.js App Router
                         │
                  Server Components
```

## Limites

- `src/domain`: regras puras, sem banco, HTTP ou UI.
- `src/repositories`: contratos para persistência.
- `src/services`: casos de uso que orquestram domínio e persistência.
- `src/lib`: validação e infraestrutura compartilhada.
- `src/app`: rotas, composição de páginas e ações do servidor.
- `src/components`: componentes de interface reutilizáveis.
- `prisma`: modelo, configuração e migrations.

## Decisão de dados

Leituras internas devem ocorrer em Server Components por meio de services/repositories, sem criar API HTTP desnecessária. Mutações da interface usarão Server Actions. Route Handlers ficam reservados para webhooks, conectores e clientes externos.

## Filas futuras

Discovery e preparação de candidaturas serão jobs idempotentes. Cada execução precisa de chave de deduplicação, tentativas limitadas e registro de motivo quando parar em revisão humana.

## Persistência implementada

Os repositories de perfil, vaga e candidatura usam Prisma com o adaptador `pg`. A criação de candidatura passa pelo serviço `prepareApplication`, que consulta duplicidade antes de persistir o estado decidido pela política de domínio. O banco ainda precisa de uma `DATABASE_URL` real para migrations e seed.

Relacionadas: [[Registro de Decisões]] · [[Playbook de Integrações]] · [[Linguagem do Domínio]]
