
import { SnapshotFinanceiro } from "../entities/SnapshotFinanceiro";
import { EstrategiaProjecao } from "./EstrategiaProjecao";

/**
 * Estratégia para simular um aumento inflacionário percentual sobre todas as despesas.
 */
export class InflacaoDespesasMensal implements EstrategiaProjecao {
  constructor(private percentual: number) {
    if (percentual < 0) {
      throw new Error("O percentual de inflação não pode ser negativo.");
    }
  }

  aplicar(snapshot: SnapshotFinanceiro): SnapshotFinanceiro {
    const fatorInflacao = 1 + this.percentual / 100;

    const despesasInflacionadas = Object.fromEntries(
      Object.entries(snapshot.despesas).map(([tipo, valor]) => [
        tipo,
        valor * fatorInflacao
      ])
    );

    return new SnapshotFinanceiro(
      snapshot.receita,
      despesasInflacionadas as any, // Cast temporário
      snapshot.reservas
    );
  }
}
