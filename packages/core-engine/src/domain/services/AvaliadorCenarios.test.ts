
import { ContaFinanceira } from "../entities/ContaFinanceira";
import { EstrategiaProjecao } from "../strategies/EstrategiaProjecao";
import { AvaliadorCenarios } from "./AvaliadorCenarios";
import { CrescimentoReceitaMensal } from "../strategies/CrescimentoReceitaMensal";
import { InflacaoDespesasMensal } from "../strategies/InflacaoDespesasMensal";

describe('AvaliadorCenarios', () => {
  it('deve comparar dois cenários e retornar o de maior score de estabilidade', () => {
    const contaInicial = new ContaFinanceira('Teste', 10000, 5000, 4000);
    const avaliador = new AvaliadorCenarios();

    const cenarioConservador: { nome: string; estrategias: EstrategiaProjecao[] } = {
      nome: 'Conservador',
      estrategias: [
        new CrescimentoReceitaMensal(0.005), // 0.5% de crescimento da receita
        new InflacaoDespesasMensal(0.003) // 0.3% de inflação das despesas
      ]
    };

    const cenarioAgressivo: { nome: string; estrategias: EstrategiaProjecao[] } = {
      nome: 'Agressivo',
      estrategias: [
        new CrescimentoReceitaMensal(0.01), // 1% de crescimento da receita
        new InflacaoDespesasMensal(0.005) // 0.5% de inflação das despesas
      ]
    };

    const resultados = avaliador.comparar(contaInicial, [cenarioConservador, cenarioAgressivo], 12);

    expect(resultados).toHaveLength(2);

    const resultadoConservador = resultados.find(r => r.nome === 'Conservador');
    const resultadoAgressivo = resultados.find(r => r.nome === 'Agressivo');

    expect(resultadoConservador).toBeDefined();
    expect(resultadoAgressivo).toBeDefined();

    // Espera-se que o cenário com maior crescimento de receita e menor inflação (proporcionalmente) 
    // tenha um impacto positivo maior na estabilidade, assumindo que a receita cresce mais que a despesa.
    expect(resultadoAgressivo!.scoreFinal).toBeGreaterThan(resultadoConservador!.scoreFinal);

    console.log('Resultados da Comparação de Cenários:', JSON.stringify(resultados, null, 2));
  });
});
