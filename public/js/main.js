/**
 * =====================================================================================
 *
 *       Filename:  main.js
 *
 *    Description:  Controla a interface, autenticação, fluxo de dados e renderização.
 *
 *      Version:   16.0.0 (Feature - Goals Page)
 *      Changes:   - Adicionada a lógica para a página de Metas (setupGoalsPage).
 *                 - Refatoração do router de páginas para incluir a nova página.
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

    auth.onAuthStateChanged(async (user) => {
        if (authLoader) authLoader.style.display = 'none';
        const mainContainer = document.getElementById('main-container');
        const path = window.location.pathname.split("/").pop();
        
        const isAuthPage = ['login.html', 'register.html', 'forgot-password.html'].includes(path);
        const isSetupPage = path === 'setup.html';
        const isLandingPage = path === '' || path === 'index.html';

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
            
            if (mainContainer) mainContainer.style.display = 'flex'; // Changed to flex for app-container

            const pageHandlers = {
                'dashboard.html': setupDashboardPage,
                'profile.html': setupProfilePage,
                'operacoes.html': setupOperationsPage,
                'setup.html': setupOnboardingPage,
                'metas.html': setupGoalsPage // Nova página de metas
            };
            
            if (pageHandlers[path]) {
                pageHandlers[path](user);
            }

            setupGlobalUserUI(user);

        } else { // Usuário não logado
            if (!isAuthPage && !isLandingPage) {
                window.location.href = 'login.html';
                return;
            }
        }
    });
});

// --- COMPONENTES GLOBAIS ---
function setupGlobalUserUI(user) {
    const userEmailSpan = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    if (userEmailSpan) userEmailSpan.textContent = user.email;
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => auth.signOut().then(() => window.location.href = 'index.html'));
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
    }

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await profileRef.set({ /* ...form data... */ }, { merge: true });
        alert('Dados pessoais atualizados!');
    });

    goalsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await goalsRef.set({ /* ...form data... */ }, { merge: true });
        alert('Parâmetros da análise atualizados!');
    });
}

// --- PÁGINA DE METAS ---
async function setupGoalsPage(user) {
    const goalForm = document.getElementById('goal-form');
    const goalsContainer = document.getElementById('goals-list-container');
    const goalsRef = db.collection('users').doc(user.uid).collection('goals').orderBy('targetDate', 'asc');

    async function loadGoals() {
        const snapshot = await goalsRef.get();
        goalsContainer.innerHTML = '';
        if (snapshot.empty) {
            goalsContainer.innerHTML = '<p>Você ainda não cadastrou nenhuma meta. Comece agora!</p>';
            return;
        }

        snapshot.forEach(doc => {
            const goal = doc.data();
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const goalEl = document.createElement('div');
            goalEl.classList.add('goal-item');
            goalEl.innerHTML = `
                <div class="goal-info">
                    <h4>${goal.name}</h4>
                    <p>R$ ${goal.currentAmount.toFixed(2)} / R$ ${goal.targetAmount.toFixed(2)}</p>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progress.toFixed(2)}%;"></div>
                    </div>
                    <span>${progress.toFixed(1)}%</span>
                </div>
                <div class="goal-actions">
                     <button class="delete-goal-btn" data-id="${doc.id}">Excluir</button>
                </div>
            `;
            goalsContainer.appendChild(goalEl);
        });
    }

    goalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newGoal = {
            name: goalForm['goal-name'].value,
            targetAmount: parseFloat(goalForm['goal-target-amount'].value),
            currentAmount: parseFloat(goalForm['goal-current-amount'].value),
            targetDate: goalForm['goal-target-date'].value,
            createdAt: new Date().toISOString()
        };
        await db.collection('users').doc(user.uid).collection('goals').add(newGoal);
        goalForm.reset();
        await loadGoals();
    });

    goalsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-goal-btn')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir esta meta?')) {
                await db.collection('users').doc(user.uid).collection('goals').doc(id).delete();
                await loadGoals();
            }
        }
    });

    await loadGoals();
}


// --- DASHBOARD ---
async function setupDashboardPage(user) {
    setupQuickAddForm(user);
    await refreshDashboard(user); // Initial load
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
    const [entriesSnap, profileDoc, goalsDoc] = await Promise.all([
        db.collection('users').doc(uid).collection('entries').orderBy('data', 'desc').limit(100).get(),
        db.collection('users').doc(uid).collection('structural_data').doc('user_profile').get(),
        db.collection('users').doc(uid).collection('structural_data').doc('user_goals').get()
    ]);

    const allEntries = entriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const userProfile = profileDoc.data() || {};
    const userGoals = goalsDoc.data() || { reserveGoal: 6, riskProfile: 'moderado' };
    
    // Lógica para EngineCore (simplificada)
    const engine = new EngineCore(recommendations);
    const diagnosis = engine.runStructuralDiagnosis({ /* ...userData... */ });

    return { diagnosis, userData: { allEntries } };
}

function renderDashboard(diagnosis, userData) {
    const { structuralPhase, icf, iia, msd, recommendation } = diagnosis;
    document.getElementById('diagnosis-phase-title').textContent = structuralPhase || '--';
    document.getElementById('kpi-icf').textContent = icf !== null ? `${(icf * 100).toFixed(1)}%` : '--';
    document.getElementById('kpi-iia').textContent = iia !== null ? `${(iia * 100).toFixed(1)}%` : '--';
    document.getElementById('kpi-msd').textContent = msd !== null ? msd.toFixed(1) : '--';
    document.getElementById('action-plan-content').innerHTML = recommendation || '<p>...</p>';
    
    renderCharts(userData, diagnosis);
    renderHistory(userData.allEntries);
}

function renderHistory(entries) {
    const historyList = document.getElementById('transaction-history-list');
    if (!historyList) return;
    historyList.innerHTML = '';
    entries.slice(0, 5).forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${new Date(entry.data).toLocaleDateString()}</span>...`;
        historyList.appendChild(li);
    });
}

function renderCharts(userData, diagnosis) {
    // Lógica dos gráficos do dashboard...
}

function setupQuickAddForm(user) {
    const form = document.getElementById('quick-add-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const entry = { /* ... form data ... */ };
            await db.collection('users').doc(user.uid).collection('entries').add(entry);
            form.reset();
            await refreshDashboard(user);
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
            div.innerHTML = `<span>${new Date(entry.data).toLocaleDateString()}</span>...<button data-id="${doc.id}" class="delete-btn">X</button>`;
            historyContainer.appendChild(div);
        });
    }

    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Lógica de adicionar/editar transação...
        await loadEntries();
    });

    historyContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Tem certeza?')) {
                await db.collection('users').doc(user.uid).collection('entries').doc(id).delete();
                await loadEntries();
            }
        }
    });

    await loadEntries();
}
