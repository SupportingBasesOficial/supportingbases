
import { ContaFinanceira } from "../entities/ContaFinanceira";
import { ServicoHistorico } from './ServicoHistorico';

// A interface Cenario foi movida para cá, pois não é mais exportada pelo Avaliador.
// A propriedade 'estrategia' foi substituída por 'tipo' para consistência.
interface Cenario {
  id: string;
  tipo: string; // Renomeado de 'estrategia'
  descricao: string;
  impactoEstimado: number;
  prioridade: number;
  risco: string;
}

interface CenarioRecomendado extends Cenario {
  scoreFinal: number;
}

export class MotorDeRecomendacao {
  private servicoHistorico: ServicoHistorico;
  private cenariosPadrao: Cenario[];

  constructor(servicoHistorico: ServicoHistorico, conta: ContaFinanceira) {
    this.servicoHistorico = servicoHistorico;
    const snapshot = conta.snapshotAtual();
    const despesasAgrupadas = snapshot.despesas;

    this.cenariosPadrao = [
      {
        id: 'reduzir-despesas',
        tipo: 'Redução de despesas variáveis', // Renomeado de 'estrategia'
        descricao: 'Diminuir gastos não essenciais em 15% para aumentar o fluxo de caixa.',
        impactoEstimado: (despesasAgrupadas.VARIAVEL_NAO_ESSENCIAL || 0) * 0.15,
        prioridade: 1, 
        risco: 'baixo'
      },
      {
        id: 'conter-inflacao-despesas',
        tipo: 'Contenção de Inflação de Despesas', // Renomeado de 'estrategia'
        descricao: 'Limitar o crescimento das despesas estruturais a 0.5% ao mês.',
        impactoEstimado: ((despesasAgrupadas.ESTRUTURAL_FIXA || 0) + (despesasAgrupadas.ESTRUTURAL_VARIAVEL || 0)) * 0.005,
        prioridade: 2,
        risco: 'baixo'
      },
      {
        id: 'aumentar-receita-moderado',
        tipo: 'Aumento de Renda Moderado', // Renomeado de 'estrategia'
        descricao: 'Buscar um aumento de receita mensal de 1%, como uma promoção ou bônus.',
        impactoEstimado: snapshot.receita * 0.01,
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
      // A lógica agora usa 'tipo' para encontrar o insight correspondente.
      const insight = insights.find(i => i.nome === cenario.tipo);
      let scoreAjustado = cenario.scoreFinal;

      if (insight && insight.scoreMedio) {
        scoreAjustado *= 1 + insight.scoreMedio / 100;
      }

      return { ...cenario, scoreFinal: scoreAjustado };
    });

    return cenariosAjustados.sort((a, b) => b.scoreFinal - a.scoreFinal);
  }
}
