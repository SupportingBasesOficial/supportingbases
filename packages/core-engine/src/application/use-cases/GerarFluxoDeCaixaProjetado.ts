
import { Despesa } from "../../domain/entities/Despesa";

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
