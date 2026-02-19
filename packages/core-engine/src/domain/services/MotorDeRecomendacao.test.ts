
import { ContaFinanceira } from "../entities/ContaFinanceira";
import { MotorDeRecomendacao } from "./MotorDeRecomendacao";

describe('MotorDeRecomendacao', () => {
  it('deve recomendar a estratégia que maximiza o score de estabilidade', () => {
    // Cenário: Uma conta com despesas altas em relação à receita.
    // A contenção de despesas deve ser a estratégia mais impactante.
    const contaComDespesasAltas = new ContaFinanceira('Despesas Altas', 10000, 5000, 4800);
    const motor = new MotorDeRecomendacao();

    const recomendacao = motor.recomendarMelhorEstrategia(contaComDespesasAltas);

    // Para esta conta, a "Contenção de Despesas" deve ter o maior impacto no score.
    expect(recomendacao.nome).toBe('Contenção de Despesas (Moderada)');
  });

  it('deve recomendar aumento de receita quando as despesas estão controladas', () => {
    // Cenário: Uma conta com despesas baixas, onde o potencial de crescimento da receita é mais atrativo.
    const contaComDespesasBaixas = new ContaFinanceira('Despesas Baixas', 10000, 5000, 2000);
    const motor = new MotorDeRecomendacao();

    const recomendacao = motor.recomendarMelhorEstrategia(contaComDespesasBaixas);

    // Para esta conta, o "Aumento de Receita" deve ser mais vantajoso.
    expect(recomendacao.nome).toBe('Aumento de Receita (Agressivo)');
  });
});
