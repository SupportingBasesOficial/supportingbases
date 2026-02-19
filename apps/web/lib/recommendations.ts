
import { ContaFinanceira } from "../../../packages/core-engine/src/domain/entities/ContaFinanceira";
import { MotorDeRecomendacao } from "../../../packages/core-engine/src/domain/services/MotorDeRecomendacao";

// Formato esperado pelo front-end
interface RecomendacaoFormatada {
  titulo: string;
  descricao: string;
  impactoEstimado: number; // Alterado para número para permitir ordenação
}

/**
 * Consome o MotorDeRecomendacao e entrega as recomendações no formato 
 * esperado pelo front-end.
 * 
 * @param conta A conta financeira do usuário.
 * @returns Uma lista de recomendações formatadas para a UI.
 */
export function getRecomendacoesUsuario(conta: ContaFinanceira): RecomendacaoFormatada[] {
  const motor = new MotorDeRecomendacao();
  // O método do motor agora deve retornar todas as estratégias avaliadas com seus scores
  const estrategiasAvaliadas = motor.avaliarTodasEstrategias(conta);

  // Mapeia o resultado do motor para o formato que a UI espera.
  const recomendacoesFormatadas = estrategiasAvaliadas.map(estrategia => ({
    titulo: estrategia.nome,
    descricao: estrategia.descricao,
    impactoEstimado: estrategia.scoreFinal // Usando o score final como o impacto
  }));

  return recomendacoesFormatadas;
}
