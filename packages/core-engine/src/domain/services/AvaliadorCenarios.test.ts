import { ContaFinanceira } from '../entities/ContaFinanceira';
import { Despesa, TipoDespesa } from '../entities/Despesa';
import { AvaliadorCenarios } from './AvaliadorCenarios';
import { v4 as uuidv4 } from 'uuid';

describe('AvaliadorCenarios', () => {
  const avaliador = new AvaliadorCenarios();

  const despesasIniciais = [
    new Despesa(uuidv4(), 'Aluguel', 3000, TipoDespesa.ESTRUTURAL_FIXA, 'Moradia'),
    new Despesa(uuidv4(), 'Alimentação', 1000, TipoDespesa.ESTRUTURAL_VARIAVEL, 'Alimentação'),
  ];
  const contaInicial = new ContaFinanceira(10000, despesasIniciais, 20000);

  it('deve comparar cenários e retornar resultados ordenados por score', () => {
    // Mock dos cenários sem depender de tipos internos
    const cenarioConservador = {
      nome: 'Conservador',
      descricao: 'Mantém os gastos atuais com leve aumento pela inflação.',
      estrategias: [
        { aplicar: (s, m) => s.cloneComNovasReservas(s.reservas + s.calcularIndicadores().fluxoDeCaixa) }
      ]
    };

    const cenarioAgressivo = {
      nome: 'Agressivo',
      descricao: 'Aumenta a receita e controla despesas.',
      estrategias: [
        { aplicar: (s, m) => s.cloneComNovaReceita(s.receita * 1.01) },
        { aplicar: (s, m) => s.cloneComNovasReservas(s.reservas + s.calcularIndicadores().fluxoDeCaixa) }
      ]
    };

    // O método 'comparar' retorna ResultadoCenario[], que não possui a propriedade 'projecoes'
    const resultados = avaliador.comparar(contaInicial, [cenarioConservador, cenarioAgressivo], 12);

    expect(resultados.length).toBe(2);
    // Validar a API pública de ResultadoCenario
    expect(resultados[0]).toHaveProperty('nome');
    expect(resultados[0]).toHaveProperty('descricao');
    expect(resultados[0]).toHaveProperty('scoreFinal');
    // O cenário agressivo deve ter um score maior
    expect(resultados[1].scoreFinal).toBeGreaterThan(resultados[0].scoreFinal);
  });

  it('deve lançar um erro se a quantidade de meses for inválida', () => {
    const cenario = {
      nome: 'Teste',
      descricao: 'Cenário de teste de erro.',
      estrategias: []
    };
    expect(() => avaliador.comparar(contaInicial, [cenario], 0)).toThrow('A quantidade de meses deve ser maior que zero.');
  });
});
