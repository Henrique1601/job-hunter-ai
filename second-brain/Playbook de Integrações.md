# Playbook de Integrações

## Ordem recomendada

1. páginas públicas de carreira com HTML estável;
2. APIs oficiais e feeds públicos;
3. Gmail para atualização de status, com consentimento explícito;
4. plataformas autenticadas que ofereçam fluxo permitido;
5. browser automation apenas onde os termos e proteções permitirem.

## Contrato de um conector de descoberta

Um conector recebe critérios e devolve vagas normalizadas com fonte, identificador externo, URL canônica, título, empresa, descrição, localização e data. Ele não calcula score nem cria candidatura.

## Checklist de entrada

- termos da plataforma revisados;
- limite de requisições definido;
- estratégia de deduplicação testada;
- dados mínimos normalizados;
- erros e indisponibilidade observáveis;
- nenhuma credencial registrada em logs.

## Checklist de saída

- vaga persistida uma única vez;
- execução repetida produz o mesmo resultado;
- remoção da fonte não apaga o histórico do usuário;
- mudanças de descrição podem ser auditadas.

Relacionadas: [[Mapa da Arquitetura]] · [[Regras de Operação]] · [[Roadmap do Produto]]
