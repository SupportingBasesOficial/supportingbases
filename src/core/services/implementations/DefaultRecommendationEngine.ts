
import {
  SimulationInput,
  ScenarioEvaluation,
  StrategicRecommendation,
  CenarioLabel,
  RecommendationCategory,
} from "../../contracts";
import { RecommendationEngine } from "../RecommendationEngine";

/**
 * A default implementation of the RecommendationEngine.
 * It generates strategic recommendations based on viability and risk scores
 * derived from the scenario evaluations.
 */
export class DefaultRecommendationEngine implements RecommendationEngine {
  /**
   * Generates recommendations by analyzing the spread between optimistic and pessimistic scenarios.
   * @param input The original simulation input.
   * @param scenarios The array of evaluated scenarios.
   * @returns A readonly array of strategic recommendations.
   */
  public generate(
    input: SimulationInput,
    scenarios: readonly ScenarioEvaluation[]
  ): readonly StrategicRecommendation[] {
    const recommendations: StrategicRecommendation[] = [];

    const baseScenario = scenarios.find((s) => s.label === CenarioLabel.BASE);
    const optimisticScenario = scenarios.find((s) => s.label === CenarioLabel.OTIMISTA);
    const pessimisticScenario = scenarios.find((s) => s.label === CenarioLabel.PESSIMISTA);

    if (!baseScenario || !optimisticScenario || !pessimisticScenario) {
      return []; // Should not happen with DefaultScenarioEvaluator
    }

    // --- Viability Score Calculation ---
    // Compare the projected wealth against the financial goal.
    const viabilityRatio = baseScenario.patrimonioProjetado / input.metaFinanceira;
    const scoreViabilidade = Math.min(1, Math.max(0, viabilityRatio)); // Score between 0 and 1

    // --- Risk Score Calculation ---
    // Measure the volatility or uncertainty by comparing the spread of outcomes.
    const spread = optimisticScenario.patrimonioProjetado - pessimisticScenario.patrimonioProjetado;
    const riscoEstimado = spread / baseScenario.patrimonioProjetado; // Relative risk

    // --- Recommendation Logic ---
    if (scoreViabilidade < 0.5) {
      recommendations.push({
        category: RecommendationCategory.AJUSTE_ESTRATEGIA,
        title: "Revisão de Estratégia Necessária",
        description:
          `Sua meta de R$ ${input.metaFinanceira.toLocaleString("pt-BR")} está distante. Aumentar o aporte mensal ou o horizonte de tempo pode ser crucial.`,
        scoreViabilidade,
        riscoEstimado,
      });
    } else if (scoreViabilidade < 0.9) {
      recommendations.push({
        category: RecommendationCategory.OTIMIZACAO_CARTEIRA,
        title: "Otimização de Carteira Sugerida",
        description:
          `Você está no caminho certo, mas pode não atingir 100% da meta. Considere otimizar seus investimentos para buscar uma rentabilidade maior ou aumentar seus aportes.`,
        scoreViabilidade,
        riscoEstimado,
      });
    } else {
      recommendations.push({
        category: RecommendationCategory.MANUTENCAO_PLANO,
        title: "Plano Financeiro Sólido",
        description:
          "Parabéns! Sua estratégia atual tem alta probabilidade de atingir ou superar sua meta financeira. Mantenha a disciplina.",
        scoreViabilidade,
        riscoEstimado,
      });
    }

    if (riscoEstimado > 0.4) {
        recommendations.push({
            category: RecommendationCategory.GESTAO_RISCO,
            title: "Volatilidade da Carteira Elevada",
            description: "A diferença entre os cenários otimista e pessimista é significativa, indicando um risco maior. Considere diversificar seus investimentos para mitigar possíveis perdas.",
            scoreViabilidade,
            riscoEstimado,
        });
    }

    return Object.freeze(recommendations);
  }
}
