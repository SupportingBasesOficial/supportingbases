
import { DespesasAgrupadas } from "../entities/DespesasAgrupadas";
import { IndicadoresSaude } from "../entities/IndicadoresSaude";

/**
 * Calcula os indicadores de saúde financeira com base nos dados atuais.
 * @param receitaMensal - A receita total do mês.
 * @param despesasAgrupadas - As despesas já agrupadas por tipo.
 * @param totalReservas - O valor total em reservas financeiras.
 * @returns Os indicadores de saúde calculados.
 */
export function calculateIndicadoresSaude(receitaMensal: number, despesasAgrupadas: DespesasAgrupadas, totalReservas: number): IndicadoresSaude {
  const totalDespesas = Object.values(despesasAgrupadas).reduce((acc, valor) => acc + (valor || 0), 0);
  const despesasEssenciais = (despesasAgrupadas.ESTRUTURAL_FIXA || 0) + (despesasAgrupadas.ESTRUTURAL_VARIAVEL || 0);
  
  const fluxoDeCaixa = receitaMensal - totalDespesas;
  const percentualComprometimentoRenda = despesasEssenciais > 0 ? (despesasEssenciais / receitaMensal) * 100 : 0;
  const nivelDeReserva = despesasEssenciais > 0 ? totalReservas / despesasEssenciais : Infinity; // Em meses

  // Cálculo do Score de Estabilidade
  const pontuacaoFluxoDeCaixa = (fluxoDeCaixa / receitaMensal) * 1000;
  const pontuacaoNivelDeReserva = Math.min(nivelDeReserva / 6, 1) * 1000;
  
  const scoreEstabilidade = Math.round((pontuacaoFluxoDeCaixa * 0.4) + (pontuacaoNivelDeReserva * 0.6));

  return {
    fluxoDeCaixa,
    scoreEstabilidade: Math.max(0, Math.min(scoreEstabilidade, 1000)), // Garante que o score fique entre 0 e 1000
    percentualComprometimentoRenda,
    nivelDeReserva,
  };
}
