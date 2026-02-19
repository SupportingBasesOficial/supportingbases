
import { DespesasAgrupadas } from "./DespesasAgrupadas";
import { IndicadoresSaude } from "./IndicadoresSaude";

/**
 * Um objeto de valor imutável que representa uma "fotografia" do estado financeiro em um ponto no tempo.
 * Útil para projeções e simulações sem alterar o estado real da conta.
 */
export class SnapshotFinanceiro {
  /**
   * @param receita A receita total no momento do snapshot.
   * @param despesas Um objeto com as despesas agrupadas por tipo.
   * @param reservas O total de reservas financeiras no momento do snapshot.
   */
  constructor(
    public readonly receita: number,
    public readonly despesas: DespesasAgrupadas,
    public readonly reservas: number
  ) {}

  /**
   * Retorna o valor total de todas as despesas no snapshot.
   */
  get totalDespesas(): number {
    return Object.values(this.despesas).reduce((soma, valor) => soma + (valor || 0), 0);
  }

  /**
   * Calcula e retorna os indicadores de saúde financeira para este snapshot específico.
   */
  calcularIndicadores(): IndicadoresSaude {
    const totalDespesas = this.totalDespesas;
    const fluxoDeCaixa = this.receita - totalDespesas;
    const custoEstrutural = (this.despesas.ESTRUTURAL_FIXA || 0) + (this.despesas.ESTRUTURAL_VARIAVEL || 0);
    const nivelDeReserva = custoEstrutural > 0 ? this.reservas / custoEstrutural : Infinity;

    return {
      fluxoDeCaixa,
      dividaEstrutural: totalDespesas > 0 ? (custoEstrutural / totalDespesas) * 100 : 0,
      saudeFinanceira: fluxoDeCaixa / this.receita * 100,
      nivelDeReserva,
    };
  }
}
