
import { SimulationInput, ScenarioEvaluation } from '../contracts';

/**
 * Defines the contract for a service that evaluates different financial scenarios.
 * It takes the initial input and generates multiple potential outcomes (e.g., optimistic, pessimistic).
 */
export interface ScenarioEvaluator {
  /**
   * Evaluates a set of predefined financial scenarios.
   * @param input The SimulationInput that serves as the basis for the scenarios.
   * @returns A readonly array of ScenarioEvaluation results.
   */
  evaluate(input: SimulationInput): readonly ScenarioEvaluation[];
}
