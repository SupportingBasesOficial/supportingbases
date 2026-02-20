
import { SimulationInput, SupportingBasesResponse } from "../contracts";
import { SimulateFinancialStrategyUseCase } from "../use-cases/SimulateFinancialStrategyUseCase";
import { CompoundInterestProjectionService } from "../services/implementations/CompoundInterestProjectionService";
import { DefaultScenarioEvaluator } from "../services/implementations/DefaultScenarioEvaluator";
import { DefaultRecommendationEngine } from "../services/implementations/DefaultRecommendationEngine";
import { DefaultAlertService } from "../services/implementations/DefaultAlertService";

const ENGINE_VERSION = "1.0.0";

/**
 * Represents the public interface of the SupportingBases core engine.
 */
export interface ISupportingBasesEngine {
  readonly engineVersion: string;
  simulate(
    input: SimulationInput,
    correlationId?: string
  ): Promise<SupportingBasesResponse>;
}

/**
 * @description
 * The Composition Root for the SupportingBases core engine.
 * This factory function is responsible for instantiating and wiring together all the
 * concrete implementations of the services and use cases required for the engine to run.
 * It encapsulates the object graph creation and dependency injection,
 * providing a single, simple interface to access the core logic.
 *
 * @returns An instance of ISupportingBasesEngine, ready to perform simulations.
 */
export const createSupportingBasesEngine = (): ISupportingBasesEngine => {
  // 1. Instantiate all concrete service implementations
  const projectionService = new CompoundInterestProjectionService();
  const recommendationEngine = new DefaultRecommendationEngine();
  const alertService = new DefaultAlertService();

  // 2. Inject dependencies. DefaultScenarioEvaluator depends on a projection service.
  const scenarioEvaluator = new DefaultScenarioEvaluator(projectionService);

  // 3. Instantiate the primary use case, injecting all its service dependencies.
  const simulateUseCase = new SimulateFinancialStrategyUseCase({
    projectionService,
    scenarioEvaluator,
    recommendationEngine,
    alertService,
  });

  // 4. Return the public-facing engine object, exposing only the necessary functionality.
  return Object.freeze({
    engineVersion: ENGINE_VERSION,

    /**
     * Executes the financial simulation and analysis.
     * @param input The SimulationInput contract with the user's financial parameters.
     * @param correlationId An optional ID for end-to-end request tracking.
     * @returns A promise that resolves to a full SupportingBasesResponse.
     */
    simulate: (
      input: SimulationInput,
      correlationId?: string
    ): Promise<SupportingBasesResponse> => {
      return simulateUseCase.execute(input, correlationId);
    },
  });
};
