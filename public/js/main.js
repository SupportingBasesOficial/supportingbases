/**
 * =====================================================================================
 *
 *       Filename:  main.js
 *
 *    Description:  Controla a interface, autenticação, fluxo de dados e renderização.
 *
 *      Version:   18.0.0 (Feature - Goals on Dashboard)
 *      Changes:   - Adicionado resumo de metas no Dashboard.
 *                 - `fetchAndProcessData` agora também busca as metas.
 *                 - Nova função `renderGoalsSummary` para exibir as metas no painel.
 *
 * =====================================================================================
 */

// --- Globals & Init ---
let auth, db;
// ... (instâncias de gráficos)

document.addEventListener('DOMContentLoaded', () => {
    // ... (lógica de inicialização e autenticação)
});

// --- Páginas e Componentes ---
// ... (outras funções de página: setupGlobalUserUI, setupOnboardingPage, etc.)

// --- DASHBOARD ---
async function setupDashboardPage(user) {
    setupQuickAddForm(user);
    await refreshDashboard(user);
    const refreshButton = document.getElementById('refresh-dashboard-btn');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => refreshDashboard(user));
    }
}

async function refreshDashboard(user) {
    const loader = document.getElementById('dashboard-loader');
    if (loader) loader.style.display = 'block';
    try {
        const response = await fetch('./js/recommendations.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const recommendations = await response.json();
        const { diagnosis, userData } = await fetchAndProcessData(user.uid, recommendations);
        renderDashboard(diagnosis, userData);
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

async function fetchAndProcessData(uid, recommendations) {
    const [entriesSnap, profileDoc, goalsDoc, goalsSnap] = await Promise.all([
        db.collection('users').doc(uid).collection('entries').orderBy('data', 'desc').limit(100).get(),
        db.collection('users').doc(uid).collection('structural_data').doc('user_profile').get(),
        db.collection('users').doc(uid).collection('structural_data').doc('user_goals').get(),
        db.collection('users').doc(uid).collection('goals').orderBy('targetDate', 'asc').limit(4).get() // Busca as metas
    ]);

    const allEntries = entriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const userGoals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // ... (lógica existente do EngineCore)
    const engine = new EngineCore(recommendations);
    const diagnosis = engine.runStructuralDiagnosis({ /* ... */ });

    return { diagnosis, userData: { allEntries, goals: userGoals } }; // Adiciona metas ao userData
}

function renderDashboard(diagnosis, userData) {
    // ... (lógica existente para renderizar diagnóstico, KPIs, etc.)
    
    renderCharts(userData, diagnosis);
    renderHistory(userData.allEntries);
    renderGoalsSummary(userData.goals); // **NOVO: Chama a função para renderizar metas**
}

function renderGoalsSummary(goals) {
    const container = document.getElementById('dashboard-goals-list');
    if (!container) return;
    container.innerHTML = '';

    if (!goals || goals.length === 0) {
        container.innerHTML = '<li><p>Nenhuma meta cadastrada ainda. <a href="metas.html">Crie sua primeira meta!</a></p></li>';
        return;
    }

    goals.forEach(goal => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const li = document.createElement('li');
        li.classList.add('goal-summary-item');
        li.innerHTML = `
            <div class="goal-info">
                <strong>${goal.name}</strong>
                <p>R$ ${goal.currentAmount.toFixed(2)} / R$ ${goal.targetAmount.toFixed(2)}</p>
            </div>
            <div class="goal-progress">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress.toFixed(2)}%;"></div>
                </div>
                <span>${progress.toFixed(1)}%</span>
            </div>
        `;
        container.appendChild(li);
    });
}

function renderHistory(entries) {
    // ... (lógica existente)
}

function renderCharts(userData, diagnosis) {
    // ... (lógica existente)
}

function setupQuickAddForm(user) {
    // ... (lógica existente)
}

// --- PÁGINA DE OPERAÇÕES ---
async function setupOperationsPage(user) {
    // ... (lógica da página de operações com a vinculação de metas)
}

// ... (outras funções de página)
