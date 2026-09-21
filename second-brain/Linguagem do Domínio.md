# Linguagem do Domínio

## Entidades

- **Usuário**: dono isolado de perfil, currículos e candidaturas.
- **Perfil**: objetivos, senioridade, stack, localização, modalidade e salário mínimo.
- **Currículo**: documento-base ou versão direcionada usada numa candidatura.
- **Vaga**: oportunidade canônica descoberta em uma fonte externa.
- **Match**: análise entre perfil e vaga, composta por score, forças e lacunas.
- **Candidatura**: relação única entre usuário e vaga ao longo do pipeline.

## Pipeline

- `DISCOVERED`: vaga coletada, ainda não analisada.
- `MATCHED`: análise concluída, mas sem prontidão para envio.
- `REVIEW_REQUIRED`: existe uma etapa que depende da pessoa.
- `READY`: candidatura compatível e pronta para ser preparada/enviada.
- `APPLIED`: envio confirmado.
- `INTERVIEW`: processo avançou para conversa com recrutamento ou equipe.
- `REJECTED`: processo encerrado sem oferta.
- `OFFER`: oferta recebida.

## Vocabulário da interface

Usar “Sua revisão” em vez de “erro de automação”. Usar “Preparar candidatura” antes de qualquer ação irreversível. Explicar “lacunas” sem classificar a pessoa como inadequada.

Relacionadas: [[Mapa da Arquitetura]] · [[Regras de Operação]]
