
import {
  SimulationInput,
  ScenarioEvaluation,
  Alert,
  AlertType,
  CenarioLabel,
} from "../../contracts";
import { AlertService } from "../AlertService";

const MIN_PROFITABILITY_THRESHOLD = 1.0; // Minimum acceptable annual return %
const MAX_RISK_THRESHOLD = 0.5; // Maximum acceptable risk spread
const SHORT_HORIZON_MONTHS = 24; // Time horizon considered too short for significant gains

/**
 * A default implementation of the AlertService.
 * It generates alerts based on predefined thresholds for risk, profitability, and time horizon.
 */
export class DefaultAlertService implements AlertService {
  /**
   * Generates alerts by checking for high risk, low profitability, or a short investment horizon.
   * @param input The original simulation input.
   * @param scenarios The array of evaluated scenarios.
   * @returns A readonly array of alerts.
   */
  public generate(
    input: SimulationInput,
    scenarios: readonly ScenarioEvaluation[]
  ): readonly Alert[] {
    const alerts: Alert[] = [];

    const baseScenario = scenarios.find((s) => s.label === CenarioLabel.BASE);
    const optimisticScenario = scenarios.find((s) => s.label === CenarioLabel.OTIMISTA);
    const pessimisticScenario = scenarios.find((s) => s.label === CenarioLabel.PESSIMISTA);

    if (!baseScenario || !optimisticScenario || !pessimisticScenario) {
      return []; // Should not happen
    }

    // 1. Alert for Low Profitability
    if (input.taxaRetornoAnual < MIN_PROFITABILITY_THRESHOLD) {
      alerts.push({
        type: AlertType.AVISO,
        title: "Rentabilidade Baixa",
        message: `Sua taxa de retorno anual de ${input.taxaRetornoAnual}% é muito conservadora e pode não superar a inflação. Considere ativos com maior potencial de crescimento.`,
      });
    }

    // 2. Alert for High Risk
    const spread = optimisticScenario.patrimonioProjetado - pessimisticScenario.patrimonioProjetado;
    const riskRatio = baseScenario.patrimonioProjetado > 0 ? spread / baseScenario.patrimonioProjetado : 0;

    if (riskRatio > MAX_RISK_THRESHOLD) {
      alerts.push({
        type: AlertType.ALERTA,
        title: "Risco Elevado",
        message: "A projeção indica uma alta volatilidade. A diferença entre o melhor e o pior cenário é significativa, o que sugere um maior risco de perda de capital.",
      });
    }

    // 3. Alert for Short Investment Horizon
    if (input.horizonteMeses < SHORT_HORIZON_MONTHS) {
      alerts.push({
        type: AlertType.INFO,
        title: "Horizonte de Curto Prazo",
        message: `Um horizonte de ${input.horizonteMeses} meses é considerado curto. Para investimentos com maior volatilidade, prazos mais longos são geralmente mais adequados para mitigar riscos.`,
      });
    }

    return Object.freeze(alerts);
  }
}
