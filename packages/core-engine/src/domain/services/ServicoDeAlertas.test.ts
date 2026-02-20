
import { ContaFinanceira } from '../entities/ContaFinanceira';
import { MotorDeRecomendacao } from './MotorDeRecomendacao';
import { ServicoDeAlertas } from './ServicoDeAlertas';
import { ServicoHistorico } from './ServicoHistorico';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid-1234' }));

const motorDeRecomendacaoMock = {
  recomendarTodosOsCenarios: jest.fn(),
} as unknown as jest.Mocked<MotorDeRecomendacao>;

const servicoHistoricoMock = {
  registrar: jest.fn(),
  obterHistorico: jest.fn(),
  gerarInsightsAdaptativos: jest.fn().mockReturnValue([]), 
} as unknown as jest.Mocked<ServicoHistorico>;

describe('ServicoDeAlertas', () => {
  let servico: ServicoDeAlertas;
  let contaMock: ContaFinanceira;

  beforeEach(() => {
    jest.clearAllMocks();
    servico = new ServicoDeAlertas(motorDeRecomendacaoMock, servicoHistoricoMock);
    contaMock = new ContaFinanceira(10000, [], 20000);
  });

  it('deve gerar um alerta de RISCO para recomendação com score baixo', () => {
    const recomendacaoRisco = {
      id: 'reduzir-despesas',
      tipo: 'Redução de Despesas', // Corrigido de 'estrategia'
      descricao: 'Cortar gastos para evitar dívidas',
      scoreFinal: 40,
      impactoEstimado: 300,
      prioridade: 1,
      risco: 'alto' as const
    };
    motorDeRecomendacaoMock.recomendarTodosOsCenarios.mockReturnValue([recomendacaoRisco]);

    const alertas = servico.gerarAlertas(contaMock);

    expect(alertas).toHaveLength(1);
    expect(alertas[0].tipo).toBe('risco');
    expect(alertas[0].titulo).toContain('Risco Detectado: Redução de Despesas');
  });

  it('deve gerar um alerta de OPORTUNIDADE para recomendação com score alto', () => {
    const recomendacaoOportunidade = {
      id: 'investir-mais',
      tipo: 'Aumentar Investimentos', // Corrigido de 'estrategia'
      descricao: 'Aproveitar sobra de caixa para investir',
      scoreFinal: 90, 
      impactoEstimado: 1500,
      prioridade: 2,
      risco: 'baixo' as const
    };
    motorDeRecomendacaoMock.recomendarTodosOsCenarios.mockReturnValue([recomendacaoOportunidade]);

    const alertas = servico.gerarAlertas(contaMock);

    expect(alertas).toHaveLength(1);
    expect(alertas[0].tipo).toBe('oportunidade');
    expect(alertas[0].titulo).toContain('Oportunidade Encontrada: Aumentar Investimentos');
  });

  it('NÃO deve gerar alertas para recomendação com score intermediário', () => {
    const recomendacaoInformativa = {
      id: 'manter-orcamento',
      tipo: 'Manter Orçamento Atual', // Corrigido de 'estrategia'
      descricao: 'Situação financeira estável',
      scoreFinal: 70, 
      impactoEstimado: 0,
      prioridade: 3,
      risco: 'baixo' as const
    };
    motorDeRecomendacaoMock.recomendarTodosOsCenarios.mockReturnValue([recomendacaoInformativa]);

    const alertas = servico.gerarAlertas(contaMock);
    expect(alertas).toHaveLength(0);
  });

  it('deve incluir alerta de saldo baixo quando aplicável', () => {
    const contaComSaldoBaixo = new ContaFinanceira(500, [], 900); 
    motorDeRecomendacaoMock.recomendarTodosOsCenarios.mockReturnValue([]); 

    const alertas = servico.gerarAlertas(contaComSaldoBaixo);

    expect(alertas).toHaveLength(1);
    expect(alertas[0].tipo).toBe('informativo');
    expect(alertas[0].titulo).toBe('Informativo: Saldo Baixo');
  });

  it('deve ordenar os alertas por impacto estimado', () => {
    const rec1 = { id: 'rec1', tipo: 'Risco Alto', scoreFinal: 30, impactoEstimado: 70, descricao:'', prioridade:1, risco: 'alto' as const }; 
    const rec2 = { id: 'rec2', tipo: 'Oportunidade Baixa', scoreFinal: 85, impactoEstimado: 85, descricao:'', prioridade:1, risco: 'baixo' as const };
    motorDeRecomendacaoMock.recomendarTodosOsCenarios.mockReturnValue([rec1, rec2]);

    const alertas = servico.gerarAlertas(contaMock);
    
    expect(alertas).toHaveLength(2);
    expect(alertas[0].tipo).toBe('oportunidade');
    expect(alertas[1].tipo).toBe('risco');
  });
});
