
import { ContaFinanceira } from "../entities/ContaFinanceira";
import { EstrategiaProjecao } from "../strategies/EstrategiaProjecao";
import { AvaliadorCenarios } from "./AvaliadorCenarios";
import { CrescimentoReceitaMensal } from "../strategies/CrescimentoReceitaMensal";
import { InflacaoDespesasMensal } from "../strategies/InflacaoDespesasMensal";

interface EstrategiaRecomendada {
  nome: string;
  descricao: string;
  estrategias: EstrategiaProjecao[];
}

interface EstrategiaAvaliada extends EstrategiaRecomendada {
  scoreFinal: number;
}

/**
 * Motor de recomendação para sugerir as melhores estratégias financeiras.
 */
export class MotorDeRecomendacao {
  private avaliador = new AvaliadorCenarios();
  private estrategiasPadrao: EstrategiaRecomendada[];

  constructor() {
    this.estrategiasPadrao = [
      {
        nome: 'Aumento de Receita (Agressivo)',
        descricao: 'Focar em aumentar a receita em 1% ao mês.',
        estrategias: [new CrescimentoReceitaMensal(0.01)]
      },
      {
        nome: 'Contenção de Despesas (Moderada)',
        descricao: 'Aplicar uma inflação de despesas de apenas 0.2% ao mês.',
        estrategias: [new InflacaoDespesasMensal(0.002)]
      },
      {
        nome: 'Estratégia Combinada',
        descricao: 'Aumentar a receita em 0.5% e limitar a inflação de despesas a 0.3% ao mês.',
        estrategias: [new CrescimentoReceitaMensal(0.005), new InflacaoDespesasMensal(0.003)]
      }
    ];
  }

  /**
   * Avalia todas as estratégias padrão e retorna seus resultados.
   * @param conta A conta financeira atual.
   * @returns Uma lista de estratégias com seus scores de estabilidade finais.
   */
  avaliarTodasEstrategias(conta: ContaFinanceira): EstrategiaAvaliada[] {
    const cenarios = this.estrategiasPadrao.map(est => ({
      nome: est.nome,
      estrategias: est.estrategias
    }));

    const resultados = this.avaliador.comparar(conta, cenarios, 12);

    return this.estrategiasPadrao.map(estrategia => {
      const resultado = resultados.find(r => r.nome === estrategia.nome);
      return {
        ...estrategia,
        scoreFinal: resultado ? resultado.scoreFinal : 0
      };
    });
  }

  /**
   * Recomenda a melhor estratégia para uma conta financeira com base na projeção de 12 meses.
   * @param conta A conta financeira atual.
   * @returns A estratégia que resulta no maior score de estabilidade.
   */
  recomendarMelhorEstrategia(conta: ContaFinanceira): EstrategiaRecomendada {
    const resultados = this.avaliarTodasEstrategias(conta);
    const melhorResultado = resultados.reduce((melhor, atual) => {
      return atual.scoreFinal > melhor.scoreFinal ? atual : melhor;
    });

    return melhorResultado;
  }

  /**
   * Recomenda todas as estratégias avaliadas, ordenadas por score.
   * @param conta A conta financeira atual.
   * @returns Uma lista de todas as estratégias avaliadas.
   */
  recomendarTodasEstrategias(conta: ContaFinanceira): EstrategiaAvaliada[] {
    return this.avaliarTodasEstrategias(conta).sort((a, b) => b.scoreFinal - a.scoreFinal);
  }
}
