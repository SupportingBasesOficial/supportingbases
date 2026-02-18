
/**
 * =====================================================================================
 *
 *       Filename:  phase-classifier.js
 *
 *    Description:  Application Layer Module for SupportingBases.
 *                  Its sole responsibility is to receive calculated metrics from the
 *                  core-engine and classify the user's financial state into a
 *                  defined "Phase".
 *
 * =====================================================================================
 */

/**
 * Classifies the financial phase based on core metrics.
 * @param {object} metrics - The metrics object from the core-engine.
 * @returns {string} The name of the classified phase.
 */
export function classifyPhase(metrics) {

  // Handle edge cases and invalid data first.
  if (!metrics || !metrics.icf || !metrics.msd || 
      !isFinite(metrics.icf.value) || !isFinite(metrics.msd.value)) {
    return "Erro de Dados";
  }

  const { icf, msd } = metrics;

  // --- Phase Classification Logic ---
  // The thresholds are defined here, making them easy to adjust.

  // Phase 1: Survival (Critical structural pressure)
  if (icf.value > 1.1) {
    return "Fase 1 - Sobrevivência";
  }

  // Phase 2: Neutralization (Operating at the breakeven point)
  if (icf.value > 0.95 && icf.value <= 1.1) {
    return "Fase 2 - Neutralização";
  }

  // Phase 3: Consolidation (Stable, but reserves need to be built)
  // The target for reserves (reserveTarget) is conceptually 6 months.
  const reserveTarget = 6;
  if (icf.value <= 0.95 && msd.value < reserveTarget) {
    return "Fase 3 - Consolidação";
  }

  // Phase 5: Legacy (Exceptional financial strength, long-term focus)
  // This must be checked before Expansion due to its more stringent criteria.
  const legacyMsdThreshold = 24; // 2 years of survival margin
  const legacyIcfThreshold = 0.7;
  if (icf.value <= legacyIcfThreshold && msd.value >= legacyMsdThreshold) {
    return "Fase 5 - Legado";
  }

  // Phase 4: Expansion (Solid foundation, ready to grow)
  if (icf.value <= 0.95 && msd.value >= reserveTarget) {
    return "Fase 4 - Expansão";
  }

  // Fallback case, should not be reached with the logic above.
  return "Erro de Dados"; 
}
