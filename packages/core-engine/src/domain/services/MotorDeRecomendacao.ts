import { ContaFinanceira } from "../entities/ContaFinanceira";
import { Cenario } from "./AvaliadorCenarios";
import { ServicoHistorico } from './ServicoHistorico';

/**
 * Define uma recomendação de cenário completa, incluindo seu score e metadados.
 */
interface CenarioRecomendado extends Cenario {
  scoreFinal: number;
}

/**
 * Motor de recomendação para sugerir os melhores cenários financeiros.
 */
export class MotorDeRecomendacao {
  private servicoHistorico: ServicoHistorico;
  private cenariosPadrao: Cenario[];

  constructor(servicoHistorico: ServicoHistorico, conta: ContaFinanceira) {
    this.servicoHistorico = servicoHistorico;

    // Gera um snapshot para obter os dados financeiros atuais da conta de forma segura.
    const snapshot = conta.snapshotAtual();
    const despesasAgrupadas = snapshot.despesas;

    // Os cenários agora são calculados com base nos dados corretos do snapshot.
    this.cenariosPadrao = [
      {
        id: 'reduzir-despesas',
        estrategia: 'Redução de despesas variáveis',
        descricao: 'Diminuir gastos não essenciais em 15% para aumentar o fluxo de caixa.',
        impactoEstimado: (despesasAgrupadas.VARIAVEL_NAO_ESSENCIAL || 0) * 0.15,
        scoreFinal: 0,
        prioridade: 1, 
        risco: 'baixo'
      },
      {
        id: 'conter-inflacao-despesas',
        estrategia: 'Contenção de Inflação de Despesas',
        descricao: 'Limitar o crescimento das despesas estruturais a 0.5% ao mês.',
        impactoEstimado: ((despesasAgrupadas.ESTRUTURAL_FIXA || 0) + (despesasAgrupadas.ESTRUTURAL_VARIAVEL || 0)) * 0.005,
        scoreFinal: 0,
        prioridade: 2,
        risco: 'baixo'
      },
      {
        id: 'aumentar-receita-moderado',
        estrategia: 'Aumento de Renda Moderado',
        descricao: 'Buscar um aumento de receita mensal de 1%, como uma promoção ou bônus.',
        impactoEstimado: snapshot.receita * 0.01,
        scoreFinal: 0,
        prioridade: 3,
        risco: 'medio'
      }
    ];
  }

  recomendarMelhorCenario(conta: ContaFinanceira): CenarioRecomendado {
    const recomendacoes = this.recomendarTodosOsCenarios(conta);
    return recomendacoes[0];
  }

  recomendarTodosOsCenarios(conta: ContaFinanceira): CenarioRecomendado[] {
    const cenariosAvaliados: CenarioRecomendado[] = this.cenariosPadrao.map(c => ({
      ...c,
      scoreFinal: Math.random() * 100 
    }));

    const insights = this.servicoHistorico.gerarInsightsAdaptativos();

    const cenariosAjustados = cenariosAvaliados.map(cenario => {
      const insight = insights.find(i => i.nome === cenario.estrategia);
      let scoreAjustado = cenario.scoreFinal;

      if (insight && insight.scoreMedio) {
        scoreAjustado *= 1 + insight.scoreMedio / 100;
      }

      return { ...cenario, scoreFinal: scoreAjustado };
    });

    return cenariosAjustados.sort((a, b) => b.scoreFinal - a.scoreFinal);
  }
}
