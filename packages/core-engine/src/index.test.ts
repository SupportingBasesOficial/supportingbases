
import { describe, it, expect } from 'vitest';
import { agruparDespesas } from './domain/services/ServicoDeDespesas';
import { calculateIndicadoresSaude } from './domain/services/ServicoDeIndicadores';
import { TipoDespesa, Despesa } from './domain/entities/Despesa';
import { DespesasAgrupadas } from './domain/entities/DespesasAgrupadas';
import { IndicadoresSaude } from './domain/entities/IndicadoresSaude';

describe('Core Engine - Financial Health Services', () => {

  // Teste para a função agruparDespesas
  describe('agruparDespesas', () => {
    it('deve agrupar as despesas corretamente por tipo', () => {
      const despesas: Despesa[] = [
        { id: '1', descricao: 'Aluguel', valor: 1500, tipo: TipoDespesa.ESTRUTURAL_FIXA, centroDeCusto: 'Moradia' },
        { id: '2', descricao: 'Supermercado', valor: 1000, tipo: TipoDespesa.ESTRUTURAL_VARIAVEL, centroDeCusto: 'Alimentação' },
        { id: '3', descricao: 'Lazer', valor: 400, tipo: TipoDespesa.VARIAVEL_NAO_ESSENCIAL, centroDeCusto: 'Lazer' },
        { id: '4', descricao: 'Internet', valor: 100, tipo: TipoDespesa.ESTRUTURAL_FIXA, centroDeCusto: 'Utilidades' },
        { id: '5', descricao: 'Investimento', valor: 800, tipo: TipoDespesa.EXPANSAO, centroDeCusto: 'Investimentos' },
        { id: '6', descricao: 'Streaming', valor: 50, tipo: TipoDespesa.VARIAVEL_NAO_ESSENCIAL, centroDeCusto: 'Lazer' },
      ];

      const expected: DespesasAgrupadas = {
        [TipoDespesa.ESTRUTURAL_FIXA]: 1600,
        [TipoDespesa.ESTRUTURAL_VARIAVEL]: 1000,
        [TipoDespesa.VARIAVEL_NAO_ESSENCIAL]: 450,
        [TipoDespesa.EXPANSAO]: 800,
      };

      const result = agruparDespesas(despesas);
      expect(result).toEqual(expected);
    });
  });

  // Teste para a função calculateIndicadoresSaude
  describe('calculateIndicadoresSaude', () => {
    it('deve calcular os indicadores de saúde financeira corretamente', () => {
      const receitaMensal = 6000;
      const totalReservas = 4000;
      const despesasAgrupadas: DespesasAgrupadas = {
        [TipoDespesa.ESTRUTURAL_FIXA]: 1600,
        [TipoDespesa.ESTRUTURAL_VARIAVEL]: 1000,
        [TipoDespesa.VARIAVEL_NAO_ESSENCIAL]: 450,
        [TipoDespesa.EXPANSAO]: 800,
      };

      const indicadores = calculateIndicadoresSaude(receitaMensal, despesasAgrupadas, totalReservas);

      // Custo base = Fixas + Variáveis Estruturais = 1600 + 1000 = 2600
      // Despesas totais = 1600 + 1000 + 450 + 800 = 3850
      // Fluxo de caixa = 6000 - 3850 = 2150
      expect(indicadores.fluxoDeCaixa).toBe(2150);

      // Nível de reserva = 4000 / 2600 = 1.538...
      expect(indicadores.nivelDeReserva).toBeCloseTo(1.54);
      
      // Pontuação Fluxo de Caixa = (2150 / 6000) * 1000 = 358.33
      // Pontuação Nível de Reserva = min(1.538 / 6, 1) * 1000 = 256.33
      // Score = (358.33 * 0.4) + (256.33 * 0.6) = 143.33 + 153.8 = 297.13
      expect(indicadores.scoreEstabilidade).toBeCloseTo(297);
    });

    it('deve retornar score 0 e evitar divisão por zero quando a receita é zero', () => {
      const receitaMensal = 0;
      const totalReservas = 5000;
      const despesasAgrupadas: DespesasAgrupadas = {
        [TipoDespesa.ESTRUTURAL_FIXA]: 1500,
        [TipoDespesa.ESTRUTURAL_VARIAVEL]: 1000,
      };

      const indicadores = calculateIndicadoresSaude(receitaMensal, despesasAgrupadas, totalReservas);

      expect(indicadores.scoreEstabilidade).toBe(0);
      expect(indicadores.fluxoDeCaixa).toBe(-2500);
      expect(indicadores.percentualComprometimentoRenda).toBe(Infinity);
      expect(indicadores.nivelDeReserva).toBeCloseTo(2);
    });

    it('deve calcular um fluxo de caixa negativo e score baixo quando as despesas excedem a receita', () => {
      const receitaMensal = 4000;
      const totalReservas = 2000;
      const despesasAgrupadas: DespesasAgrupadas = {
        [TipoDespesa.ESTRUTURAL_FIXA]: 3000,
        [TipoDespesa.ESTRUTURAL_VARIAVEL]: 1500,
      };

      const indicadores = calculateIndicadoresSaude(receitaMensal, despesasAgrupadas, totalReservas);

      expect(indicadores.fluxoDeCaixa).toBe(-500);
      expect(indicadores.scoreEstabilidade).toBe(0);
    });

    it('deve refletir baixa estabilidade com score baixo quando as reservas são zero', () => {
      const receitaMensal = 5000;
      const totalReservas = 0;
      const despesasAgrupadas: DespesasAgrupadas = {
        [TipoDespesa.ESTRUTURAL_FIXA]: 2000,
        [TipoDespesa.ESTRUTURAL_VARIAVEL]: 1000,
      };

      const indicadores = calculateIndicadoresSaude(receitaMensal, despesasAgrupadas, totalReservas);

      expect(indicadores.nivelDeReserva).toBe(0);
      expect(indicadores.scoreEstabilidade).toBe(160);
    });

    it('deve retornar score próximo de 1000 em um cenário ideal', () => {
      const receitaMensal = 20000;
      const totalReservas = 20000;
      const despesasAgrupadas: DespesasAgrupadas = {
        [TipoDespesa.ESTRUTURAL_FIXA]: 1500,
        [TipoDespesa.ESTRUTURAL_VARIAVEL]: 500,
      };

      const indicadores = calculateIndicadoresSaude(receitaMensal, despesasAgrupadas, totalReservas);

      expect(indicadores.nivelDeReserva).toBeGreaterThanOrEqual(6);
      expect(indicadores.scoreEstabilidade).toBeGreaterThan(900);
    });
  });
});
