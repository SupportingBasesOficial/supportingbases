import { agruparDespesas } from "./domain/services/ServicoDeDespesas";
import { Despesa, TipoDespesa } from "./domain/entities/Despesa";

describe("Core Engine - Servicos", () => {
  it("deve agrupar as despesas corretamente por tipo", () => {
    const despesas: Despesa[] = [
      new Despesa("1", "Aluguel", 1500, TipoDespesa.ESTRUTURAL_FIXA, "Moradia"),
      new Despesa("2", "Supermercado", 1000, TipoDespesa.ESTRUTURAL_VARIAVEL, "Alimentação"),
    ];
    const result = agruparDespesas(despesas);
    expect(result).toEqual({
      ESTRUTURAL_FIXA: 1500,
      ESTRUTURAL_VARIAVEL: 1000,
      VARIAVEL_NAO_ESSENCIAL: 0,
      EXPANSAO: 0,
    });
  });
});