
import { calculateAllMetrics } from './financial-metrics.js';
import { classifyPhase } from './phase-classifier.js';

/**
 * Orchestrates the client-side financial diagnosis.
 * @param {Array<object>} transactions - The user's transactions from Firestore.
 * @param {object} profile - The user's profile data (containing liquid_assets).
 * @param {object} recommendations - The static recommendations JSON.
 * @returns {object} The complete diagnosis object for rendering.
 */
export function runClientSideDiagnosis(transactions, profile, recommendations) {
    // 1. Prepare the data payload, same as the old backend
    const financialData = {
        incomes: transactions.filter(t => t.type === 'revenue').map(t => ({ amount: t.amount })),
        expenses: transactions.filter(t => t.type === 'expense').map(t => ({ 
            amount: t.amount, 
            priority: t.category === 'essential' ? 'essential' : 'non_essential' 
        })),
        liquid_assets: profile.liquid_assets || 0
    };

    try {
        // 2. Call the Core Engine (now a local JS function)
        const metrics = calculateAllMetrics(financialData);

        // 3. Call the Application Layer (now a local JS function)
        const phase = classifyPhase(metrics);

        // 4. Assemble the final diagnostic object
        const diagnosis = {
            phase,
            metrics,
            recommendations, // Pass recommendations through
            reserveTarget: 6, // The conceptual reserve target
        };
        
        // 5. Render the results using the existing GLOBAL UI function
        // FIX: Explicitly call the function from the window scope
        if (window.renderDiagnosisResults) {
            window.renderDiagnosisResults(diagnosis);
        } else {
            console.error("renderDiagnosisResults function not found on window object.");
        }

    } catch (error) {
        console.error("Error running client-side diagnosis:", error);
        // Optionally, render an error state in the diagnosis panel
        if(window.renderDiagnosisError) {
            window.renderDiagnosisError(error);
        }
    }
}
