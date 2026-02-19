
# SupportingBases - Motor Financeiro Inteligente

Este projeto é uma plataforma de inteligência financeira projetada para analisar, projetar e otimizar a saúde financeira de um usuário. Ele é composto por um núcleo de motor de domínio (`core-engine`) e uma aplicação web de exemplo (`apps/web`).

## Arquitetura e Fluxo de Dados

A arquitetura foi projetada para ser modular e escalável, com uma clara separação de responsabilidades.

1.  **Entrada de Dados:** Tudo começa com a `ContaFinanceira` do usuário, que contém seu saldo, receitas e despesas.

2.  **Motor de Domínio (`packages/core-engine`):**
    *   **`IndicadoresSaude`:** A conta é analisada para gerar um conjunto de métricas financeiras (liquidez, margem de segurança, etc.).
    *   **`AvaliadorCenarios`:** Este serviço simula o futuro financeiro da conta, aplicando diferentes `EstrategiasProjecao` (ex: crescimento de receita, inflação de despesas).
    *   **`MotorDeRecomendacao`:** Utiliza o `AvaliadorCenarios` para comparar um conjunto de estratégias padrão e identificar a mais impactante para o usuário, com base no `scoreFinal` de estabilidade.

3.  **Camada de Integração (`apps/web/lib`):**
    *   A função `getRecomendacoesUsuario` atua como um adaptador, consumindo o `MotorDeRecomendacao`.
    *   Ela traduz a saída do motor para um formato simples (`RecomendacaoFormatada`) que a interface do usuário pode consumir.

4.  **Interface do Usuário (`apps/web/components`):**
    *   O componente `Recommendations.tsx` recebe a `ContaFinanceira`, chama a camada de integração e renderiza dinamicamente as recomendações, destacando a de maior impacto.

Este fluxo garante que a lógica de negócio complexa permaneça encapsulada no `core-engine`, enquanto a UI permanece simples e reativa.

## Como Executar os Testes

Para validar a integridade do sistema, execute os testes a partir da raiz do projeto:

```bash
npm test
```

## Estrutura de Pastas

- `packages/core-engine`: O núcleo da lógica de negócio.
  - `src/domain/entities`: As entidades centrais do domínio financeiro.
  - `src/domain/services`: Os serviços que orquestram a lógica de negócio.
  - `src/domain/strategies`: As estratégias de projeção modulares.
- `apps/web`: A aplicação front-end (Next.js).
  - `lib/recommendations.ts`: A camada de integração que conecta o front-end ao `core-engine`.
  - `components/Recommendations.tsx`: O componente React que exibe as recomendações.

