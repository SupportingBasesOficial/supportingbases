import { ContaFinanceira } from "@core-engine/domain/entities/ContaFinanceira";
import { MotorDeRecomendacao } from "@core-engine/domain/services/MotorDeRecomendacao";
import { servicoHistorico } from "./core";

// A interface foi revertida para o DTO de apresentação, sem lógicas de domínio.
interface RecomendacaoFormatada {
  titulo: string;
  descricao: string;
  impacto: string;
}

export async function getRecomendacoesUsuario(conta: ContaFinanceira): Promise<RecomendacaoFormatada[]> {
  const motor = new MotorDeRecomendacao(servicoHistorico, conta);
  const cenariosRecomendados = motor.recomendarTodosOsCenarios(conta);

  // O mapeamento foi corrigido para usar 'tipo' em vez de 'estrategia'.
  const recomendacoes = cenariosRecomendados.map(cenario => ({
    titulo: cenario.tipo,
    descricao: cenario.descricao,
    impacto: `R$ ${cenario.impactoEstimado.toFixed(2)} / mês`
  }));

  // A ordenação é responsabilidade do Core, a Web apenas apresenta os dados.
  return recomendacoes;
}
