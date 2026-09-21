# Regras de Operação

## Princípios invioláveis

1. Não contornar CAPTCHA, autenticação, rate limits ou barreiras da plataforma.
2. Não enviar uma candidatura duplicada para o mesmo usuário e vaga.
3. Não inventar experiência, formação ou competência no currículo.
4. Parar em `REVIEW_REQUIRED` sempre que houver dúvida, confirmação ou ação pessoal.
5. Registrar a origem, decisão, score e documento usado em cada candidatura.

## Critérios mínimos

Um match forte começa em 75 pontos. O limiar é configurável no futuro, mas qualquer automatização também deve respeitar cargo, modalidade e salário definidos pelo usuário.

## Falhas

Uma falha de conector não pode alterar candidatura para `APPLIED`. Apenas uma confirmação verificável permite essa transição. Retentativas precisam ser idempotentes e ter limite.

## Privacidade

Currículos e dados pessoais são privados por padrão. Logs não devem armazenar documentos completos, respostas sensíveis nem credenciais.

Relacionadas: [[Linguagem do Domínio]] · [[Playbook de Integrações]] · [[Registro de Decisões]]
