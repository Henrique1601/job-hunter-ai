# Job Hunter AI — contexto importado

## Objetivo

Construir uma plataforma inteligente que encontre vagas, analise a compatibilidade com o perfil profissional do usuário e gerencie ou automatize candidaturas quando isso for permitido pela plataforma.

O produto deve nascer preparado para múltiplos usuários e poder evoluir para um SaaS. Cada usuário terá perfil, currículos, preferências, vagas encontradas e candidaturas próprias.

## Stack planejada

- Next.js e React
- TypeScript e Node.js
- PostgreSQL e Prisma
- Zod para validação
- IA/LLM para análise semântica e explicação do match
- Workers e filas para processamento assíncrono
- Futuramente, Playwright para automações de navegador permitidas

## Escopo do MVP

1. Dashboard responsivo com métricas.
2. Autenticação preparada para múltiplos usuários.
3. Perfil profissional.
4. Upload e gerenciamento de currículos.
5. Preferências de busca por cargo, senioridade, localização, modalidade, tecnologias e salário.
6. Entidades de vaga e candidatura.
7. Job Matcher com score de 0 a 100.
8. Explicação dos pontos compatíveis e requisitos ausentes.
9. Prevenção de candidaturas duplicadas.
10. Lista e página individual de vagas.
11. Página de candidaturas.
12. Arquitetura preparada para agentes de descoberta e candidatura.

## Pipeline de candidatura

- `DISCOVERED`
- `MATCHED`
- `REVIEW_REQUIRED`
- `READY`
- `APPLIED`
- `INTERVIEW`
- `REJECTED`
- `OFFER`

## Integrações futuras

- LinkedIn
- Indeed
- Gupy
- Glassdoor
- Catho
- Páginas de carreira de empresas
- Gmail para detectar confirmações, entrevistas e rejeições

## Regras de segurança e produto

- Não contornar CAPTCHA, autenticação, rate limits ou proteções das plataformas.
- Quando houver necessidade de intervenção humana, usar `REVIEW_REQUIRED`.
- Não enviar currículos indiscriminadamente: filtrar por critérios e compatibilidade mínima.
- Registrar todo o histórico e impedir candidaturas duplicadas.

## Entregáveis técnicos esperados

- Estrutura profissional de aplicação Next.js.
- Prisma schema, migrations e seed com vagas de demonstração.
- `.env.example` e README completo.
- Separação em services e repositories.
- Tratamento de erros e validação com Zod.
- ESLint e testes das regras principais.
- Verificação final com lint, testes e build.

## Estado no momento da importação

- Projeto do ChatGPT: `JobHunterIA`.
- Conversa de origem: `Automatizar candidaturas de emprego`.
- Repositório planejado: `Henrique1601/job-hunter-ai`.
- O ChatGPT não conseguiu gravar arquivos no GitHub por falta de permissão de escrita (`403 Resource not accessible by integration`).
- Portanto, não havia implementação anterior para recuperar; o trabalho existente era o planejamento documentado acima.

## Próxima etapa sugerida

Criar o MVP funcional no repositório local, começando pela base Next.js, modelo de dados Prisma, dashboard e regras do Job Matcher.
