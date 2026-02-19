
import { v4 as uuidv4 } from 'uuid';

/**
 * Representa um alerta financeiro gerado para o usuário.
 * Pode ser um risco, uma oportunidade ou um informativo.
 */
export interface AlertaFinanceiro {
    id: string; // UUID único do alerta
    titulo: string; // Resumo do alerta
    descricao: string; // Detalhes do alerta
    tipo: 'risco' | 'oportunidade' | 'informativo';
    impactoEstimado: number; // Score do MotorDeRecomendacao ou outra métrica
    dataGeracao: Date;
    lido: boolean; // Marca se o usuário já visualizou o alerta
}

/**
 * Factory function para criar um novo AlertaFinanceiro com um ID único.
 */
export function criarAlerta(alerta: Omit<AlertaFinanceiro, 'id' | 'lido' | 'dataGeracao'>): AlertaFinanceiro {
    return {
        ...alerta,
        id: uuidv4(),
        dataGeracao: new Date(),
        lido: false,
    };
}
