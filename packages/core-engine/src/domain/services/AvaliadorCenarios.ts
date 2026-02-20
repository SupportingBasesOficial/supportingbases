
import { ContaFinanceira } from "../entities/ContaFinanceira";
import { EstrategiaProjecao } from "../strategies/EstrategiaProjecao";
import { GerarFluxoDeCaixaProjetado } from "../../application/use-cases/GerarFluxoDeCaixaProjetado";
import { ServicoDeIndicadores } from "./ServicoDeIndicadores";
import { CrescimentoReceitaMensal } from "../strategies/CrescimentoReceitaMensal";
import { InflacaoDespesasMensal } from "../strategies/InflacaoDespesasMensal";

// A interface Cenario antiga foi renomeada para CenarioDeProjecao para manter a lógica de simulação.
interface CenarioDeProjecao {
    nome: string;
    descricao: string;
    estrategias: EstrategiaProjecao[];
}

/**
 * Representa um cenário de recomendação concreto com seus riscos e benefícios.
 * Este é o contrato oficial que deve ser usado em todo o sistema.
 */
export interface Cenario {
  id: string;
  estrategia: string;
  descricao: string;
  impactoEstimado: number;
  scoreFinal: number;
  prioridade: number;
  risco: 'baixo' | 'medio' | 'alto';
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
    private cenariosPredefinidos: CenarioDeProjecao[];

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
     */
    compararCenarios(conta: ContaFinanceira, nomesCenarios: string[], meses: number = 12): ResultadoCenario[] {
        const cenariosParaComparar = this.cenariosPredefinidos.filter(c => nomesCenarios.includes(c.nome));
        
        if (cenariosParaComparar.length === 0) {
            return [];
        }

        return this.comparar(conta, cenariosParaComparar, meses);
    }

    /**
     * Compara um conjunto de cenários de projeção e retorna o de maior score de estabilidade.
     */
    comparar(conta: ContaFinanceira, cenarios: CenarioDeProjecao[], meses: number): ResultadoCenario[] {
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
