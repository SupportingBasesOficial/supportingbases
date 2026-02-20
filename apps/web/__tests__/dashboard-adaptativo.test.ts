import { getContaUsuarioLogado } from '../lib/integracao';
import { getRecomendacoesUsuario } from '../lib/recommendations';
import { getAlertasUsuario } from '../lib/alerts';
import { registrarDecisao, gerarInsights } from '../lib/historico';
import { v4 as uuidv4 } from 'uuid';
import { ContaFinanceira } from '@core-engine/domain/entities/ContaFinanceira';
import { Despesa, TipoDespesa } from '@core-engine/domain/entities/Despesa';

describe('Integração adaptativa do Dashboard', () => {
  let conta: ContaFinanceira;

  beforeEach(() => {
    conta = getContaUsuarioLogado();
  });

  it('Deve registrar simulações e atualizá-las no histórico', () => {
    const simulacao = {
      receitaExtra: 1000,
      despesaExtra: 200
    };

    const contaSimulada = new ContaFinanceira(
      conta.receitaMensal + simulacao.receitaExtra,
      [...conta.despesas],
      conta.totalReservas
    );

    registrarDecisao({
      id: uuidv4(),
      tipo: 'Simulacao',
      data: new Date(),
      descricao: `Simulação com receita +${simulacao.receitaExtra} e despesa +${simulacao.despesaExtra}`,
      contaFinanceira: contaSimulada,
      resultado: { impactoEstimado: 0, scoreFinal: 0 } 
    });

    const insights = gerarInsights();
    expect(insights.length).toBeGreaterThan(0);
  });

  it('Deve gerar recomendações formatadas para a web', async () => {
    const recomendacoes = await getRecomendacoesUsuario(conta);
    expect(recomendacoes).toBeInstanceOf(Array);
    expect(recomendacoes.length).toBeGreaterThan(0);
    expect(recomendacoes[0]).toHaveProperty('titulo');
    expect(recomendacoes[0]).toHaveProperty('descricao');
    expect(recomendacoes[0]).toHaveProperty('impacto');
    expect(typeof recomendacoes[0].impacto).toBe('string');
  });

  it('Deve gerar alertas para cenários críticos', async () => {
    const contaCritica = new ContaFinanceira(
      3000, // Receita
      [ new Despesa(uuidv4(), 'Aluguel', 2800, TipoDespesa.ESTRUTURAL_FIXA, 'Moradia') ], // Despesas
      50 // Reservas
    );

    const alertas = await getAlertasUsuario(contaCritica);
    expect(alertas).toBeInstanceOf(Array);
    expect(alertas.length).toBeGreaterThan(0);
  });

  it('Deve refletir decisões passadas nas recomendações e alertas', async () => {
    const recomendacoes = await getRecomendacoesUsuario(conta);
    const recomendacaoAceita = recomendacoes[0];

    registrarDecisao({
      id: uuidv4(),
      tipo: 'AcaoExecutada',
      data: new Date(),
      descricao: `Usuário aceitou a recomendação: ${recomendacaoAceita.titulo}`,
      contaFinanceira: conta,
      resultado: { impactoEstimado: 100, scoreFinal: 100 } // Valores de exemplo
    });

    const novasRecomendacoes = await getRecomendacoesUsuario(conta);
    expect(novasRecomendacoes.length).toBeGreaterThan(0);
  });
});
