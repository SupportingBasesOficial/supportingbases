/**
 * =====================================================================================
 *
 *       Filename:  main.js
 *
 *    Description:  Controla a interface, autenticação, fluxo de dados e renderização.
 *
 *      Version:   6.0.2 (Refactor - Global Firebase Instances)
 *      Changes:   - As instâncias `auth` e `db` agora são globais, definidas em `firebase-config.js`.
 *                 - Removida a verificação de inicialização local.
 *
 * =====================================================================================
 */

// --- Globals ---
let cashflowChartInstance = null;
let structuralHealthChartInstance = null;
let historyChartInstance = null;

// --- Inicialização e Roteamento ---
document.addEventListener('DOMContentLoaded', () => {
    // As instâncias `auth` e `db` são globais e vêm de `firebase-config.js`
    if (typeof firebase === 'undefined' || typeof auth === 'undefined' || typeof db === 'undefined') {
        console.error('Firebase não foi inicializado corretamente. Certifique-se de que firebase-config.js está correto e foi carregado ANTES de main.js.');
        document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: sans-serif; color: red;"><h1>Erro Crítico de Configuração</h1><p>A conexão com os serviços de autenticação e banco de dados falhou. Verifique a ordem dos scripts no HTML e as chaves no <code>public/js/firebase-config.js</code>.</p></div>';
        return;
    }

    const path = window.location.pathname.replace(/\/$/, "");
    const isAuthPage = path.includes('login.html') || path.includes('register.html');
    const isSetupPage = path.includes('setup.html');
    const isLandingPage = path === "" || path === "/index.html";

    auth.onAuthStateChanged(async (user) => {
        const mainContainer = document.getElementById('main-container');
        const authLoader = document.getElementById('auth-loader');

        if (authLoader) authLoader.style.display = 'none';

        if (user) {
            const profileDoc = await db.collection('users').doc(user.uid).collection('structural_data').doc('user_profile').get();
            const hasCompletedSetup = profileDoc.exists;

            if (!hasCompletedSetup && !isSetupPage) {
                window.location.href = '/setup.html';
                return;
            }

            if (hasCompletedSetup && (isAuthPage || isLandingPage || isSetupPage)) {
                window.location.href = '/dashboard.html';
                return;
            }

            if (mainContainer) mainContainer.style.display = 'block';

            // Roteamento de página logada
            if (path.includes('/dashboard.html')) setupDashboardPage(user);
            if (path.includes('/profile.html')) setupProfilePage(user);
            if (isSetupPage) setupOnboardingPage(user);

            setupGlobalUserUI(user);

        } else {
            // Roteamento de página deslogada
            if (!isAuthPage && !isLandingPage && !isSetupPage) {
                window.location.href = '/login.html';
            } else {
                if (path.includes('login.html')) setupLoginPage();
                if (path.includes('register.html')) setupRegisterPage();
                 if (isSetupPage) {
                    // Se o usuário chegar na página de setup sem estar logado, redireciona para o login
                    window.location.href = '/login.html';
                }
            }
        }
    });
});

function setupGlobalUserUI(user) {
    const userEmailSpan = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    if (userEmailSpan) userEmailSpan.textContent = user.email;
    if (logoutBtn) {
        logoutBtn.classList.remove('hidden');
        logoutBtn.addEventListener('click', () => auth.signOut());
    }
}

// --- PÁGINAS DE AUTENTICAÇÃO E ONBOARDING ---
function setupLoginPage() {
    const form = document.getElementById('login-form');
    const errorElement = document.getElementById('login-error');
    const submitButton = form.querySelector('button[type="submit"]');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorElement.textContent = '';
        submitButton.disabled = true;
        submitButton.textContent = 'Verificando...';

        auth.signInWithEmailAndPassword(form.email.value, form.password.value)
            .catch(error => {
                errorElement.textContent = "Email ou senha inválidos.";
                submitButton.disabled = false;
                submitButton.textContent = 'Entrar';
            });
    });
}

function setupRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;

    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('password-confirm');
    const strengthIndicator = document.getElementById('password-strength');
    const matchIndicator = document.getElementById('password-match');
    const errorElement = document.getElementById('register-error');
    const submitButton = form.querySelector('button[type="submit"]');

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = checkPasswordStrength(password);
        strengthIndicator.textContent = strength.message;
        strengthIndicator.style.color = strength.color;
        checkPasswordMatch();
    });

    confirmInput.addEventListener('input', checkPasswordMatch);

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        if (confirm === "") {
            matchIndicator.textContent = "";
            return;
        }
        if (password === confirm) {
            matchIndicator.textContent = "As senhas correspondem!";
            matchIndicator.style.color = '#4CAF50';
        } else {
            matchIndicator.textContent = "As senhas não correspondem.";
            matchIndicator.style.color = '#F44336';
        }
    }

    function checkPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (password.length === 0) return { message: '', color: '' };
        if (score < 3) return { message: 'Senha Fraca', color: '#F44336' };
        if (score < 5) return { message: 'Senha Média', color: '#FF9800' };
        return { message: 'Senha Forte', color: '#4CAF50' };
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorElement.textContent = '';

        if (passwordInput.value !== confirmInput.value) {
            errorElement.textContent = "As senhas não correspondem. Verifique antes de continuar.";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Criando conta...';

        auth.createUserWithEmailAndPassword(form.email.value, form.password.value)
            .then(userCredential => {
                const defaultGoals = { reserveGoal: 6, riskProfile: 'moderado' };
                return db.collection('users').doc(userCredential.user.uid).collection('structural_data').doc('user_goals').set(defaultGoals);
            })
            .catch(error => {
                console.error("Firebase Registration Error:", error);
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorElement.textContent = "Este endereço de e-mail já está em uso.";
                        break;
                    case 'auth/invalid-email':
                        errorElement.textContent = "O formato do e-mail é inválido.";
                        break;
                    case 'auth/weak-password':
                        errorElement.textContent = "A senha é muito fraca. Por favor, escolha uma senha mais forte.";
                        break;
                    default:
                        errorElement.textContent = "Ocorreu um erro inesperado ao criar a conta.";
                        break;
                }
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Registrar';
            });
    });
}

function setupOnboardingPage(user) {
    const selectionStep = document.getElementById('profile-selection-step');
    const dataEntryStep = document.getElementById('data-entry-step');
    const profileCards = document.querySelectorAll('.profile-card');

    const forms = {
        pessoa_fisica: `
            <h2>Pessoa Física (CLT)</h2>
            <p>Informe seus dados mensais. Isso criará a primeira "fotografia" da sua saúde financeira.</p>
            <form id="onboarding-form">
                <input type="number" name="receita" placeholder="Salário Mensal Bruto" required>
                <input type="number" name="despesa" placeholder="Custo de Vida Mensal" required>
                <button type="submit">Concluir e Analisar</button>
            </form>
        `,
        autonomo: `
            <h2>Autônomo / Profissional Liberal</h2>
            <p>Informe uma média dos seus últimos meses.</p>
            <form id="onboarding-form">
                <input type="number" name="receita" placeholder="Receita Média Mensal" required>
                <input type="number" name="despesa" placeholder="Custo Operacional e Pessoal Médio" required>
                <button type="submit">Concluir e Analisar</button>
            </form>
        `,
        empresa: `
            <h2>Pequena Empresa</h2>
            <p>Informe os dados médios mensais do seu negócio.</p>
            <form id="onboarding-form">
                <input type="number" name="receita" placeholder="Faturamento Médio Mensal" required>
                <input type="number" name="despesa_fixa" placeholder="Custos Fixos Médios" required>
                <input type="number" name="despesa_variavel" placeholder="Custos Variáveis Médios (CMV/CSP)" required>
                <button type="submit">Concluir e Analisar</button>
            </form>
        `
    };

    profileCards.forEach(card => {
        card.addEventListener('click', () => {
            const profile = card.dataset.profile;
            selectionStep.classList.add('hidden');
            dataEntryStep.innerHTML = forms[profile];
            dataEntryStep.classList.remove('hidden');
            handleFormSubmission(profile, user);
        });
    });
}

async function handleFormSubmission(profile, user) {
    const form = document.getElementById('onboarding-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button');
        submitButton.disabled = true;
        submitButton.textContent = 'Processando...';

        const now = firebase.firestore.FieldValue.serverTimestamp();
        const batch = db.batch();

        const profileRef = db.collection('users').doc(user.uid).collection('structural_data').doc('user_profile');
        batch.set(profileRef, { profile: profile, completedAt: now });

        const transactionsRef = db.collection('users').doc(user.uid).collection('transactions');
        const receita = parseFloat(form.receita.value);
        const newReceitaRef = transactionsRef.doc();
        batch.set(newReceitaRef, { nome: 'Receita Inicial', valor: receita, tipo: 'receita', createdAt: now });

        if (profile === 'empresa') {
            const despesaFixa = parseFloat(form.despesa_fixa.value);
            const despesaVariavel = parseFloat(form.despesa_variavel.value);
            const newDespesaFixaRef = transactionsRef.doc();
            batch.set(newDespesaFixaRef, { nome: 'Custo Fixo Inicial', valor: despesaFixa, tipo: 'despesa', tipoCusto: 'fixo', createdAt: now });
            const newDespesaVariavelRef = transactionsRef.doc();
            batch.set(newDespesaVariavelRef, { nome: 'Custo Variável Inicial', valor: despesaVariavel, tipo: 'despesa', tipoCusto: 'variavel', createdAt: now });
        } else {
            const despesa = parseFloat(form.despesa.value);
            const newDespesaRef = transactionsRef.doc();
            batch.set(newDespesaRef, { nome: 'Despesa Inicial', valor: despesa, tipo: 'despesa', tipoCusto: (profile === 'pessoa_fisica' ? 'fixo' : 'variavel'), createdAt: now });
        }

        try {
            await batch.commit();
            window.location.href = '/dashboard.html';
        } catch (error) {
            console.error("Erro ao salvar dados de onboarding: ", error);
            alert("Ocorreu um erro ao salvar seus dados. Tente novamente.");
            submitButton.disabled = false;
            submitButton.textContent = 'Concluir e Analisar';
        }
    });
}

// --- LÓGICA DO PAINEL DE CONTROLE ---
async function setupDashboardPage(user) {
    const userData = await fetchAndProcessData(user.uid);
    // A classe EngineCore provavelmente está em simulation.js, certifique-se que ele está carregado
    const engine = new EngineCore();
    const diagnosis = engine.runStructuralDiagnosis(userData);
    renderDashboard(diagnosis, userData);
    setupQuickAddForm(user);
}

async function fetchAndProcessData(uid) {
    const baseRef = db.collection('users').doc(uid);
    const [profileSnap, goalsSnap, transSnap] = await Promise.all([
        baseRef.collection('structural_data').doc('user_profile').get(),
        baseRef.collection('structural_data').doc('user_goals').get(),
        baseRef.collection('transactions').orderBy('createdAt', 'asc').get()
    ]);

    const userProfile = profileSnap.exists ? profileSnap.data() : { profile: 'pessoa_fisica' }; // Default
    const userGoals = goalsSnap.exists ? goalsSnap.data() : { reserveGoal: 6, riskProfile: 'moderado' };
    
    const transactions = transSnap.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
        };
    });

    const receitas = transactions.filter(t => t.tipo === 'receita');
    const despesas = transactions.filter(t => t.tipo === 'despesa');
    
    const receitaValues = receitas.map(r => r.valor);
    const receitaDesvioPadrao = calculateStandardDeviation(receitaValues);

    const totalReceitas = receitas.reduce((acc, r) => acc + r.valor, 0);
    const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
    const reservas = totalReceitas - totalDespesas;

    return { transactions, userProfile, receitas, despesas, userGoals, reservas, receitaDesvioPadrao };
}

function calculateStandardDeviation(numbers) {
    if (numbers.length < 2) return 0;
    const n = numbers.length;
    const mean = numbers.reduce((a, b) => a + b) / n;
    const variance = numbers.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
    return Math.sqrt(variance);
}

function renderDashboard(diagnosis, userData) {
    const { structuralPhase, icf, iia, msd, recommendation } = diagnosis;

    const simulationOutput = document.getElementById('simulation-output');
    if (simulationOutput) {
        simulationOutput.innerHTML = `
            <div class="kpi-card"><h3>Fase Estrutural</h3><p>${structuralPhase}</p></div>
            <div class="kpi-card"><h3>Compressão (ICF)</h3><p>${icf}</p></div>
            <div class="kpi-card"><h3>Sobrevivência (MSD)</h3><p>${msd} meses</p></div>
            <div class="kpi-card"><h3>Instabilidade (IIA)</h3><p>${iia}</p></div>
        `;
    }

    const recommendationSection = document.getElementById('strategic-recommendation');
    if (recommendationSection) {
        recommendationSection.innerHTML = recommendation;
    }

    renderCharts(userData, diagnosis);
}

// --- RENDERIZAÇÃO DE GRÁFICOS ---
function renderCharts(userData, diagnosis) {
    if(cashflowChartInstance) cashflowChartInstance.destroy();
    if(structuralHealthChartInstance) structuralHealthChartInstance.destroy();
    if(historyChartInstance) historyChartInstance.destroy();

    const cashflowCtx = document.getElementById('cashflow-chart')?.getContext('2d');
    if (cashflowCtx) {
        const totalReceitas = userData.receitas.reduce((acc, r) => acc + r.valor, 0);
        const totalDespesas = userData.despesas.reduce((acc, d) => acc + d.valor, 0);
        cashflowChartInstance = new Chart(cashflowCtx, {
            type: 'doughnut',
            data: {
                labels: ['Receita Total', 'Despesa Total'],
                datasets: [{ data: [totalReceitas, totalDespesas], backgroundColor: ['#4CAF50', '#F44336'] }]
            }
        });
    }

    const healthCtx = document.getElementById('structural-health-chart')?.getContext('2d');
    if (healthCtx) {
        const msd = parseFloat(diagnosis.msd) || 0;
        const goal = userData.userGoals.reserveGoal || 6;
        const remaining = Math.max(0, goal - msd);
        structuralHealthChartInstance = new Chart(healthCtx, {
            type: 'doughnut',
            data: {
                labels: ['Reserva Atingida (MSD)', 'Meta Restante'],
                datasets: [{ data: [msd, remaining], backgroundColor: ['#03A9F4', '#E0E0E0'] }]
            }
        });
    }

    const historyCtx = document.getElementById('history-chart')?.getContext('2d');
    if (historyCtx) {
        let balance = 0;
        const balanceHistory = userData.transactions.map(t => {
            balance += t.tipo === 'receita' ? t.valor : -t.valor;
            return { x: t.createdAt, y: balance };
        });
        historyChartInstance = new Chart(historyCtx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Evolução do Patrimônio',
                    data: balanceHistory,
                    borderColor: '#FF9800',
                    tension: 0.1
                }]
            },
            options: { scales: { x: { type: 'time', time: { unit: 'day' } } } }
        });
    }
}

// --- INTERATIVIDADE DOS FORMULÁRIOS ---
function setupQuickAddForm(user) {
    const form = document.getElementById('quick-add-form');
    const tipoSelect = document.getElementById('qa-tipo');
    const tipoCustoSelect = document.getElementById('qa-tipo-custo');
    if (!form) return;

    tipoSelect.addEventListener('change', () => {
        tipoCustoSelect.classList.toggle('hidden', tipoSelect.value !== 'despesa');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';

        const transaction = {
            nome: form['qa-nome'].value,
            valor: parseFloat(form['qa-valor'].value),
            tipo: form['qa-tipo'].value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (transaction.tipo === 'despesa') {
            transaction.tipoCusto = form['qa-tipo-custo'].value;
        }

        try {
            await db.collection('users').doc(user.uid).collection('transactions').add(transaction);
            form.reset();
            tipoCustoSelect.classList.add('hidden');
            await setupDashboardPage(user); 
        } catch (error) {
            console.error("Erro ao adicionar transação: ", error);
            alert("Não foi possível salvar a transação.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Adicionar e Reanalisar';
        }
    });
}

async function setupProfilePage(user) {
    const form = document.getElementById('profile-form');
    if (!form) return;
    const goalsRef = db.collection('users').doc(user.uid).collection('structural_data').doc('user_goals');

    const doc = await goalsRef.get();
    if (doc.exists) {
        const data = doc.data();
        form['reserve-goal'].value = data.reserveGoal;
        form['risk-profile'].value = data.riskProfile;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button');
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';

        const newGoals = {
            reserveGoal: parseInt(form['reserve-goal'].value, 10),
            riskProfile: form['risk-profile'].value
        };

        try {
            await goalsRef.set(newGoals, { merge: true });
            alert("Perfil atualizado! O painel será recarregado para refletir as mudanças.");
            window.location.href = '/dashboard.html';
        } catch (error) {
            console.error("Erro ao atualizar perfil: ", error);
            alert("Não foi possível salvar as alterações.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Salvar Alterações';
        }
    });
}