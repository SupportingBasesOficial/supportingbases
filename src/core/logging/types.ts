
import { SimulationInput, SupportingBasesResponse, RecommendationCategory, CenarioLabel } from '../contracts';

/**
 * Define a estrutura para um único registro de log de simulação.
 * Este é o modelo que será persistido no banco de dados para auditoria.
 */
export interface SimulationLog {
  id: string;
  userId: string;
  timestamp: Date;
  durationMs: number;
  simulationInput: SimulationInput;
  simulationResponse: SupportingBasesResponse;
}

/**
 * Define a estrutura para um único registro de log de erro.
 */
export interface ErrorLog {
  id: string;
  timestamp: Date;
  userId?: string;
  errorMessage: string;
  stackTrace?: string;
  inputPayload?: SimulationInput;
}

/**
 * Representa a contagem de uma recomendação específica.
 */
export interface FrequentRecommendation {
  category: RecommendationCategory;
  count: number;
}

/**
 * Define a estrutura do objeto de métricas agregadas.
 */
export interface SimulationMetrics {
  totalSimulations: number;
  averageDurationMs: number;
  simulationsPerDay: { date: string; count: number }[];
  frequentRecommendations: FrequentRecommendation[];
}
