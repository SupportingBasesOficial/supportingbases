
// MÓDULO 3 — MARKETPLACE ESTRUTURAL
// Conecta a estabilidade financeira do usuário a produtos, serviços e oportunidades contextuais.

import { IndicadoresSaude } from '@supporting/core-engine';

/**
 * Define as fases da jornada do usuário dentro do ecossistema.
 * A fase determina o tipo de oportunidade que será apresentada.
 * - SOBREVIVENCIA: Foco em estabilizar e sair do risco.
 * - ESTABILIZACAO: Construção de reservas e otimização.
 * - CRESCIMENTO: Foco em aumentar renda e investir.
 * - EXPENSAO: Construção de patrimônio e escala.
 */
export enum FaseUsuario {
  SOBREVIVENCIA = 'SOBREVIVENCIA',
  ESTABILIZACAO = 'ESTABILIZACAO',
  CRESCIMENTO = 'CRESCIMENTO',
  EXPANSAO = 'EXPANSAO',
}

/**
 * Define o tipo de item disponível no marketplace.
 */
export type TipoProdutoMarketplace = 'PRODUTO_FINANCEIRO' | 'SERVICO_ESTRUTURAL' | 'OPORTUNIDADE_RENDA' | 'FERRAMENTA';

/**
 * Representa um item genérico no marketplace.
 */
export interface MarketplaceItem {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoProdutoMarketplace;
  // Requisitos para que este item seja visível para o usuário
  requisitos: {
    faseMinima: FaseUsuario;
    scoreMinimo: number; // Score de estabilidade (0-1000)
    rendaMinima?: number;
  };
}

/**
 * Determina a fase atual do usuário com base em seus indicadores de saúde.
 * @param indicadores - Os indicadores de saúde financeira do usuário.
 * @returns A fase atual do usuário.
 */
export function classificarFaseUsuario(indicadores: IndicadoresSaude): FaseUsuario {
  if (indicadores.scoreEstabilidade < 400 || indicadores.nivelDeReserva < 1) {
    return FaseUsuario.SOBREVIVENCIA;
  }
  if (indicadores.scoreEstabilidade < 700 || indicadores.nivelDeReserva < 3) {
    return FaseUsuario.ESTABILIZACAO;
  }
  if (indicadores.scoreEstabilidade < 900 || indicadores.nivelDeReserva < 6) {
    return FaseUsuario.CRESCIMENTO;
  }
  return FaseUsuario.EXPANSAO;
}

/**
 * Filtra o catálogo do marketplace com base na fase e nos indicadores do usuário.
 * Esta é a lógica central que garante que o usuário só veja oportunidades adequadas.
 * @param todosOsItens - O catálogo completo de itens do marketplace.
 * @param faseUsuario - A fase atual do usuário.
 * @param indicadores - Os indicadores de saúde financeira do usuário.
 * @returns Uma lista de itens filtrada e apropriada para o usuário.
 */
export function filterMarketplace(
  todosOsItens: MarketplaceItem[],
  faseUsuario: FaseUsuario,
  indicadores: IndicadoresSaude
): MarketplaceItem[] {
  const fasesPermitidas = new Set<FaseUsuario>();
  switch (faseUsuario) {
    case FaseUsuario.EXPANSAO:
      fasesPermitidas.add(FaseUsuario.EXPANSAO);
    case FaseUsuario.CRESCIMENTO:
      fasesPermitidas.add(FaseUsuario.CRESCIMENTO);
    case FaseUsuario.ESTABILIZACAO:
      fasesPermitidas.add(FaseUsuario.ESTABILIZACAO);
    case FaseUsuario.SOBREVIVENCIA:
      fasesPermitidas.add(FaseUsuario.SOBREVIVENCIA);
  }

  return todosOsItens.filter(item => {
    const atendeFase = fasesPermitidas.has(item.requisitos.faseMinima);
    const atendeScore = indicadores.scoreEstabilidade >= item.requisitos.scoreMinimo;
    // Outras condições, como renda mínima, podem ser adicionadas aqui.

    return atendeFase && atendeScore;
  });
}

/**
 * Exemplo de um catálogo de produtos do marketplace.
 * Na aplicação real, isso viria de um banco de dados.
 */
export const catalogoMarketplaceExemplo: MarketplaceItem[] = [
  {
    id: '1',
    nome: 'Consultoria de Dívidas',
    descricao: 'Serviço para renegociar dívidas e limpar seu nome.',
    tipo: 'SERVICO_ESTRUTURAL',
    requisitos: { faseMinima: FaseUsuario.SOBREVIVENCIA, scoreMinimo: 0 },
  },
  {
    id: '2',
    nome: 'Reserva de Emergência Guiada',
    descricao: 'Produto financeiro para construir sua reserva de emergência com segurança.',
    tipo: 'PRODUTO_FINANCEIRO',
    requisitos: { faseMinima: FaseUsuario.ESTABILIZACAO, scoreMinimo: 400 },
  },
  {
    id: '3',
    nome: 'Curso de Renda Extra Online',
    descricao: 'Aprenda novas habilidades para gerar uma fonte de renda adicional.',
    tipo: 'OPORTUNIDADE_RENDA',
    requisitos: { faseMinima: FaseUsuario.CRESCIMENTO, scoreMinimo: 700 },
  },
  {
    id: '4',
    nome: 'Plataforma de Micro-Franquias',
    descricao: 'Invista em um negócio de baixo custo e alta escalabilidade.',
    tipo: 'OPORTUNIDADE_RENDA',
    requisitos: { faseMinima: FaseUsuario.EXPANSAO, scoreMinimo: 900 },
  },
];
