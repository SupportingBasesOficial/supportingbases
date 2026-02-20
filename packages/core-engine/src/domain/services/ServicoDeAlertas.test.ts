
import { ContaFinanceira } from '../entities/ContaFinanceira';
import { MotorDeRecomendacao } from './MotorDeRecomendacao';
import { ServicoDeAlertas } from './ServicoDeAlertas';
import { ServicoHistorico } from './ServicoHistorico';
import { Despesa, TipoDespesa } from '../entities/Despesa';
import { Cenario, Recomendacao } from '../../application/use-cases/GerarRecomendacoes';

// Mock UUID para garantir IDs determinísticos nos testes
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234',
}));

// Mock completo das dependências
const motorDeRecomendacaoMock = {
  gerarRecomendacoes: jest.fn(),
} as unknown as MotorDeRecomendacao;

const servicoHistoricoMock = {
  registrar: jest.fn(),
} as unknown as ServicoHistorico;

describe('ServicoDeAlertas', () => {
  let servico: ServicoDeAlertas;

  beforeEach(() => {
    // Resetar mocks antes de cada teste
    jest.clearAllMocks();
    servico = new ServicoDeAlertas(motorDeRecomendacaoMock, servicoHistoricoMock);
  });

  it('deve retornar um array vazio se não houver problemas financeiros nem recomendações', () => {
    const contaMock = new ContaFinanceira(10000, [], 50000); // Conta saudável
    motorDeRecomendacaoMock.gerarRecomendacoes = jest.fn().mockReturnValue({ recomendacoes: [] });

    const alertas = servico.gerarAlertas(contaMock);
    expect(alertas).toEqual([]);
  });

  it('deve gerar apenas alertas clássicos (ex: BaixoFluxoDeCaixa) se não houver recomendações', () => {
    const despesas = [new Despesa('1', 'Custo Fixo', 11000, TipoDespesa.ESTRUTURAL_FIXA, 'Geral')];
    const contaMock = new ContaFinanceira(10000, despesas, 50000); // Fluxo de caixa negativo
    motorDeRecomendacaoMock.gerarRecomendacoes = jest.fn().mockReturnValue({ recomendacoes: [] });

    const alertas = servico.gerarAlertas(contaMock);
    expect(alertas.length).toBe(1);
    expect(alertas[0].tipo).toBe('BaixoFluxoDeCaixa');
  });

  it('deve gerar um alerta de OPORTUNIDADE com base nas recomendações do motor', () => {
    const contaMock = new ContaFinanceira(10000, [], 50000); // Conta saudável
    const recomendacaoOportunidade: Recomendacao = {
      estrategia: 'Aumento de Renda Moderado',
      descricao: 'Descrição da oportunidade',
      score: 98,
      tipo: 'oportunidade',
      impactoEstimado: 100
    };

    motorDeRecomendacaoMock.gerarRecomendacoes = jest.fn().mockReturnValue({ 
        recomendacoes: [recomendacaoOportunidade] 
    });

    const alertas = servico.gerarAlertas(contaMock);

    expect(alertas.length).toBe(1);
    expect(alertas[0].tipo).toBe('oportunidade');
    expect(alertas[0].titulo).toContain('Oportunidade Encontrada');
  });

  it('deve gerar um alerta de RISCO com base nas recomendações do motor', () => {
    const contaMock = new ContaFinanceira(10000, [], 50000); // Conta saudável
    const recomendacaoRisco: Recomendacao = {
        estrategia: 'Alto Risco de Dívida',
        descricao: 'Descrição do risco',
        score: 30,
        tipo: 'risco',
        impactoEstimado: -200
    };

    motorDeRecomendacaoMock.gerarRecomendacoes = jest.fn().mockReturnValue({ 
        recomendacoes: [recomendacaoRisco] 
    });

    const alertas = servico.gerarAlertas(contaMock);

    expect(alertas.length).toBe(1);
    expect(alertas[0].tipo).toBe('risco');
    expect(alertas[0].titulo).toContain('Risco Detectado');
  });

  it('deve combinar alertas clássicos e alertas de recomendação quando ambos existirem', () => {
    const despesas = [new Despesa('1', 'Custo Fixo', 11000, TipoDespesa.ESTRUTURAL_FIXA, 'Geral')];
    const contaMock = new ContaFinanceira(10000, despesas, 10000); // Baixo fluxo de caixa E baixo nível de reserva
    
    const recomendacaoRisco: Recomendacao = {
        estrategia: 'Alto Risco de Dívida',
        descricao: 'Descrição do risco',
        score: 30,
        tipo: 'risco',
        impactoEstimado: -200
    };
    motorDeRecomendacaoMock.gerarRecomendacoes = jest.fn().mockReturnValue({ 
        recomendacoes: [recomendacaoRisco] 
    });

    const alertas = servico.gerarAlertas(contaMock);

    expect(alertas.length).toBe(3); // BaixoFluxoDeCaixa, BaixoNivelDeReserva, Risco
    expect(alertas.some(a => a.tipo === 'BaixoFluxoDeCaixa')).toBe(true);
    expect(alertas.some(a => a.tipo === 'BaixoNivelDeReserva')).toBe(true);
    expect(alertas.some(a => a.tipo === 'risco')).toBe(true);
  });
});
