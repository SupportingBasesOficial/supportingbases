
import { ContaFinanceira } from '../entities/ContaFinanceira';
import { AlertaFinanceiro, criarAlerta } from '../entities/AlertaFinanceiro';
import { MotorDeRecomendacao } from './MotorDeRecomendacao';

/**
 * Serviço responsável por gerar alertas financeiros proativos.
 */
export class ServicoDeAlertas {
    private motor: MotorDeRecomendacao;

    constructor(motor: MotorDeRecomendacao) {
        this.motor = motor;
    }

    /**
     * Gera alertas de risco, oportunidade e informativos com base na conta do usuário.
     * @param conta A conta financeira do usuário.
     * @returns Uma lista de alertas financeiros, ordenada por impacto.
     */
    gerarAlertas(conta: ContaFinanceira): AlertaFinanceiro[] {
        const alertas: AlertaFinanceiro[] = [];

        // 1. Gerar alertas de risco e oportunidade baseado no score das estratégias
        const recomendacoes = this.motor.recomendarTodasEstrategias(conta);
        recomendacoes.forEach(rec => {
            if (rec.scoreFinal < 50) { // Limiar de risco
                alertas.push(criarAlerta({
                    titulo: `Risco Detectado: Estratégia "${rec.nome}"`, 
                    descricao: `O score final projetado para esta estratégia é ${rec.scoreFinal.toFixed(2)}, indicando um potencial risco à sua estabilidade financeira.`,
                    tipo: 'risco',
                    impactoEstimado: rec.scoreFinal,
                }));
            } else if (rec.scoreFinal >= 85) { // Limiar de oportunidade
                alertas.push(criarAlerta({
                    titulo: `Oportunidade Encontrada: ${rec.nome}`,
                    descricao: `Esta estratégia possui um score alto de ${rec.scoreFinal.toFixed(2)}. Considere aplicá-la para otimizar sua saúde financeira.`,
                    tipo: 'oportunidade',
                    impactoEstimado: rec.scoreFinal,
                }));
            }
        });

        // 2. Alertas informativos (ex: saldo baixo)
        if (conta.saldo < 1000) { // Limiar de saldo baixo
            alertas.push(criarAlerta({
                titulo: 'Informativo: Saldo Baixo',
                descricao: `Seu saldo atual é de R$${conta.saldo.toFixed(2)}, o que pode requerer atenção para evitar dificuldades de liquidez.`,
                tipo: 'informativo',
                impactoEstimado: 50, // Impacto moderado
            }));
        }

        // 3. Ordenar alertas por tipo (risco > oportunidade > informativo) e depois por impacto
        alertas.sort((a, b) => {
            const tipoOrder = { 'risco': 1, 'oportunidade': 2, 'informativo': 3 };
            if (a.tipo !== b.tipo) {
                return tipoOrder[a.tipo] - tipoOrder[b.tipo];
            }
            return b.impactoEstimado - a.impactoEstimado;
        });

        return alertas;
    }
}
