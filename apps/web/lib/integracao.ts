
import { ContaFinanceira } from '../../../packages/core-engine/src/domain/entities/ContaFinanceira';

/**
 * Simula a obtenção da conta financeira do usuário logado a partir de uma API.
 * Em um aplicativo real, isso faria uma chamada de rede para um backend.
 * 
 * @returns Uma promessa que resolve para uma instância de ContaFinanceira.
 */
export async function getContaUsuarioLogado(): Promise<ContaFinanceira> {
    console.log("Buscando dados financeiros do usuário...");

    // Simula um atraso de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Retorna uma conta mockada consistente para o usuário
    const contaDoUsuario = new ContaFinanceira(
        'Usuário Padrão', // nome
        5000,             // saldo inicial
        4500,             // receita mensal
        3800              // despesa mensal
    );

    console.log("Dados encontrados:", contaDoUsuario);
    return contaDoUsuario;
}
