
import { ContaFinanceira } from "../../../packages/core-engine/src/domain/entities/ContaFinanceira";
import { getRecomendacoesUsuario } from "./recommendations";
import { Despesa, TipoDespesa } from "../../../packages/core-engine/src/domain/entities/Despesa";
import { v4 as uuidv4 } from 'uuid';

describe('Camada de Integração de Recomendações', () => {
  it('deve retornar recomendações com o formato correto', async () => {
    // Mock de uma ContaFinanceira com despesas altas
    const despesas = [
      new Despesa(uuidv4(), 'Gasto Elevado 1', 4800, TipoDespesa.VARIAVEL_NAO_ESSENCIAL, 'Lazer'),
    ];
    const mockConta = new ContaFinanceira(10000, despesas, 5000);

    const recomendacoes = await getRecomendacoesUsuario(mockConta);

    // 1. Deve retornar um array com pelo menos uma recomendação
    expect(recomendacoes.length).toBeGreaterThan(0);

    // 2. A recomendação deve ter as propriedades corretas do DTO
    expect(recomendacoes[0]).toHaveProperty('titulo');
    expect(recomendacoes[0]).toHaveProperty('descricao');
    expect(recomendacoes[0]).toHaveProperty('impacto');

    // 3. A propriedade 'impacto' deve ser uma string formatada
    expect(typeof recomendacoes[0].impacto).toBe('string');
    expect(recomendacoes[0].impacto).toMatch(/R\$ \d+\.\d{2} \/ mês/);

    console.log('Recomendações de Integração', recomendacoes);
  });
});
