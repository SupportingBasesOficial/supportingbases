
import { ContaFinanceira } from "../entities/ContaFinanceira";
import { EstrategiaProjecao } from "../strategies/EstrategiaProjecao";
import { GerarFluxoDeCaixaProjetado } from "../../application/use-cases/GerarFluxoDeCaixaProjetado";
import { ServicoDeIndicadores } from "./ServicoDeIndicadores";
import { CrescimentoReceitaMensal } from "../strategies/CrescimentoReceitaMensal";
import { InflacaoDespesasMensal } from "../strategies/InflacaoDespesasMensal";

interface Cenario {
    nome: string;
    descricao: string;
    estrategias: EstrategiaProjecao[];
}

interface ResultadoCenario {
    nome: string;
    descricao: string;
    scoreFinal: number;
}

/**
 * Avalia e compara o impacto de diferentes cenários de projeção financeira.
 */
export class AvaliadorCenarios {
    private geradorFluxoCaixa = new GerarFluxoDeCaixaProjetado();
    private servicoIndicadores = new ServicoDeIndicadores();
    private cenariosPredefinidos: Cenario[];

    constructor() {
        this.cenariosPredefinidos = [
            {
                nome: 'Padrão',
                descricao: 'Projeção sem alterações nas receitas ou despesas.',
                estrategias: []
            },
            {
                nome: 'Conservador',
                descricao: 'Crescimento modesto da receita (0.5%) com controle de despesas (inflação de 0.3%).',
                estrategias: [new CrescimentoReceitaMensal(0.005), new InflacaoDespesasMensal(0.003)]
            },
            {
                nome: 'Agressivo',
                descricao: 'Foco em crescimento acelerado da receita (1%) assumindo um aumento maior de despesas (inflação de 0.8%).',
                estrategias: [new CrescimentoReceitaMensal(0.01), new InflacaoDespesasMensal(0.008)]
            },
            {
                nome: 'Foco em Receita',
                descricao: 'Maximizar o aumento da receita (1.2%) sem controle de despesas (inflação de 1%).',
                estrategias: [new CrescimentoReceitaMensal(0.012), new InflacaoDespesasMensal(0.01)]
            },
            {
                nome: 'Contenção de Despesas',
                descricao: 'Nenhum crescimento de receita, mas com forte controle de despesas (inflação de apenas 0.1%).',
                estrategias: [new InflacaoDespesasMensal(0.001)]
            }
        ];
    }

    /**
     * Compara um conjunto de cenários pré-definidos pelos seus nomes.
     * @param conta A conta financeira inicial.
     * @param nomesCenarios Nomes dos cenários a serem comparados (ex: ['Conservador', 'Agressivo']).
     * @param meses O número de meses para a projeção.
     * @returns Uma lista com os resultados de cada cenário, incluindo nome, descrição e score final.
     */
    compararCenarios(conta: ContaFinanceira, nomesCenarios: string[], meses: number = 12): ResultadoCenario[] {
        const cenariosParaComparar = this.cenariosPredefinidos.filter(c => nomesCenarios.includes(c.nome));
        
        if (cenariosParaComparar.length === 0) {
            return [];
        }

        return this.comparar(conta, cenariosParaComparar, meses);
    }

    /**
     * Compara um conjunto de cenários e retorna o de maior score de estabilidade.
     */
    comparar(conta: ContaFinanceira, cenarios: Cenario[], meses: number): ResultadoCenario[] {
        const resultados = cenarios.map(cenario => {
            const fluxoDeCaixa = this.geradorFluxoCaixa.executar(conta, cenario.estrategias, meses);
            const ultimoSnapshot = fluxoDeCaixa[fluxoDeCaixa.length - 1];
            const indicadores = this.servicoIndicadores.calcular(ultimoSnapshot);
            return {
                nome: cenario.nome,
                descricao: cenario.descricao,
                scoreFinal: indicadores.scoreFinal
            };
        });

        return resultados;
    }
}
