
// MÓDULO 2 — GESTÃO FINANCEIRA DE PONTA
// Este módulo fornece ferramentas para gestão financeira avançada, indo além do simples controle de gastos.

/**
 * Define os tipos de despesa para classificação inteligente.
 * - ESTRUTURAL_FIXA: Obrigações críticas e inadiáveis (aluguel, condomínio).
 * - ESTRUTURAL_VARIAVEL: Essenciais, mas com alguma flexibilidade (supermercado, transporte).
 * - VARIAVEL_NAO_ESSENCIAL: Despesas que podem ser cortadas em emergências (lazer, assinaturas).
 * - EXPENSAO: Investimentos e despesas para crescimento (cursos, novos negócios).
 */
export type TipoDespesa = 'ESTRUTURAL_FIXA' | 'ESTRUTURAL_VARIAVEL' | 'VARIAVEL_NAO_ESSENCIAL' | 'EXPANSAO';

/**
 * Representa uma única despesa classificada.
 */
export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoDespesa;
  centroDeCusto: string; // Ex: Moradia, Alimentação, Educação
}

/**
 * Agrupa despesas por seus tipos.
 */
export interface DespesasAgrupadas {
  [TipoDespesa.ESTRUTURAL_FIXA]: number;
  [TipoDespesa.ESTRUTURAL_VARIAVEL]: number;
  [TipoDespesa.VARIAVEL_NAO_ESSENCIAL]: number;
  [TipoDespesa.EXPANSAO]: number;
}

/**
 * Indicadores chave para a saúde financeira da estrutura.
 */
export interface IndicadoresSaude {
  scoreEstabilidade: number; // Score de 0 a 1000
  percentualComprometimentoRenda: number; // % da renda comprometida com despesas estruturais
  nivelDeReserva: number; // Em meses de despesas essenciais
}

/**
 * Classifica e agrupa uma lista de despesas.
 * Na implementação real, isso usaria um modelo de ML ou regras heurísticas complexas.
 * @param despesas - A lista de despesas a serem classificadas.
 * @returns As despesas agrupadas por tipo.
 */
export function agruparDespesas(despesas: Despesa[]): DespesasAgrupadas {
  const despesasAgrupadas: DespesasAgrupadas = {
    ESTRUTURAL_FIXA: 0,
    ESTRUTURAL_VARIAVEL: 0,
    VARIAVEL_NAO_ESSENCIAL: 0,
    EXPANSAO: 0,
  };

  for (const despesa of despesas) {
    despesasAgrupadas[despesa.tipo] += despesa.valor;
  }

  return despesasAgrupadas;
}

/**
 * Calcula os indicadores de saúde financeira com base nos dados atuais.
 * @param receitaMensal - A receita total do mês.
 * @param despesasAgrupadas - As despesas já agrupadas por tipo.
 * @param totalReservas - O valor total em reservas financeiras.
 * @returns Os indicadores de saúde calculados.
 */
export function calculateIndicadoresSaude(receitaMensal: number, despesasAgrupadas: DespesasAgrupadas, totalReservas: number): IndicadoresSaude {
  const despesasEssenciais = despesasAgrupadas.ESTRUTURAL_FIXA + despesasAgrupadas.ESTRUTURAL_VARIAVEL;
  
  const percentualComprometimentoRenda = (despesasEssenciais / receitaMensal) * 100;
  const nivelDeReserva = totalReservas / despesasEssenciais; // Em meses

  // O Score de Estabilidade é uma métrica mais complexa.
  // Esta é uma simplificação inicial.
  const scoreBase = (1 - (percentualComprometimentoRenda / 100)) * 500;
  const scoreReserva = Math.min(nivelDeReserva / 6, 1) * 500; // Pontua até 6 meses de reserva
  const scoreEstabilidade = Math.round(scoreBase + scoreReserva);

  return {
    scoreEstabilidade: Math.max(0, Math.min(scoreEstabilidade, 1000)), // Garante que o score fique entre 0 e 1000
    percentualComprometimentoRenda,
    nivelDeReserva,
  };
}

/**
 * Gera uma projeção de fluxo de caixa para os próximos meses.
 * @param receitaMensal - A receita mensal atual.
 * @param despesas - A lista de todas as despesas mensais.
 * @param meses - O número de meses para projetar.
 * @returns Uma matriz de projeções mensais.
 */
export function generateFluxoProjetado(receitaMensal: number, despesas: Despesa[], meses: number): { mes: number; saldo: number }[] {
  const despesasTotais = despesas.reduce((acc, d) => acc + d.valor, 0);
  const saldoMensal = receitaMensal - despesasTotais;
  const projecao = [];

  for (let i = 1; i <= meses; i++) {
    projecao.push({ mes: i, saldo: saldoMensal * i });
  }

  return projecao;
}

export const workspaceTest = () => "workspace ok";
