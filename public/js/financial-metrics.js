
/**
 * =====================================================================================
 *
 *       Filename:  financial-metrics.js
 *
 *    Description:  Core Mathematical Engine for SupportingBases.
 *                  This module is pure, framework-agnostic, and contains the formal
 *                  implementation of the system's core financial stability metrics.
 *
 * =====================================================================================
 */

// --- UTILITY FUNCTIONS ---

/**
 * Calculates the mean (average) of a series of numbers.
 * @param {number[]} data - An array of numbers.
 * @returns {number} The mean of the numbers.
 */
const calculateMean = (data) => {
  if (!data || data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
};

/**
 * Calculates the standard deviation of a series of numbers.
 * @param {number[]} data - An array of numbers.
 * @returns {number} The standard deviation.
 */
const calculateStdDev = (data) => {
  if (!data || data.length < 2) return 0;
  const mean = calculateMean(data);
  const squareDiffs = data.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = calculateMean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};


// --- CORE METRICS CALCULATION ---

/**
 * Calculates the core stability metrics based on the SupportingBases model.
 *
 * @param {object} financialData - The raw financial data.
 * @param {Array<object>} financialData.incomes - Array of income objects, e.g., [{amount: 5000}].
 * @param {Array<object>} financialData.expenses - Array of expense objects, e.g., [{amount: 1500, priority: 'essential'}].
 * @param {number} financialData.liquid_assets - Total emergency reserves.
 * @returns {object} A JSON object containing the calculated financial metrics.
 */
export function calculateAllMetrics({ incomes, expenses, liquid_assets }) {

  if (!incomes || !expenses || liquid_assets === undefined) {
    throw new Error('Missing required fields: incomes, expenses, liquid_assets.');
  }

  // 1. Meta Mínima Estrutural (MME)
  // The absolute minimum cost to maintain the essential structure.
  const essentialExpenses = expenses.filter(e => e.priority === 'essential');
  const mme = essentialExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 2. Receita Ajustada por Volatilidade (RAV)
  // Estimated revenue in a pessimistic scenario, penalizing volatility.
  const incomeAmounts = incomes.map(i => i.amount);
  const meanIncome = calculateMean(incomeAmounts);
  const stdDevIncome = calculateStdDev(incomeAmounts);
  const riskCoefficient = 1.5; // Conservative coefficient (k-factor)
  const rav = meanIncome - (riskCoefficient * stdDevIncome);

  // 3. Índice de Compressão Financeira (ICF) - CORRECTED FORMULA
  // The core indicator of structural pressure. ICF > 1.0 means imminent collapse.
  // FORMULA: ICF = Obligations / Risk-Adjusted Revenue
  let icf;
  if (rav <= 0) {
    // If risk-adjusted revenue is zero or negative, any essential expense leads to collapse.
    icf = (mme > 0) ? Infinity : 1.0; // If no expenses, neutral state.
  } else {
    icf = mme / rav;
  }

  // 4. Margem de Sobrevivência Dinâmica (MSD)
  // How many months of survival are guaranteed if all income ceases.
  const msd = mme > 0 ? liquid_assets / mme : Infinity;

  // 5. Elasticidade Estrutural (EE)
  // The capacity to cut costs without affecting the essential structure.
  const nonEssentialExpenses = expenses.filter(e => e.priority === 'non_essential');
  const nonEssentialSum = nonEssentialExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const ee = totalExpenses > 0 ? nonEssentialSum / totalExpenses : 0;

  const results = {
    mme: {
      value: mme,
      label: 'Meta Mínima Estrutural',
      description: 'Custo mensal mínimo para sobrevivência estrutural.'
    },
    rav: {
      value: rav,
      label: 'Receita Ajustada por Volatilidade',
      description: 'Estimativa de receita líquida em cenário pessimista.'
    },
    icf: {
      value: icf,
      label: 'Índice de Compressão Financeira',
      description: 'Pressão sobre a estrutura. > 1.0 = Colapso Iminente.'
    },
    msd: {
      value: msd,
      label: 'Margem de Sobrevivência Dinâmica',
      description: 'Meses de sobrevivência garantida sem nenhuma receita.'
    },
    ee: {
      value: ee,
      label: 'Elasticidade Estrutural',
      description: 'Capacidade de cortar custos não essenciais (0 a 1).'
    }
  };

  return results;
}
