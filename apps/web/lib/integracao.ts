import { ContaFinanceira } from '@core-engine/domain/entities/ContaFinanceira';
import { Despesa, TipoDespesa } from '@core-engine/domain/entities/Despesa';
import { toContaFinanceira, ContaWebDTO } from './adapters';

export function getContaUsuarioLogado(): ContaFinanceira {
  const mockData: ContaWebDTO = {
    receitaMensal: 5000,
    despesas: [
      new Despesa('d1', 'Aluguel', 1500, TipoDespesa.ESTRUTURAL_FIXA, 'Moradia'),
      new Despesa('d2', 'Supermercado', 800, TipoDespesa.ESTRUTURAL_VARIAVEL, 'Alimentação'),
      new Despesa('d3', 'Lazer', 400, TipoDespesa.VARIAVEL_NAO_ESSENCIAL, 'Pessoal'),
    ],
    totalReservas: 10000,
  };
  return toContaFinanceira(mockData);
}
