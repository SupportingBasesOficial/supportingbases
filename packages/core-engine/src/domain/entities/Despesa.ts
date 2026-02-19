
/**
 * Define os tipos de despesa para classificação inteligente.
 */
export enum TipoDespesa {
  ESTRUTURAL_FIXA = 'ESTRUTURAL_FIXA',
  ESTRUTURAL_VARIAVEL = 'ESTRUTURAL_VARIAVEL',
  VARIAVEL_NAO_ESSENCIAL = 'VARIAVEL_NAO_ESSENCIAL',
  EXPANSAO = 'EXPANSAO'
}

/**
 * Representa uma única despesa classificada.
 */
export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  tipo: TipoDespesa;
  centroDeCusto: string; // Ex: Moradia, Alimentação, Educação
}
