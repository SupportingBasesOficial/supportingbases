import { ContaFinanceira } from '../entities/ContaFinanceira';
import { AlertaFinanceiro, criarAlerta } from '../entities/AlertaFinanceiro';
import { MotorDeRecomendacao } from './MotorDeRecomendacao';
import { ServicoHistorico } from './ServicoHistorico';

/**
 * Serviço responsável por gerar alertas financeiros proativos.
 */
export class ServicoDeAlertas {
    private motor: MotorDeRecomendacao;
    private servicoHistorico: ServicoHistorico;

    constructor(motor: MotorDeRecomendacao, servicoHistorico: ServicoHistorico) {
        this.motor = motor;
        this.servicoHistorico = servicoHistorico;
    }

    gerarAlertas(conta: ContaFinanceira): AlertaFinanceiro[] {
        const alertas: AlertaFinanceiro[] = [];

        // 1. O método foi corrigido para 'recomendarTodosOsCenarios' e as propriedades do cenário foram atualizadas.
        const recomendacoes = this.motor.recomendarTodosOsCenarios(conta);
        recomendacoes.forEach(rec => {
            if (rec.scoreFinal < 50) { // Limiar de risco
                alertas.push(criarAlerta({
                    titulo: `Risco Detectado: Estratégia "${rec.estrategia}"`,
                    descricao: `O score final projetado para esta estratégia é ${rec.scoreFinal.toFixed(2)}, indicando um potencial risco à sua estabilidade financeira.`,
                    tipo: 'risco',
                    impactoEstimado: 100 - rec.scoreFinal,
                }));
            } else if (rec.scoreFinal >= 85) { // Limiar de oportunidade
                alertas.push(criarAlerta({
                    titulo: `Oportunidade Encontrada: ${rec.estrategia}`,
                    descricao: `Esta estratégia possui um score alto de ${rec.scoreFinal.toFixed(2)}. Considere aplicá-la para otimizar sua saúde financeira.`,
                    tipo: 'oportunidade',
                    impactoEstimado: rec.scoreFinal,
                }));
            }
        });

        // 2. A propriedade 'saldo' foi corrigida para 'totalReservas' para se alinhar à entidade ContaFinanceira.
        if (conta.totalReservas < 1000) { // Limiar de saldo baixo
            alertas.push(criarAlerta({
                titulo: 'Informativo: Saldo Baixo',
                descricao: `Seu saldo atual é de R$${conta.totalReservas.toFixed(2)}, o que pode requerer atenção para evitar dificuldades de liquidez.`,
                tipo: 'informativo',
                impactoEstimado: 30, // Prioridade mais baixa
            }));
        }

        const insights = this.servicoHistorico.gerarInsightsAdaptativos();
        alertas.forEach(alerta => {
            const insight = insights.find(i => alerta.titulo.includes(i.nome));
            if (insight && insight.scoreMedio) {
                alerta.impactoEstimado *= 1 + insight.scoreMedio / 100;
            }
        });

        alertas.sort((a, b) => b.impactoEstimado - a.impactoEstimado);

        return alertas;
    }
}
