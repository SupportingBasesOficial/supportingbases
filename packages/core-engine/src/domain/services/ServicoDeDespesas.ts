
import { Despesa } from "../entities/Despesa";
import { DespesasAgrupadas } from "../entities/DespesasAgrupadas";

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
