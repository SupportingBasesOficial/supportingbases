import { ContaFinanceira } from '../entities/ContaFinanceira';
import { Despesa, TipoDespesa } from '../entities/Despesa';
import { MotorDeRecomendacao } from './MotorDeRecomendacao';
import { ServicoHistorico } from './ServicoHistorico';
import { v4 as uuidv4 } from 'uuid';

function setup() {
  const servicoHistoricoMock = {
    registrar: jest.fn(),
    obterHistorico: jest.fn().mockReturnValue([]),
    gerarInsightsAdaptativos: jest.fn().mockReturnValue([]),
  } as any;

  const despesas = [
    new Despesa(uuidv4(), 'Aluguel', 2000, TipoDespesa.ESTRUTURAL_FIXA, 'Moradia'),
    new Despesa(uuidv4(), 'Lazer', 800, TipoDespesa.VARIAVEL_NAO_ESSENCIAL, 'Pessoal'),
  ];

  const conta = new ContaFinanceira(10000, despesas, 5000);

  const motor = new MotorDeRecomendacao(servicoHistoricoMock, conta);

  return { motor, conta, servicoHistoricoMock };
}

describe('MotorDeRecomendacao', () => {
  it('deve recomendar o melhor cenário com base na situação financeira', () => {
    const { motor, conta } = setup();

    const recomendacao = motor.recomendarMelhorCenario(conta);

    expect(recomendacao).toBeDefined();
    expect(recomendacao).toHaveProperty('id');
    expect(recomendacao).toHaveProperty('estrategia');
    expect(recomendacao).toHaveProperty('descricao');
    expect(recomendacao).toHaveProperty('scoreFinal');
    expect(typeof recomendacao.scoreFinal).toBe('number');
  });

  it('deve retornar uma lista de cenários recomendados ordenados por score', () => {
    const { motor, conta } = setup();

    const recomendacoes = motor.recomendarTodosOsCenarios(conta);

    expect(recomendacoes).toBeInstanceOf(Array);
    expect(recomendacoes.length).toBeGreaterThan(0);
    expect(recomendacoes[0].scoreFinal).toBeGreaterThanOrEqual(recomendacoes[recomendacoes.length - 1].scoreFinal);
  });

  it('deve ajustar o score da recomendação com base nos insights do histórico', () => {
    const { motor, conta, servicoHistoricoMock } = setup();

    servicoHistoricoMock.gerarInsightsAdaptativos.mockReturnValue([
      {
        nome: 'Redução de despesas variáveis',
        scoreMedio: 20,
      },
    ]);

    const recomendacoes = motor.recomendarTodosOsCenarios(conta);

    expect(recomendacoes.length).toBeGreaterThan(0);
    expect(servicoHistoricoMock.gerarInsightsAdaptativos).toHaveBeenCalled();
  });
});
