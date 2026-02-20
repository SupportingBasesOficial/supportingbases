import { AlertaFinanceiro } from "./AlertaFinanceiro";
import { ContaFinanceira } from "./ContaFinanceira";

export interface DecisaoUsuario {
    id: string; // UUID da decisão
    tipo: 'Simulacao' | 'Avaliacao' | 'AcaoExecutada';
    data: Date;
    descricao: string;
    contaFinanceira: ContaFinanceira; // snapshot da conta no momento da decisão
    resultado?: {
        scoreFinal?: number;
        impactoEstimado?: number;
        alertaGerado?: AlertaFinanceiro;
    };
}
