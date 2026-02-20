
import { SimulationInput, ProjectionResult } from '../../contracts';
import { ProjectionService } from '../ProjectionService';

/**
 * Concrete implementation of the ProjectionService that uses a compound interest formula
 * including monthly contributions.
 */
export class CompoundInterestProjectionService implements ProjectionService {
  /**
   * Calculates the projected wealth based on compound interest with regular monthly investments.
   * M = P * (1 + r)^n + A * (((1 + r)^n - 1) / r)
   * Where:
   * M = Future Value
   * P = Principal (patrimonioAtual)
   * r = Monthly interest rate (taxaRetornoAnual / 12)
   * n = Number of months (horizonteMeses)
   * A = Monthly contribution (aporteMensal)
   * @param input The financial parameters for the projection.
   * @returns The calculated projection result.
   */
  public project(input: SimulationInput): ProjectionResult {
    const { patrimonioAtual, aporteMensal, taxaRetornoAnual, horizonteMeses } = input;

    // Convert annual rate to monthly and handle the percentage
    const monthlyRate = taxaRetornoAnual / 100 / 12;

    // If the rate is zero, the calculation is simpler
    if (monthlyRate === 0) {
      const patrimonioProjetado = patrimonioAtual + aporteMensal * horizonteMeses;
      return {
        patrimonioProjetado,
        rentabilidadePercentual: 0,
      };
    }

    // Calculate future value of the principal
    const futureValueOfPrincipal = patrimonioAtual * Math.pow(1 + monthlyRate, horizonteMeses);

    // Calculate future value of the series of monthly contributions
    const futureValueOfContributions = aporteMensal * ((Math.pow(1 + monthlyRate, horizonteMeses) - 1) / monthlyRate);

    const patrimonioProjetado = futureValueOfPrincipal + futureValueOfContributions;
    const totalInvestido = patrimonioAtual + aporteMensal * horizonteMeses;
    const lucro = patrimonioProjetado - totalInvestido;
    const rentabilidadePercentual = totalInvestido > 0 ? (lucro / totalInvestido) * 100 : 0;

    return {
      patrimonioProjetado,
      rentabilidadePercentual,
    };
  }
}
