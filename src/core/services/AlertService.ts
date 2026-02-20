
import { SimulationInput, ScenarioEvaluation, Alert } from '../contracts';

/**
 * Defines the contract for a service that generates financial alerts.
 * It identifies potential risks, opportunities, or inconsistencies in the user's financial data.
 */
export interface AlertService {
  /**
   * Generates alerts based on the simulation input and evaluated scenarios.
   * @param input The original simulation input.
   * @param scenarios The array of evaluated scenarios.
   * @returns A readonly array of Alert objects.
   */
  generate(input: SimulationInput, scenarios: readonly ScenarioEvaluation[]): readonly Alert[];
}
