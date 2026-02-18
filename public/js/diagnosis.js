/**
 * =====================================================================================
 *
 *       Filename:  diagnosis.js
 * 
 *    Description:  Versão Clássica (sem módulos) do Core de Diagnóstico.
 *                  As funções agora são globais.
 *
 * =====================================================================================
 */

/**
 * Calcula as métricas estruturais com base em uma lista de transações.
 * Foca no Índice de Compressão Financeira (ICF) do mês corrente.
 * 
 * @param {Array<object>} transactions - Lista de objetos de transação.
 * @returns {object} Um objeto contendo as métricas calculadas. Ex: { icf, totalRevenue, totalExpenses }
 */
function calculateStructuralMetrics(transactions) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalRevenue = 0;
    let totalExpenses = 0;

    // Filtra e soma as transações do mês corrente
    transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate.getUTCMonth() === currentMonth && txDate.getUTCFullYear() === currentYear) {
            if (tx.type === 'revenue') {
                totalRevenue += tx.amount;
            }
            if (tx.type === 'expense') {
                totalExpenses += tx.amount;
            }
        }
    });

    // Calcula o Índice de Compressão Financeira (ICF)
    let icf = 0;
    if (totalExpenses > 0) {
        icf = totalRevenue / totalExpenses;
    } else if (totalRevenue > 0) {
        icf = Infinity; // Estado ideal: receita sem despesas
    } else {
        icf = 1; // Estado neutro: sem receita e sem despesa
    }

    return {
        icf,
        totalRevenue,
        totalExpenses
    };
}
