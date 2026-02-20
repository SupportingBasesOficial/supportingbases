
import {
  SimulationInput,
  SupportingBasesResponse,
  ContractMetadata,
} from "../contracts";
import { ProjectionService } from "../services/ProjectionService";
import { ScenarioEvaluator } from "../services/ScenarioEvaluator";
import { RecommendationEngine } from "../services/RecommendationEngine";
import { AlertService } from "../services/AlertService";

// A versão do contrato que este use case implementa.
const CONTRACT_VERSION = "1.0.0";

/**
 * Represents the central use case for running a full financial simulation.
 * It orchestrates various domain services to generate a comprehensive financial analysis.
 */
export class SimulateFinancialStrategyUseCase {
  private readonly projectionService: ProjectionService;
  private readonly scenarioEvaluator: ScenarioEvaluator;
  private readonly recommendationEngine: RecommendationEngine;
  private readonly alertService: AlertService;

  /**
   * Constructs the use case with all its required domain service dependencies.
   * @param dependencies The services required for the use case to function.
   */
  constructor(dependencies: {
    projectionService: ProjectionService;
    scenarioEvaluator: ScenarioEvaluator;
    recommendationEngine: RecommendationEngine;
    alertService: AlertService;
  }) {
    this.projectionService = dependencies.projectionService;
    this.scenarioEvaluator = dependencies.scenarioEvaluator;
    this.recommendationEngine = dependencies.recommendationEngine;
    this.alertService = dependencies.alertService;
  }

  /**
   * Executes the financial simulation and analysis.
   * This method serves as the primary entry point for the core application logic.
   * @param input The SimulationInput contract with the user's financial parameters.
   * @param correlationId An optional ID for end-to-end request tracking.
   * @returns A promise that resolves to a full SupportingBasesResponse.
   */
  async execute(
    input: SimulationInput,
    correlationId?: string
  ): Promise<SupportingBasesResponse> {
    // 1. Orquestração da avaliação de cenários
    const cenarios = this.scenarioEvaluator.evaluate(input);

    // 2. Orquestração da geração de recomendações
    const recomendacoes = this.recommendationEngine.generate(input, cenarios);

    // 3. Orquestração da geração de alertas
    const alertas = this.alertService.generate(input, cenarios);

    // 4. Montagem dos metadados da resposta, em conformidade com o contrato.
    const metadata: ContractMetadata = {
      contractVersion: CONTRACT_VERSION,
      generatedAt: new Date().toISOString(),
      correlationId,
    };

    // 5. Retorno da resposta consolidada
    return {
      input,
      cenarios,
      recomendacoes,
      alertas,
      metadata,
    };
  }
}
