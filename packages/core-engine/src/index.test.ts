
import { describe, it, expect, beforeEach } from 'vitest';
import { agruparDespesas } from './domain/services/ServicoDeDespesas';
import { TipoDespesa, Despesa } from './domain/entities/Despesa';
import { ContaFinanceira } from './domain/entities/ContaFinanceira';
import { SnapshotFinanceiro } from './domain/entities/SnapshotFinanceiro';
import { CrescimentoReceitaMensal } from './domain/strategies/CrescimentoReceitaMensal';
import { InflacaoDespesasMensal } from './domain/strategies/InflacaoDespesasMensal';

describe('Core Engine - Servicos', () => {
  it('deve agrupar as despesas corretamente por tipo, sem incluir grupos vazios', () => {
    const despesas: Despesa[] = [
      new Despesa('1', 'Aluguel', 1500, TipoDespesa.ESTRUTURAL_FIXA, 'Moradia'),
      new Despesa('2', 'Supermercado', 1000, TipoDespesa.ESTRUTURAL_VARIAVEL, 'Alimentação'),
    ];
    const result = agruparDespesas(despesas);
    expect(result).toEqual({ ESTRUTURAL_FIXA: 1500, ESTRUTURAL_VARIAVEL: 1000 });
  });
});

describe('Core Engine - Estratégias de Projeção', () => {
  let snapshotInicial: SnapshotFinanceiro;

  beforeEach(() => {
    snapshotInicial = new SnapshotFinanceiro(5000, { ESTRUTURAL_FIXA: 2000, VARIAVEL_NAO_ESSENCIAL: 1000 }, 10000);
  });

  it('CrescimentoReceitaMensal deve aumentar a receita corretamente', () => {
    const estrategia = new CrescimentoReceitaMensal(10); // 10% de crescimento
    const novoSnapshot = estrategia.aplicar(snapshotInicial);
    expect(novoSnapshot.receita).toBeCloseTo(5500);
  });

  it('InflacaoDespesasMensal deve aumentar todas as despesas corretamente', () => {
    const estrategia = new InflacaoDespesasMensal(5); // 5% de inflação
    const novoSnapshot = estrategia.aplicar(snapshotInicial);
    expect(novoSnapshot.despesas.ESTRUTURAL_FIXA).toBeCloseTo(2100);
    expect(novoSnapshot.despesas.VARIAVEL_NAO_ESSENCIAL).toBeCloseTo(1050);
  });
});

describe('Core Engine - ContaFinanceira Rich Entity', () => {
  let conta: ContaFinanceira;
  let despesasIniciais: Despesa[];

  beforeEach(() => {
    despesasIniciais = [
      new Despesa('1', 'Aluguel', 2000, TipoDespesa.ESTRUTURAL_FIXA, 'Moradia'),
      new Despesa('2', 'Alimentação', 1200, TipoDespesa.ESTRUTURAL_VARIAVEL, 'Alimentação'),
      new Despesa('3', 'Lazer', 500, TipoDespesa.VARIAVEL_NAO_ESSENCIAL, 'Lazer'),
      new Despesa('4', 'Investimento', 300, TipoDespesa.EXPANSAO, 'Investimentos'),
    ];
    conta = new ContaFinanceira(6000, despesasIniciais, 10000);
  });

  // ... (previous tests remain the same)

  describe('Simulações e Projeções com Estratégias', () => {
    it('deve projetar o futuro aplicando um pipeline de estratégias (crescimento e inflação)', () => {
      const estrategias = [
        new CrescimentoReceitaMensal(1), // 1% de crescimento da receita ao mês
        new InflacaoDespesasMensal(0.5), // 0.5% de inflação nas despesas ao mês
      ];

      const projecoes = conta.projetarMeses(2, estrategias);

      expect(projecoes.length).toBe(2);

      // --- Mês 1 ---
      const snapshotInicial = conta.snapshotAtual();
      const fluxoCaixaInicial = snapshotInicial.calcularIndicadores().fluxoDeCaixa; // 6000 - 4000 = 2000
      const reservasMes1_antesEstrategia = snapshotInicial.reservas + fluxoCaixaInicial; // 12000
      
      // Aplica estratégias para o Mês 1
      const receitaMes1 = snapshotInicial.receita * 1.01; // 6060
      const despesasMes1 = snapshotInicial.totalDespesas * 1.005; // 4020

      const projecao1 = projecoes[0];
      expect(projecao1.receita).toBeCloseTo(receitaMes1);
      expect(projecao1.totalDespesas).toBeCloseTo(despesasMes1);
      // A reserva é calculada ANTES da receita/despesa do mês ser alterada pela estratégia
      expect(projecao1.reservas).toBeCloseTo(reservasMes1_antesEstrategia);

      // --- Mês 2 ---
      const fluxoCaixaMes1 = projecao1.calcularIndicadores().fluxoDeCaixa; // 6060 - 4020 = 2040
      const reservasMes2_antesEstrategia = projecao1.reservas + fluxoCaixaMes1; // 12000 + 2040 = 14040

      // Aplica estratégias para o Mês 2
      const receitaMes2 = projecao1.receita * 1.01; // 6060 * 1.01 = 6120.6
      const despesasMes2 = projecao1.totalDespesas * 1.005; // 4020 * 1.005 = 4040.1

      const projecao2 = projecoes[1];
      expect(projecao2.receita).toBeCloseTo(receitaMes2);
      expect(projecao2.totalDespesas).toBeCloseTo(despesasMes2);
      expect(projecao2.reservas).toBeCloseTo(reservasMes2_antesEstrategia);
    });
  });
});
