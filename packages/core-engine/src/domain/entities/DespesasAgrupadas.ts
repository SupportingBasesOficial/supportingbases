
import { TipoDespesa } from "./Despesa";

/**
 * Agrupa despesas por seus tipos.
 */
export interface DespesasAgrupadas {
  [TipoDespesa.ESTRUTURAL_FIXA]: number;
  [TipoDespesa.ESTRUTURAL_VARIAVEL]: number;
  [TipoDespesa.VARIAVEL_NAO_ESSENCIAL]: number;
  [TipoDespesa.EXPANSAO]: number;
}
