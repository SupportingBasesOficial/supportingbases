
import { ContaFinanceira } from "../entities/ContaFinanceira";
import { Despesa } from "../entities/Despesa";

// Interface para representar um cenário nomeado, mantendo a entidade ContaFinanceira limpa.
interface CenarioNomeado {
  nome: string;
  conta: ContaFinanceira;
}

export class AvaliadorCenarios {
  /**
   * Compara uma lista de cenários financeiros nomeados contra uma conta base.
   */
  public compararCenarios(
    contaBase: ContaFinanceira,
    cenarios: CenarioNomeado[],
    meses: number
  ): { nome: string; saldoProjetado: number; variacao: number; tipo: string; descricao: string }[] {
    
    const calcularTotalDespesas = (despesas: readonly Despesa[]): number => {
        return despesas.reduce((total, d) => total + d.valor, 0);
    };

    return cenarios.map(({ nome, conta }) => {
      // Usa totalReservas e calcula as despesas do array
      const despesaMensalCenario = calcularTotalDespesas(conta.despesas);

      const saldoProjetado =
        conta.totalReservas + (conta.receitaMensal - despesaMensalCenario) * meses;

      const variacao = saldoProjetado - contaBase.totalReservas;

      const tipo =
        variacao > 100 ? 'oportunidade' :
        variacao < -100 ? 'risco' :
        'informativo';

      return {
        nome,
        saldoProjetado,
        variacao,
        tipo,
        descricao: `Após ${meses} meses, o saldo projetado será de R$ ${saldoProjetado.toFixed(2)}.`
      };
    });
  }
}
