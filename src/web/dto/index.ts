
import { RiskProfile, ScenarioType, RecommendationLevel, AlertType, AlertSeverity } from '../../../core/contracts';

/**
 * DTO para a requisição de uma nova simulação via HTTP.
 * Pode conter validações e transformações específicas da camada web.
 */
export interface SimulationRequestDTO {
  patrimonioAtual: number;
  aporteMensal: number;
  taxaRetornoAnual: number;
  horizonteMeses: number;
  perfilRisco: RiskProfile;
}

/**
 * DTO para representar um cenário financeiro na resposta da API.
 */
export interface ScenarioDTO {
  tipo: ScenarioType;
  patrimonioProjetado: number;
  rentabilidadePercentual: number;
  scoreViabilidade: number;
}

/**
 * DTO para uma recomendação estratégica na resposta da API.
 */
export interface RecommendationDTO {
  nivel: RecommendationLevel;
  mensagem: string;
}

/**
 * DTO para um alerta na resposta da API.
 */
export interface AlertDTO {
  tipo: AlertType;
  severidade: AlertSeverity;
  mensagem: string;
}

/**
 * DTO principal para a resposta da simulação via HTTP.
 */
export interface SimulationResponseDTO {
  scenarios: readonly ScenarioDTO[];
  recommendations: readonly RecommendationDTO[];
  alerts: readonly AlertDTO[];
  metadata: {
    readonly contractVersion: string;
    readonly generatedAt: string;
    readonly correlationId?: string;
  };
}
