import { ContaFinanceira } from '@core-engine/domain/entities/ContaFinanceira';
import { Despesa, TipoDespesa } from '@core-engine/domain/entities/Despesa';

export interface ContaWebDTO {
  receitaMensal: number;
  despesas: Despesa[];
  totalReservas: number;
}

export function toContaFinanceira(dto: ContaWebDTO): ContaFinanceira {
  const despesas = dto.despesas.map(d => new Despesa(d.id, d.descricao, d.valor, d.tipo, d.centroDeCusto));
  return new ContaFinanceira(dto.receitaMensal, despesas, dto.totalReservas);
}
