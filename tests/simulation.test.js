
/**
 * =====================================================================================
 *
 *       Filename:  simulation.test.js
 *
 *    Description:  Suíte de Testes para o MÓDULO 1: ENGINE CORE (v2.8.0).
 *                  Valida a lógica de diagnóstico estrutural sob diversas condições.
 *
 *      Version:   1.0.2
 *      Changes:   - Corrigida a sintaxe do Javascript (escapes) que impedia a execução.
 *                 - Adicionado `receitaDesvioPadrao` ao cenário de dados insuficientes.
 *
 * =====================================================================================
 */

const EngineCore = require('../public/js/simulation.js');
const engine = new EngineCore();

// --- Cenários de Teste ---
const testScenarios = [
    {
        description: "Cenário 1: Fase de Sobrevivência (ICF > 0.95)",
        userData: {
            receitas: [{valor: 2000}],
            despesas: [
                {valor: 1800, tipoCusto: 'fixo'},
                {valor: 200, tipoCusto: 'variavel'}
            ],
            reservas: 100,
            receitaDesvioPadrao: 100, // Receita Ajustada = 2000 - 100*1.5 = 1850
            userGoals: { reserveGoal: 6, riskProfile: 'moderado' }
        },
        expected: {
            structuralPhase: "Fase 1 - Sobrevivência",
            icf: "0.97" // ICF = 1800 / 1850
        }
    },
    {
        description: "Cenário 2: Fase de Neutralização (ICF > 0.75)",
        userData: {
            receitas: [{valor: 3000}],
            despesas: [
                {valor: 2400, tipoCusto: 'fixo'}
            ],
            reservas: 500,
            receitaDesvioPadrao: 200, // Receita Ajustada = 3000 - 200*1.5 = 2700
            userGoals: { reserveGoal: 6, riskProfile: 'moderado' }
        },
        expected: {
            structuralPhase: "Fase 2 - Neutralização",
            icf: "0.89", // ICF = 2400 / 2700
            msd: "0.21" // MSD = 500 / 2400
        }
    },
    {
        description: "Cenário 3: Fase de Consolidação (MSD < Meta)",
        userData: {
            receitas: [{valor: 5000}],
            despesas: [
                {valor: 2500, tipoCusto: 'fixo'},
                {valor: 1000, tipoCusto: 'variavel'}
            ],
            reservas: 10000,
            receitaDesvioPadrao: 300, // Receita Ajustada = 5000 - 300*1.5 = 4550
            userGoals: { reserveGoal: 4, riskProfile: 'moderado' } // Meta de 4 meses
        },
        expected: {
            structuralPhase: "Fase 3 - Consolidação",
            icf: "0.55", // ICF = 2500 / 4550
            msd: "2.86"  // MSD = 10000 / 3500
        }
    },
    {
        description: "Cenário 4: Fase de Expansão (MSD >= Meta)",
        userData: {
            receitas: [{valor: 8000}],
            despesas: [
                {valor: 2000, tipoCusto: 'fixo'},
                {valor: 2000, tipoCusto: 'variavel'}
            ],
            reservas: 25000,
            receitaDesvioPadrao: 500, // Receita Ajustada = 8000 - 500*1.5 = 7250
            userGoals: { reserveGoal: 6, riskProfile: 'moderado' }
        },
        expected: {
            structuralPhase: "Fase 4 - Expansão",
            icf: "0.28", // ICF = 2000 / 7250
            msd: "6.25"  // MSD = 25000 / 4000
        }
    },
    {
        description: "Cenário 5: Perfil Conservador (Safety Factor = 2.0)",
        userData: {
            receitas: [{valor: 2000}],
            despesas: [{valor: 1500, tipoCusto: 'fixo'}],
            reservas: 100,
            receitaDesvioPadrao: 100, // Receita Ajustada = 2000 - 100*2.0 = 1800
            userGoals: { reserveGoal: 6, riskProfile: 'conservador' }
        },
        expected: {
            structuralPhase: "Fase 2 - Neutralização",
            icf: "0.83" // ICF = 1500 / 1800
        }
    },
    {
        description: "Cenário 6: Perfil Agressivo (Safety Factor = 1.0)",
        userData: {
            receitas: [{valor: 2000}],
            despesas: [{valor: 1850, tipoCusto: 'fixo'}],
            reservas: 100,
            receitaDesvioPadrao: 100, // Receita Ajustada = 2000 - 100*1.0 = 1900
            userGoals: { reserveGoal: 6, riskProfile: 'agressivo' }
        },
        expected: {
            structuralPhase: "Fase 1 - Sobrevivência",
            icf: "0.97" // ICF = 1850 / 1900
        }
    },
    {
        description: "Cenário 7: Dados Insuficientes",
        userData: {
            receitas: [],
            despesas: [],
            reservas: 0,
            receitaDesvioPadrao: 0,
            userGoals: { reserveGoal: 6, riskProfile: 'moderado' }
        },
        expected: {
            structuralPhase: "Erro de Dados"
        }
    }
];

// --- Runner de Testes Simples ---
function runTests() {
    console.log("Iniciando testes para EngineCore v2.8.0...");
    let passed = 0;
    let failed = 0;

    testScenarios.forEach((scenario, index) => {
        console.log(`\n--- Executando: ${scenario.description} ---`);
        const diagnosis = engine.runStructuralDiagnosis(scenario.userData);
        let scenarioPassed = true;

        for (const key in scenario.expected) {
            if (diagnosis[key] !== scenario.expected[key]) {
                scenarioPassed = false;
                console.error(`  [FALHOU] ${key}: Esperado '${scenario.expected[key]}', mas retornou '${diagnosis[key]}'`);
            }
        }

        if (scenarioPassed) {
            passed++;
            console.log("  [PASSOU] O diagnóstico corresponde ao esperado.");
        } else {
            failed++;
        }
    });

    console.log(`\n--- Resultado Final ---`);
    console.log(`Testes Concluídos: ${passed} passaram, ${failed} falharam.`);
    console.log("-------------------------");

    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
