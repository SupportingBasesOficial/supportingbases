
import { SimulationInput, ScenarioEvaluation, StrategicRecommendation } from '../contracts';

/**
 * Defines the contract for an engine that generates strategic financial recommendations.
 * It analyzes scenario evaluations to provide actionable advice.
 */
export interface RecommendationEngine {
  /**
   * Generates strategic recommendations based on the evaluated scenarios.
   * @param input The original simulation input.
   * @param scenarios The array of evaluated scenarios.
   * @returns A readonly array of StrategicRecommendation objects.
   */
  generate(input: SimulationInput, scenarios: readonly ScenarioEvaluation[]): readonly StrategicRecommendation[];
}
