
// ARQUIVO DE DEMONSTRAÇÃO DE INTEGRAÇÃO
// Este arquivo mostra como os módulos Core Engine, Gestão Financeira e Marketplace conversam entre si.

import {
  agruparDespesas,
  calculateIndicadoresSaude,
  Despesa,
  TipoDespesa
} from '@supporting/core-engine';

import {
  catalogoMarketplaceExemplo,
  classificarFaseUsuario,
  filterMarketplace,
} from './marketplace/marketplace';

// 1. DADOS SIMULADOS DE UM USUÁRIO
// Na aplicação real, estes dados viriam de um formulário ou banco de dados.
const receitaMensal = 5000;
const totalReservas = 10000;
const despesas: Despesa[] = [
  { id: '1', descricao: 'Aluguel', valor: 2000, tipo: TipoDespesa.ESTRUTURAL_FIXA, centroDeCusto: 'Moradia' },
  { id: '2', descricao: 'Supermercado', valor: 1000, tipo: TipoDespesa.ESTRUTURAL_VARIAVEL, centroDeCusto: 'Alimentação' },
  { id: '3', descricao: 'Internet', valor: 100, tipo: TipoDespesa.ESTRUTURAL_FIXA, centroDeCusto: 'Utilidades' },
  { id: '4', descricao: 'Transporte', valor: 300, tipo: TipoDespesa.ESTRUTURAL_VARIAVEL, centroDeCusto: 'Transporte' },
  { id: '5', descricao: 'Academia', valor: 150, tipo: TipoDespesa.VARIAVEL_NAO_ESSENCIAL, centroDeCusto: 'Saúde' },
  { id: '6', descricao: 'Streaming', valor: 50, tipo: TipoDespesa.VARIAVEL_NAO_ESSENCIAL, centroDeCusto: 'Lazer' },
  { id: '7', descricao: 'Curso de Programação', valor: 500, tipo: TipoDespesa.EXPANSAO, centroDeCusto: 'Educação' },
];

// 2. PROCESSAMENTO COM OS MÓDULOS

// Módulo de Gestão Financeira: Agrupa as despesas
const despesasAgrupadas = agruparDespesas(despesas);

// Módulo de Gestão Financeira: Calcula indicadores de saúde
const indicadores = calculateIndicadoresSaude(receitaMensal, despesasAgrupadas, totalReservas);

// Módulo Marketplace: Classifica o usuário e filtra o marketplace
const faseUsuario = classificarFaseUsuario(indicadores);
const marketplaceFiltrado = filterMarketplace(
  catalogoMarketplaceExemplo,
  faseUsuario,
  indicadores
);

// 3. RESULTADO DA ANÁLISE COMPLETA
// Este objeto consolidado representa o estado atual do usuário no ecossistema SupportingBases.
const analiseCompleta = {
  resumoUsuario: {
    receitaMensal,
    despesasTotais: despesas.reduce((acc, d) => acc + d.valor, 0),
    totalReservas,
  },
  gestaoFinanceira: {
    despesasAgrupadas,
    indicadores,
  },
  marketplace: {
    faseUsuario,
    oportunidadesDisponiveis: marketplaceFiltrado,
  },
};

// 4. EXIBIÇÃO NO CONSOLE (PARA FINS DE DEMONSTRAÇÃO)
console.log('--- ANÁLISE ESTRUTURAL COMPLETA DO USUÁRIO ---');
console.log(JSON.stringify(analiseCompleta, null, 2));


/*
// Para rodar este arquivo e ver o resultado, use o seguinte comando no terminal:
// npx ts-node nextjs-app/lib/integracao.ts
*/
