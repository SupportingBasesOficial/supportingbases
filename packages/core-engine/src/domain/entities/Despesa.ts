
export enum TipoDespesa {
  // Despesas essenciais para manter o padrão de vida
  ESTRUTURAL_FIXA = "ESTRUTURAL_FIXA", // Ex: Aluguel, financiamento
  ESTRUTURAL_VARIAVEL = "ESTRUTURAL_VARIAVEL", // Ex: Supermercado, conta de luz

  // Despesas não essenciais
  VARIAVEL_NAO_ESSENCIAL = "VARIAVEL_NAO_ESSENCIAL", // Ex: Lazer, streaming

  // Despesas focadas em crescimento de patrimônio
  EXPANSAO = "EXPANSAO", // Ex: Investimentos, cursos
}

/**
 * Representa uma despesa como um Value Object imutável.
 * A identidade é definida por suas propriedades, não por um ID.
 */
export class Despesa {
  public readonly id: string;
  public readonly descricao: string;
  public readonly valor: number;
  public readonly tipo: TipoDespesa;
  public readonly centroDeCusto: string;

  constructor(
    id: string,
    descricao: string,
    valor: number,
    tipo: TipoDespesa,
    centroDeCusto: string
  ) {
    if (valor < 0) {
      throw new Error("O valor da despesa não pode ser negativo.");
    }
    this.id = id;
    this.descricao = descricao;
    this.valor = valor;
    this.tipo = tipo;
    this.centroDeCusto = centroDeCusto;
  }

  /**
   * Cria uma nova instância de Despesa com um valor diferente, mantendo a imutabilidade.
   * @param novoValor O novo valor para a despesa.
   * @returns uma nova instância de Despesa.
   */
  public cloneWithNewValue(novoValor: number): Despesa {
    return new Despesa(this.id, this.descricao, novoValor, this.tipo, this.centroDeCusto);
  }
}
