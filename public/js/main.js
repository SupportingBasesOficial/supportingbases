/**
 * =====================================================================================
 *
 *       Filename:  main.js
 *
 *    Description:  Controla a interface, autenticação, fluxo de dados e renderização.
 *
 *      Version:   13.0.0 (Refactor - Dashboard Logic)
 *      Changes:   - Implementada a lógica de carregamento do dashboard.
 *                 - Adicionado o carregamento de `recommendations.json`.
 *                 - `EngineCore` agora é instanciado com as recomendações.
 *
 * =====================================================================================
 */

// --- Globals & Init ---
let auth, db;
let cashflowChartInstance = null;
let structuralHealthChartInstance = null;
let historyChartInstance = null;
let categoryChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    const authLoader = document.getElementById('auth-loader');
    if (authLoader) authLoader.style.display = 'flex';

    if (typeof firebase === 'undefined') {
        console.error('Firebase não foi inicializado corretamente...');
        if (authLoader) authLoader.style.display = 'none';
        document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: sans-serif; color: red;"><h1>Erro Crítico de Configuração</h1><p>A conexão com os serviços falhou. Verifique as chaves no <code>public/js/firebase-config.js</code>.</p></div>';
        return;
    }

    auth = firebase.auth();
    db = firebase.firestore();

    const path = window.location.pathname.replace(/\/$/, "");

    auth.onAuthStateChanged(async (user) => {
        if (authLoader) authLoader.style.display = 'none';
        const mainContainer = document.getElementById('main-container');
        const isAuthPage = path.includes('login') || path.includes('register') || path.includes('forgot-password');
        const isSetupPage = path.includes('setup.html');
        const isLandingPage = path === "" || path.includes('index.html');

        if (user) {
            const profileDoc = await db.collection('users').doc(user.uid).collection('structural_data').doc('user_profile').get();
            const hasCompletedSetup = profileDoc.exists && profileDoc.data().fullName;

            if (!hasCompletedSetup && !isSetupPage) {
                window.location.href = 'setup.html';
                return;
            }
            if (hasCompletedSetup && (isAuthPage || isLandingPage || isSetupPage)) {
                window.location.href = 'dashboard.html';
                return;
            }
            
            if (mainContainer) mainContainer.style.display = 'block';

            const pageHandlers = {
                'dashboard.html': setupDashboardPage,
                'profile.html': setupProfilePage,
                'operacoes.html': setupOperationsPage,
                'setup.html': setupOnboardingPage
            };
            
            for (const page in pageHandlers) {
                if (path.includes(page)) {
                    pageHandlers[page](user);
                    break;
                }
            }

            setupGlobalUserUI(user);

        } else { // Usuário não logado
            // Redireciona para o login se não estiver em uma página pública/de autenticação
            if (!isAuthPage && !isLandingPage) {
                window.location.href = 'login.html';
                return;
            }
            // A lógica das páginas de autenticação agora está em auth.js
        }
    });
});

// --- COMPONENTES GLOBAIS ---
function setupGlobalUserUI(user) {
    const userEmailSpan = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    if (userEmailSpan) userEmailSpan.textContent = user.email;
    if (logoutBtn) {
        logoutBtn.classList.remove('hidden');
        logoutBtn.addEventListener('click', () => auth.signOut().then(() => window.location.href = 'login.html'));
    }
}

// --- ONBOARDING ---
function setupOnboardingPage(user) {
    const form = document.getElementById('onboarding-form');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const profile = {
                fullName: form.fullName.value,
                birthDate: form.birthDate.value,
                profile: form.profile.value,
                country: form.country.value,
            };
            const userProfileRef = db.collection('users').doc(user.uid).collection('structural_data').doc('user_profile');
            try {
                await userProfileRef.set(profile, { merge: true });
                window.location.href = 'dashboard.html';
            } catch (error) {
                alert("Houve um erro ao salvar seu perfil.");
            }
        });
    }
}

// --- PÁGINA DE PERFIL ---
async function setupProfilePage(user) {
    const profileForm = document.getElementById('profile-form');
    const goalsForm = document.getElementById('goals-form');

    const profileRef = db.collection('users').doc(user.uid).collection('structural_data').doc('user_profile');
    const goalsRef = db.collection('users').doc(user.uid).collection('structural_data').doc('user_goals');

    const [profileDoc, goalsDoc] = await Promise.all([profileRef.get(), goalsRef.get()]);

    if (profileDoc.exists) {
        const data = profileDoc.data();
        profileForm.fullName.value = data.fullName || '';
        profileForm.birthDate.value = data.birthDate || '';
        profileForm.country.value = data.country || '';
        profileForm.profile.value = data.profile || 'pessoa_fisica';
    }

    if (goalsDoc.exists) {
        const data = goalsDoc.data();
        goalsForm.reserveGoal.value = data.reserveGoal || 6;
        goalsForm.riskProfile.value = data.riskProfile || 'moderado';
    } else {
        goalsForm.reserveGoal.value = 6;
        goalsForm.riskProfile.value = 'moderado';
    }

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedProfile = {
            fullName: profileForm.fullName.value,
            birthDate: profileForm.birthDate.value,
            country: profileForm.country.value,
            profile: profileForm.profile.value,
        };
        try {
            await profileRef.set(updatedProfile, { merge: true });
            alert('Dados pessoais atualizados com sucesso!');
        } catch (error) {
            alert('Erro ao atualizar os dados pessoais.');
        }
    });

    goalsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedGoals = {
            reserveGoal: parseFloat(goalsForm.reserveGoal.value),
            riskProfile: goalsForm.riskProfile.value,
        };
        try {
            await goalsRef.set(updatedGoals, { merge: true });
            alert('Metas financeiras atualizadas com sucesso!');
        } catch (error) {
            alert('Erro ao atualizar as metas.');
        }
    });
}

// --- DASHBOARD ---
async function setupDashboardPage(user) {
    setupQuickAddForm(user);
    await refreshDashboard(user); // Initial load

    const refreshButton = document.getElementById('refresh-dashboard-btn');
    if(refreshButton) {
        refreshButton.addEventListener('click', () => refreshDashboard(user));
    }
}

async function refreshDashboard(user) {
    const loader = document.getElementById('dashboard-loader');
    if(loader) loader.style.display = 'block';

    try {
        const response = await fetch('./js/recommendations.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const recommendations = await response.json();
        
        const { diagnosis, userData } = await fetchAndProcessData(user.uid, recommendations);
        
        renderDashboard(diagnosis, userData);

    } catch (error) {
        console.error('Error refreshing dashboard:', error);
        const dashboardElement = document.getElementById('dashboard-content');
        if(dashboardElement) {
            dashboardElement.innerHTML = '<p>Ocorreu um erro ao carregar os dados do dashboard. Tente novamente mais tarde.</p>';
        }
    } finally {
        if(loader) loader.style.display = 'none';
    }
}

async function fetchAndProcessData(uid, recommendations) {
    const [entriesSnap, profileDoc, goalsDoc] = await Promise.all([
        db.collection('users').doc(uid).collection('entries').orderBy('data', 'desc').limit(100).get(),
        db.collection('users').doc(uid).collection('structural_data').doc('user_profile').get(),
        db.collection('users').doc(uid).collection('structural_data').doc('user_goals').get()
    ]);

    const allEntries = entriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const receitas = allEntries.filter(e => e.tipo === 'receita');
    const despesas = allEntries.filter(e => e.tipo === 'despesa');

    const userProfile = profileDoc.data() || {};
    const userGoals = goalsDoc.data() || { reserveGoal: 6, riskProfile: 'moderado' };
    
    const reservas = despesas.filter(d => d.categoria === 'Reserva de Emergência' || d.categoria === 'Investimentos').reduce((acc, d) => acc + d.valor, 0);

    const monthlyRevenue = receitas.filter(r => new Date(r.data) > new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const revenueValues = monthlyRevenue.map(r => r.valor);
    const avgRevenue = revenueValues.reduce((a, b) => a + b, 0) / (revenueValues.length || 1);
    const receitaDesvioPadrao = Math.sqrt(revenueValues.map(x => Math.pow(x - avgRevenue, 2)).reduce((a, b) => a + b, 0) / (revenueValues.length || 1)) || 0;

    const userData = {
        receitas: monthlyRevenue,
        despesas,
        userProfile,
        userGoals,
        reservas,
        receitaDesvioPadrao
    };

    const engine = new EngineCore(recommendations);
    const diagnosis = engine.runStructuralDiagnosis(userData);

    return { diagnosis, userData: { ...userData, allEntries } };
}

function renderDashboard(diagnosis, userData) {
    const { structuralPhase, icf, iia, msd, recommendation } = diagnosis;
    
    document.getElementById('structural-phase').textContent = structuralPhase || 'N/A';
    document.getElementById('icf-value').textContent = icf || 'N/A';
    document.getElementById('iia-value').textContent = iia || 'N/A';
    document.getElementById('msd-value').textContent = msd || 'N/A';
    
    const recommendationBox = document.getElementById('recommendation-box');
    recommendationBox.innerHTML = recommendation || '<p>Não foi possível gerar uma recomendação.</p>';
    
    renderCharts(userData, diagnosis);
    renderHistory(userData.allEntries);
}

function renderHistory(entries) {
    const historyList = document.getElementById('transaction-history-list');
    if (!historyList) return;
    historyList.innerHTML = '';
    entries.slice(0, 5).forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${new Date(entry.data).toLocaleDateString()}</span>
            <span>${entry.descricao}</span>
            <span class="${entry.tipo === 'receita' ? 'text-green-500' : 'text-red-500'}">R$ ${entry.valor.toFixed(2)}</span>
        `;
        historyList.appendChild(li);
    });
}

function renderCharts(userData, diagnosis) {
    const structuralCtx = document.getElementById('structural-health-chart');
    if (structuralCtx) {
        if (structuralHealthChartInstance) structuralHealthChartInstance.destroy();
        structuralHealthChartInstance = new Chart(structuralCtx, {
            type: 'bar',
            data: {
                labels: ['ICF', 'MSD'],
                datasets: [{
                    label: 'Índices Estruturais',
                    data: [diagnosis.icf, diagnosis.msd],
                    backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                    borderWidth: 1
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    }

    const categoryCtx = document.getElementById('category-chart');
    if (categoryCtx) {
        const categoryData = userData.despesas.reduce((acc, d) => {
            acc[d.categoria] = (acc[d.categoria] || 0) + d.valor;
            return acc;
        }, {});
        if (categoryChartInstance) categoryChartInstance.destroy();
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    label: 'Despesas por Categoria',
                    data: Object.values(categoryData),
                    backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)'],
                }]
            }
        });
    }
}

function setupQuickAddForm(user) {
    const form = document.getElementById('quick-add-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const entry = {
                descricao: form.descricao.value,
                valor: parseFloat(form.valor.value),
                tipo: form.tipo.value,
                categoria: form.categoria.value,
                data: new Date().toISOString()
            };
            try {
                await db.collection('users').doc(user.uid).collection('entries').add(entry);
                form.reset();
                await refreshDashboard(user);
            } catch (error) {
                alert('Erro ao adicionar lançamento.');
                console.error('Error adding entry:', error);
            }
        });
    }
}

// --- PÁGINA DE OPERAÇÕES ---
async function setupOperationsPage(user) {
    const entryForm = document.getElementById('entry-form');
    const historyContainer = document.getElementById('history-container');
    const entriesRef = db.collection('users').doc(user.uid).collection('entries').orderBy('data', 'desc');

    async function loadEntries() {
        const snapshot = await entriesRef.get();
        historyContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const entry = doc.data();
            const div = document.createElement('div');
            div.classList.add('history-item');
            div.innerHTML = `
                <span>${new Date(entry.data).toLocaleDateString()}</span>
                <span>${entry.descricao}</span>
                <span>${entry.categoria}</span>
                <span class="valor ${entry.tipo}">${entry.tipo === 'receita' ? '+' : '-'} R$ ${entry.valor.toFixed(2)}</span>
                <button data-id="${doc.id}" class="delete-btn">X</button>
            `;
            historyContainer.appendChild(div);
        });
    }

    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const entry = {
            descricao: entryForm.descricao.value,
            valor: parseFloat(entryForm.valor.value),
            tipo: entryForm.tipo.value,
            categoria: entryForm.categoria.value,
            data: entryForm.data.value ? new Date(entryForm.data.value).toISOString() : new Date().toISOString()
        };
        await db.collection('users').doc(user.uid).collection('entries').add(entry);
        entryForm.reset();
        await loadEntries();
    });

    historyContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Tem certeza que deseja apagar este lançamento?')) {
                await db.collection('users').doc(user.uid).collection('entries').doc(id).delete();
                await loadEntries();
            }
        }
    });

    await loadEntries();
}
