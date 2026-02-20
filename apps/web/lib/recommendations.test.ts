
import { ContaFinanceira } from "../../../packages/core-engine/src/domain/entities/ContaFinanceira";
import { getRecomendacoesUsuario } from "./recommendations";
import { Despesa, TipoDespesa } from "../../../packages/core-engine/src/domain/entities/Despesa";
import { v4 as uuidv4 } from 'uuid';

describe('Camada de Integração de Recomendações', () => {
  it('deve retornar recomendações ordenadas por impacto', async () => {
    // Mock de uma ContaFinanceira com despesas altas
    const despesas = [
      new Despesa(uuidv4(), 'Gasto Elevado 1', 4800, TipoDespesa.VARIAVEL_NAO_ESSENCIAL, 'Lazer'),
    ];
    const mockConta = new ContaFinanceira(10000, despesas, 5000);

    const recomendacoes = await getRecomendacoesUsuario(mockConta);

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
