import { Despesa, TipoDespesa } from "../entities/Despesa";
import { DespesasAgrupadas } from "../entities/DespesasAgrupadas";

/**
 * Agrupa uma lista de despesas pelo seu tipo.
 * @param despesas - A lista de despesas a serem agrupadas.
 * @returns Um objeto com as despesas agrupadas e somadas por tipo.
 */
export function agruparDespesas(despesas: readonly Despesa[]): DespesasAgrupadas {
  const grupos: DespesasAgrupadas = {
    [TipoDespesa.ESTRUTURAL_FIXA]: 0,
    [TipoDespesa.ESTRUTURAL_VARIAVEL]: 0,
    [TipoDespesa.VARIAVEL_NAO_ESSENCIAL]: 0,
    [TipoDespesa.EXPANSAO]: 0,
  };

  for (const despesa of despesas) {
    if (grupos.hasOwnProperty(despesa.tipo)) {
      grupos[despesa.tipo] += despesa.valor;
    }
  }

  return grupos;
}
