
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

        const recomendacoes = this.motor.recomendarTodosOsCenarios(conta);
        recomendacoes.forEach(rec => {
            if (rec.scoreFinal < 50) { // Limiar de risco
                alertas.push(criarAlerta({
                    // Corrigido para usar a propriedade 'tipo' em vez de 'estrategia'.
                    titulo: `Risco Detectado: ${rec.tipo}`,
                    descricao: `O score final projetado para este cenário é ${rec.scoreFinal.toFixed(2)}, indicando um potencial risco à sua estabilidade financeira.`,
                    tipo: 'risco',
                    impactoEstimado: 100 - rec.scoreFinal,
                }));
            } else if (rec.scoreFinal >= 85) { // Limiar de oportunidade
                alertas.push(criarAlerta({
                    // Corrigido para usar a propriedade 'tipo' em vez de 'estrategia'.
                    titulo: `Oportunidade Encontrada: ${rec.tipo}`,
                    descricao: `Este cenário possui um score alto de ${rec.scoreFinal.toFixed(2)}. Considere aplicá-lo para otimizar sua saúde financeira.`,
                    tipo: 'oportunidade',
                    impactoEstimado: rec.scoreFinal,
                }));
            }
        });

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
