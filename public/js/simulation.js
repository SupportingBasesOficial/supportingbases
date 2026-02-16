/**
 * =====================================================================================
 *
 *       Filename:  simulation.js
 *
 *    Description:  MÓDULO 1: ENGINE CORE (Motor de Engenharia Anticolapso).
 *                  Este módulo é o núcleo matemático do SupportingBases.
 *
 *      Version:   4.1.0 (Refactor - Recommendations as JSON)
 *      Changes:   - Recomendações estratégicas movidas para um arquivo JSON externo (recommendations.json).
 *                  - Lógica de `generateStrategicRecommendations` atualizada para carregar e processar o JSON.
 *
 * =====================================================================================
 */

class EngineCore {

    constructor(recommendations) {
        this.recommendations = recommendations;
    }

    runStructuralDiagnosis(userData) {
        if (!this.validateUserData(userData)) {
            return { structuralPhase: "Erro de Dados", icf: null, iia: null, msd: null, recommendation: "<p>Dados insuficientes para análise.</p>" };
        }

        const { adjustedRevenue, fixedObligations, totalObligations } = this.calculateCoreInputs(userData);

        const icf = this.calculateICF(fixedObligations, adjustedRevenue);
        const msd = this.calculateMSD(userData.reservas, totalObligations, userData.receitas);
        const iia = this.calculateIIA(totalObligations, adjustedRevenue);

        const structuralPhase = this.determineStructuralPhase(icf, msd, userData.userGoals);

        const recommendation = this.generateStrategicRecommendations(structuralPhase, icf, msd, userData.userGoals, userData.userProfile);

        return {
            structuralPhase,
            icf,
            iia,
            msd,
            recommendation
        };
    }

    validateUserData(userData) {
        const hasRequiredKeys = userData && 'despesas' in userData && 'receitas' in userData && 'userGoals' in userData && 'userProfile' in userData;
        if (!hasRequiredKeys) return false;
        return userData.receitas.length > 0 || userData.despesas.length > 0;
    }

    calculateCoreInputs(userData) {
        let safetyFactor;
        switch (userData.userGoals.riskProfile) {
            case 'conservador': safetyFactor = 2.0; break;
            case 'agressivo': safetyFactor = 1.0; break;
            default: safetyFactor = 1.5;
        }

        const averageRevenue = userData.receitas.length > 0 ? userData.receitas.reduce((acc, r) => acc + r.valor, 0) / userData.receitas.length : 0;
        const volatilityAdjustment = (userData.receitaDesvioPadrao || 0) * safetyFactor;
        const adjustedRevenue = Math.max(1, averageRevenue - volatilityAdjustment);
        const fixedObligations = userData.despesas.filter(d => d.tipoCusto === 'fixo').reduce((acc, d) => acc + d.valor, 0);
        const totalObligations = userData.despesas.reduce((acc, d) => acc + d.valor, 0);
        return { adjustedRevenue, fixedObligations, totalObligations };
    }

    calculateICF(fixedObligations, adjustedRevenue) {
        if (adjustedRevenue === 0) return Infinity;
        return (fixedObligations / adjustedRevenue).toFixed(2);
    }

    calculateMSD(reservas, totalObligations) {
        if (totalObligations === 0) return Infinity;
        return (reservas / totalObligations).toFixed(2);
    }

    calculateIIA(totalObligations, adjustedRevenue) {
        const netFlow = adjustedRevenue - totalObligations;
        if (netFlow >= 0) return "0.00";
        return Math.abs(netFlow / adjustedRevenue).toFixed(2);
    }

    determineStructuralPhase(icf, msd, userGoals) {
        const reserveTarget = userGoals.reserveGoal || 6;
        if (icf > 0.95) return "Fase 1 - Sobrevivência";
        if (icf > 0.75) return "Fase 2 - Neutralização";
        if (msd < reserveTarget) return "Fase 3 - Consolidação";
        return "Fase 4 - Expansão";
    }

    generateStrategicRecommendations(phase, icf, msd, userGoals, userProfile) {
        const reserveTarget = userGoals.reserveGoal || 6;
        const profile = userProfile.profile || 'pessoa_fisica';

        const recommendationTemplate = this.recommendations[phase] ? this.recommendations[phase][profile] : "<p>Analisando sua estrutura para gerar recomendações...</p>";

        // Replace placeholders with actual values
        return recommendationTemplate
            .replace('${icf}', icf)
            .replace('${msd}', msd)
            .replace('${reserveTarget}', reserveTarget);
    }
}

// To be used in a browser environment, you would fetch the JSON and then instantiate the class:
// fetch('./js/recommendations.json')
//   .then(response => response.json())
//   .then(recommendations => {
//     const engine = new EngineCore(recommendations);
//     // Now you can use the engine instance
//   });


if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = EngineCore;
}
