
import { SnapshotFinanceiro } from "../entities/SnapshotFinanceiro";

/**
 * Define o contrato para qualquer estratégia que possa ser aplicada 
 * a um snapshot financeiro durante uma projeção temporal.
 */
export interface EstrategiaProjecao {
  /**
   * Aplica uma transformação a um snapshot financeiro.
   * @param snapshot O snapshot do mês atual da projeção.
   * @param mes O número do mês na projeção (1, 2, 3, ...).
   * @returns Um novo SnapshotFinanceiro com a transformação aplicada.
   */
  aplicar(snapshot: SnapshotFinanceiro, mes: number): SnapshotFinanceiro;
}
