
import { AvaliadorCenarios } from './AvaliadorCenarios';
import { ContaFinanceira } from '../entities/ContaFinanceira';
import { Despesa, TipoDespesa } from '../entities/Despesa';

describe('AvaliadorCenarios', () => {
  const avaliador = new AvaliadorCenarios();

  // Conta base: Receita 5000, Despesas 4000, Reservas 1000
  const despesasBase = [
    new Despesa('d1', 'Fixas', 3000, TipoDespesa.ESTRUTURAL_FIXA, 'Moradia'),
    new Despesa('d2', 'Variáveis', 1000, TipoDespesa.ESTRUTURAL_VARIAVEL, 'Alimentação'),
  ];
  const contaBase = new ContaFinanceira(5000, despesasBase, 1000);

  it('deve classificar cenário como "oportunidade"', () => {
    const cenarioOportunidade = {
      nome: 'Aumento de Receita',
      conta: new ContaFinanceira(5500, despesasBase, 1000),
    };
    const resultado = avaliador.compararCenarios(contaBase, [cenarioOportunidade], 1);

    // Lógica: Saldo Projetado = 1000 + (5500 - 4000) * 1 = 2500
    // Variação = Saldo Projetado (2500) - Saldo Base (1000) = 1500
    expect(resultado[0].tipo).toBe('oportunidade');
    expect(resultado[0].variacao).toBe(1500);
  });

  it('deve classificar cenário como "risco"', () => {
    const despesasRisco = [
        ...despesasBase, 
        new Despesa('d3', 'Extra', 1200, TipoDespesa.VARIAVEL_NAO_ESSENCIAL, 'Lazer')
    ]; // Total despesas = 5200
    const cenarioRisco = {
      nome: 'Aumento de Despesa',
      conta: new ContaFinanceira(5000, despesasRisco, 1000),
    };
    const resultado = avaliador.compararCenarios(contaBase, [cenarioRisco], 1);

    // Lógica: Saldo Projetado = 1000 + (5000 - 5200) * 1 = 800
    // Variação = Saldo Projetado (800) - Saldo Base (1000) = -200
    expect(resultado[0].tipo).toBe('risco');
    expect(resultado[0].variacao).toBe(-200);
  });

  it('deve classificar cenário como "informativo"', () => {
    const cenarioInformativo = {
        nome: 'Variação Mínima',
        // Fluxo de caixa mensal = 4080 - 4000 = 80
        conta: new ContaFinanceira(4080, despesasBase, 1000) 
    };

    const resultado = avaliador.compararCenarios(contaBase, [cenarioInformativo], 1);
    
    // Lógica: Saldo Projetado = 1000 + (4080 - 4000) * 1 = 1080
    // Variação = Saldo Projetado (1080) - Saldo Base (1000) = 80
    // Como 80 < 100, é classificado como informativo.
    expect(resultado[0].tipo).toBe('informativo');
    expect(resultado[0].variacao).toBe(80);
  });
});
