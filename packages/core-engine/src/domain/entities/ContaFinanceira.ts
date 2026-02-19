
import { Despesa, TipoDespesa } from "./Despesa";
import { IndicadoresSaude } from "./IndicadoresSaude";
import { agruparDespesas } from "../services/ServicoDeDespesas";
import { SnapshotFinanceiro } from "./SnapshotFinanceiro";
import { EstrategiaProjecao } from "../strategies/EstrategiaProjecao";

/**
 * Entidade principal que gerencia o estado financeiro e orquestra simulações.
 */
export class ContaFinanceira {
  private _receitaMensal: number;
  private _despesas: Despesa[];
  private _totalReservas: number;

  constructor(receitaMensal: number, despesas: Despesa[], totalReservas: number) {
    if (receitaMensal < 0) throw new Error("A receita mensal não pode ser negativa.");
    this._receitaMensal = receitaMensal;
    this._despesas = despesas;
    this._totalReservas = totalReservas;
  }

  get receitaMensal(): number { return this._receitaMensal; }
  get despesas(): ReadonlyArray<Despesa> { return [...this._despesas]; }
  get totalReservas(): number { return this._totalReservas; }

  adicionarDespesa(despesa: Despesa): void {
    this._despesas.push(despesa);
  }

  atualizarReceita(novaReceita: number): void {
    if (novaReceita < 0) throw new Error("A receita mensal não pode ser negativa.");
    this._receitaMensal = novaReceita;
  }

  public snapshotAtual(): SnapshotFinanceiro {
    return new SnapshotFinanceiro(this._receitaMensal, agruparDespesas(this._despesas), this._totalReservas);
  }

  gerarIndicadores(): IndicadoresSaude {
    return this.snapshotAtual().calcularIndicadores();
  }

  estaEmColapso(): boolean {
    const indicadores = this.gerarIndicadores();
    return indicadores.fluxoDeCaixa < 0 && indicadores.nivelDeReserva < 1;
  }

  simularCorteDespesas(percentual: number): IndicadoresSaude {
    if (percentual < 0 || percentual > 100) throw new Error("O percentual de corte deve estar entre 0 e 100.");

    const fatorReducao = 1 - percentual / 100;
    const despesasSimuladas = this._despesas.map(d =>
      d.tipo === TipoDespesa.VARIAVEL_NAO_ESSENCIAL || d.tipo === TipoDespesa.EXPANSAO
        ? d.cloneWithNewValue(d.valor * fatorReducao)
        : d
    );
    
    const snapshotSimulado = new SnapshotFinanceiro(this._receitaMensal, agruparDespesas(despesasSimuladas), this._totalReservas);
    return snapshotSimulado.calcularIndicadores();
  }

  /**
   * Projeta o estado financeiro para os próximos meses, aplicando estratégias de transformação.
   * @param qtdMeses A quantidade de meses para projetar.
   * @param estrategias Uma lista de estratégias (ex: inflação, crescimento) a serem aplicadas em cada mês.
   * @returns Uma lista de snapshots financeiros para cada mês futuro.
   */
  public projetarMeses(
    qtdMeses: number,
    estrategias: EstrategiaProjecao[] = []
  ): SnapshotFinanceiro[] {
    const projecoes: SnapshotFinanceiro[] = [];
    let snapshotAnterior = this.snapshotAtual();

    for (let mes = 1; mes <= qtdMeses; mes++) {
      const fluxoDeCaixa = snapshotAnterior.calcularIndicadores().fluxoDeCaixa;
      let snapshotProjetado = new SnapshotFinanceiro(
        snapshotAnterior.receita,
        snapshotAnterior.despesas,
        snapshotAnterior.reservas + fluxoDeCaixa
      );

      // Aplica o pipeline de estratégias de transformação
      for (const estrategia of estrategias) {
        snapshotProjetado = estrategia.aplicar(snapshotProjetado, mes);
      }

      projecoes.push(snapshotProjetado);
      snapshotAnterior = snapshotProjetado;
    }

    return projecoes;
  }
}
