---
name: career-ops-assistant
description: Diretrizes operacionais para geração de pitch de apresentação, análise de fit cultural e técnico e aplicação segura de candidaturas no Job Hunter AI.
---

# Skill: Career Operations Assistant

Esta skill define as melhores práticas para conduzir o ciclo de vida de candidaturas, geração de cartas de apresentação personalizadas e suporte à preparação para entrevistas de emprego.

## 1. Princípios Éticos

1. **Fidelidade aos Fatos**: Jamais adicionar tecnologias, experiências fictícias ou formação inventada em cartas de apresentação ou currículos gerados por IA.
2. **Contextualização com a Empresa**: A IA deve cruzar a dor descrita na vaga (ex: "escalar microsserviços", "refatorar frontend") com projetos reais comprováveis do candidato.
3. **Tom de Voz Profissional**: O tom deve ser direto, confiante, humilde e objetivo, evitando jargões vazios ou adulação excessiva.

## 2. Checklist da Candidatura Segura

Antes de transicionar qualquer vaga para envio:
- [ ] O score de match atinge o limiar mínimo definido pelo usuário.
- [ ] A vaga não foi submetida previamente por este usuário (chave `userId + jobId`).
- [ ] Se a vaga tiver `requiresHumanReview: true`, a aplicação deve permanecer em `REVIEW_REQUIRED` até o usuário aprovar manualmente.
- [ ] O currículo associado está atualizado e sem informações divergentes.

## 3. Estrutura Recomendada para Mensagens de Abordagem

Ao gerar mensagens de primeiro contato (LinkedIn / Email / Formulário):
1. **Saudação objetiva e menção ao papel**: "Olá [Nome/Time], vi a oportunidade de [Cargo] na [Empresa] e identifiquei grande alinhamento com meus projetos recentes."
2. **Conexão técnica direta**: "Nos últimos projetos, atuei diretamente com [Stack chave], construindo [exemplo prático de entrega relevante]."
3. **Chamada para ação cordial**: "Gostaria de trocar uma ideia rápida para entender os desafios atuais do squad. Fico à disposição!"
