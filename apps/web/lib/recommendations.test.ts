
import { ContaFinanceira } from "../../../packages/core-engine/src/domain/entities/ContaFinanceira";
import { getRecomendacoesUsuario } from "./recommendations";

describe('Camada de Integração de Recomendações', () => {
  it('deve retornar recomendações ordenadas por impacto', () => {
    // Mock de uma ContaFinanceira com despesas altas
    const mockConta = new ContaFinanceira('Teste Integração', 10000, 5000, 4800);

    const recomendacoes = getRecomendacoesUsuario(mockConta);

    // 1. Deve retornar um array com pelo menos uma recomendação
    expect(recomendacoes.length).toBeGreaterThan(0);

    // 2. O impacto estimado deve ser um número
    expect(typeof recomendacoes[0].impactoEstimado).toBe('number');

    // 3. O impacto estimado deve ser não-negativo
    expect(recomendacoes[0].impactoEstimado).toBeGreaterThanOrEqual(0);

    // 4. As recomendações devem estar ordenadas de forma decrescente pelo impacto
    if (recomendacoes.length > 1) {
      for (let i = 0; i < recomendacoes.length - 1; i++) {
        expect(recomendacoes[i].impactoEstimado).toBeGreaterThanOrEqual(recomendacoes[i + 1].impactoEstimado);
      }
    }

    console.log('Recomendações de Integração', recomendacoes);
  });
});
