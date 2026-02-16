/**
 * =====================================================================================
 *
 *       Filename:  main.js
 *
 *    Description:  Controla a interface, autenticação, fluxo de dados e renderização.
 *
 *      Version:   12.0.0 (Hotfix - Auth Flow)
 *      Changes:   - Revertida a passagem de parâmetros `auth` e `db`.
 *                 - As variáveis `auth` e `db` agora são globais, garantindo que o
 *                   fluxo de autenticação funcione corretamente em todas as páginas.
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

    // Inicialização das variáveis globais
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
                window.location.href = '/setup.html';
                return;
            }
            if (hasCompletedSetup && (isAuthPage || isLandingPage || isSetupPage)) {
                window.location.href = '/dashboard.html';
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
            if (!isAuthPage && !isLandingPage) {
                window.location.href = '/login.html';
                return;
            }
             // Roteamento de páginas públicas
            if (path.includes('login.html')) setupLoginPage();
            if (path.includes('register.html')) setupRegisterPage();
            if (path.includes('forgot-password.html')) setupForgotPasswordPage();
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
        logoutBtn.addEventListener('click', () => auth.signOut().then(() => window.location.href = '/login.html'));
    }
}

// --- PÁGINAS DE AUTENTICAÇÃO ---
function setupAuthForm(formId, authFunction) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.email.value;
            const password = form.password.value;
            authFunction(email, password);
        });
    }
}

function setupLoginPage() {
    setupAuthForm('login-form', (email, password) => {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => window.location.href = '/dashboard.html')
            .catch(error => alert("Erro no login: " + error.message));
    });
}

function setupRegisterPage() {
    setupAuthForm('register-form', (email, password) => {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => window.location.href = '/setup.html')
            .catch(error => alert("Erro no registro: " + error.message));
    });
}

function setupForgotPasswordPage() {
    const form = document.getElementById('forgot-password-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            auth.sendPasswordResetEmail(form.email.value)
                .then(() => { alert('E-mail de redefinição enviado!'); window.location.href = '/login.html'; })
                .catch(error => alert("Erro: " + error.message));
        });
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
                window.location.href = '/dashboard.html';
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

// O restante do código (dashboard, operações, etc.) permanece inalterado e usará as globais `auth` e `db`

async function setupDashboardPage(user) { /* ... */ }
async function setupOperationsPage(user) { /* ... */ }
async function refreshDashboard(user) { /* ... */ }
async function fetchAndProcessData(uid) { /* ... */ }
function renderDashboard(diagnosis, userData) { /* ... */ }
function renderCharts(userData, diagnosis) { /* ... */ }
function setupQuickAddForm(user) { /* ... */ }
