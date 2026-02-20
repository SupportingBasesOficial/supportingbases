
import { SimulationInput, SupportingBasesResponse } from '../../core/contracts';
import { SimulationRequestDTO, SimulationResponseDTO, ScenarioDTO, RecommendationDTO, AlertDTO } from '../dto';

/**
 * Mapeia um SimulationRequestDTO da camada web para um SimulationInput do core.
 * @param dto O objeto de transferência de dados da requisição.
 * @returns Um contrato de entrada para a engine.
 */
export const mapRequestToSimulationInput = (dto: SimulationRequestDTO): SimulationInput => {
  // Validações e transformações de entrada podem ser adicionadas aqui.
  return {
    patrimonioAtual: dto.patrimonioAtual,
    aporteMensal: dto.aporteMensal,
    taxaRetornoAnual: dto.taxaRetornoAnual,
    horizonteMeses: dto.horizonteMeses,
    perfilRisco: dto.perfilRisco,
  };
};

/**
 * Mapeia a resposta completa da engine (SupportingBasesResponse) para o DTO de resposta da API (SimulationResponseDTO).
 * @param coreResponse O objeto de resposta do core da aplicação.
 * @returns Um DTO pronto para ser enviado como resposta HTTP.
 */
export const mapResponseToDTO = (coreResponse: SupportingBasesResponse): SimulationResponseDTO => {
  return {
    scenarios: coreResponse.cenarios.map(s => ({
      tipo: s.tipo,
      patrimonioProjetado: s.projection.patrimonioProjetado,
      rentabilidadePercentual: s.projection.rentabilidadePercentual,
      scoreViabilidade: s.scoreViabilidade,
    } as ScenarioDTO)),
    recommendations: coreResponse.recomendacoes.map(r => ({
      nivel: r.nivel,
      mensagem: r.mensagem,
    } as RecommendationDTO)),
    alerts: coreResponse.alertas.map(a => ({
      tipo: a.tipo,
      severidade: a.severidade,
      mensagem: a.mensagem,
    } as AlertDTO)),
    metadata: {
      contractVersion: coreResponse.metadata.contractVersion,
      generatedAt: coreResponse.metadata.generatedAt,
      correlationId: coreResponse.metadata.correlationId,
    },
  };
};
