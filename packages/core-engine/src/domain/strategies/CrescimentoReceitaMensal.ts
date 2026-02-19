
import { SnapshotFinanceiro } from "../entities/SnapshotFinanceiro";
import { EstrategiaProjecao } from "./EstrategiaProjecao";

/**
 * Estratégia para simular um crescimento percentual da receita a cada mês.
 */
export class CrescimentoReceitaMensal implements EstrategiaProjecao {
  constructor(private percentual: number) {
    if (percentual < 0) {
      throw new Error("O percentual de crescimento não pode ser negativo.");
    }
  }

  aplicar(snapshot: SnapshotFinanceiro): SnapshotFinanceiro {
    const novaReceita = snapshot.receita * (1 + this.percentual / 100);
    return new SnapshotFinanceiro(
      novaReceita,
      snapshot.despesas,
      snapshot.reservas
    );
  }
}
