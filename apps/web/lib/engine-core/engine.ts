
// MÓDULO 1 — ENGINE CORE (Engenharia Anticolapso)
// Este módulo garante a sobrevivência estrutural e a estabilidade financeira.

/**
 * Representa os dados de entrada para os cálculos do Engine Core.
 * Estes dados devem ser coletados do usuário e do sistema.
 */
interface CoreEngineInput {
  receitaMensal: number;
  despesasFixasEssenciais: number; // Obrigações críticas (moradia, alimentação)
  despesasVariaveis: number;
  totalDeAtivos: number;
  totalDePassivos: number;
}

/**
 * Calcula a Meta Mínima Estrutural Dinâmica.
 * Este é o valor mínimo que o usuário precisa para manter sua estrutura funcionando
 * sem entrar em colapso. É a base da pirâmide de sobrevivência.
 * @param input - Os dados financeiros do usuário.
 * @returns O valor da meta mínima estrutural.
 */
export function calculateMetaMinima(input: CoreEngineInput): number {
  // Fórmula inicial: Soma das despesas fixas essenciais com uma margem de segurança.
  const margemDeSeguranca = 0.1; // 10% de margem de segurança
  const metaMinima = input.despesasFixasEssenciais * (1 + margemDeSeguranca);
  return metaMinima;
}

/**
 * Executa um Stress Test de Receita.
 * Simula o impacto de uma perda de receita na estrutura financeira do usuário.
 * @param input - Os dados financeiros do usuário.
 * @param percentualDePerda - O percentual de perda de receita a ser simulado (ex: 0.3 para 30%).
 * @returns Um objeto com o resultado do stress test.
 */
export function runStressTest(input: CoreEngineInput, percentualDePerda: number): { podeSuportar: boolean; deficit: number } {
  const receitaSimulada = input.receitaMensal * (1 - percentualDePerda);
  const despesasTotais = input.despesasFixasEssenciais + input.despesasVariaveis;
  const podeSuportar = receitaSimulada >= despesasTotais;
  const deficit = podeSuportar ? 0 : despesasTotais - receitaSimulada;

  return { podeSuportar, deficit };
}

/**
 * Calcula o Índice de Compressão.
 * Mede o quanto a estrutura do usuário pode ser "comprimida" em caso de emergência
 * antes de atingir o núcleo de obrigações críticas.
 * @param input - Os dados financeiros do usuário.
 * @returns O índice de compressão como um fator (ex: 1.5).
 */
export function calculateIndiceCompressao(input: CoreEngineInput): number {
  if (input.despesasFixasEssenciais === 0) {
    return Infinity; // Evita divisão por zero se não houver despesas essenciais.
  }
  const despesasTotais = input.despesasFixasEssenciais + input.despesasVariaveis;
  const indice = despesasTotais / input.despesasFixasEssenciais;
  return indice;
}
