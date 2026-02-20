
import {
  SimulationInput,
  ScenarioEvaluation,
  CenarioLabel,
} from "../../contracts";
import { ScenarioEvaluator } from "../ScenarioEvaluator";
import { ProjectionService } from "../ProjectionService";

/**
 * A concrete implementation of the ScenarioEvaluator.
 * It creates three standard scenarios: pessimistic, base, and optimistic,
 * by adjusting the annual return rate.
 */
export class DefaultScenarioEvaluator implements ScenarioEvaluator {
  private readonly projectionService: ProjectionService;

  /**
   * Constructs the evaluator with a dependency on a ProjectionService.
   * @param projectionService The service used to calculate the projection for each scenario.
   */
  constructor(projectionService: ProjectionService) {
    this.projectionService = projectionService;
  }

  /**
   * Evaluates pessimistic, base, and optimistic scenarios.
   * - Pessimistic: Base rate - 2%
   * - Base: Original rate
   * - Optimistic: Base rate + 2%
   * @param input The base simulation input.
   * @returns A readonly array of the three scenario evaluations.
   */
  public evaluate(input: SimulationInput): readonly ScenarioEvaluation[] {
    const { taxaRetornoAnual } = input;

    const cenarios: ScenarioEvaluation[] = [
      this.createScenario(
        input,
        CenarioLabel.PESSIMISTA,
        taxaRetornoAnual - 2
      ),
      this.createScenario(input, CenarioLabel.BASE, taxaRetornoAnual),
      this.createScenario(
        input,
        CenarioLabel.OTIMISTA,
        taxaRetornoAnual + 2
      ),
    ];

    return cenarios;
  }

  /**
   * Helper method to create a single scenario evaluation.
   * @param baseInput The original simulation input.
   * @param label The label for the new scenario.
   * @param adjustedRate The adjusted annual rate for the scenario.
   * @returns A ScenarioEvaluation object.
   */
  private createScenario(
    baseInput: SimulationInput,
    label: CenarioLabel,
    adjustedRate: number
  ): ScenarioEvaluation {
    const scenarioInput: SimulationInput = {
      ...baseInput,
      taxaRetornoAnual: Math.max(0, adjustedRate), // Ensure rate is not negative
    };

    const projection = this.projectionService.project(scenarioInput);

    return {
      label,
      taxaRetornoAnual: scenarioInput.taxaRetornoAnual,
      ...projection,
    };
  }
}
