/**
 * =====================================================================================
 *
 *       Filename:  main.js
 *
 *    Description:  Controla a interface, autenticação, fluxo de dados e renderização.
 *
 *      Version:   7.0.0 (Feature - Operations Page)
 *      Changes:   - Adicionada lógica completa para a página de operações (CRUD).
 *
 * =====================================================================================
 */

// --- Globals ---
let cashflowChartInstance = null;
let structuralHealthChartInstance = null;
let historyChartInstance = null;

// --- Inicialização e Roteamento ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined' || typeof auth === 'undefined' || typeof db === 'undefined') {
        console.error('Firebase não foi inicializado corretamente...');
        document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: sans-serif; color: red;"><h1>Erro Crítico de Configuração</h1><p>A conexão com os serviços falhou. Verifique as chaves no <code>public/js/firebase-config.js</code>.</p></div>';
        return;
    }

    const path = window.location.pathname.replace(/\/$/, "");
    auth.onAuthStateChanged(async (user) => {
        const mainContainer = document.getElementById('main-container');
        const authLoader = document.getElementById('auth-loader');
        if (authLoader) authLoader.style.display = 'none';

        const isAuthPage = path.includes('login.html') || path.includes('register.html');
        const isSetupPage = path.includes('setup.html');
        const isLandingPage = path === "" || path.includes('index.html');

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
            if (path.includes('dashboard.html')) setupDashboardPage(user);
            if (path.includes('profile.html')) setupProfilePage(user);
            if (path.includes('operacoes.html')) setupOperationsPage(user);
            if (isSetupPage) setupOnboardingPage(user);

            setupGlobalUserUI(user);
        } else {
            if (!isAuthPage && !isLandingPage) {
                window.location.href = '/login.html';
            }
            if (path.includes('login.html')) setupLoginPage();
            if (path.includes('register.html')) setupRegisterPage();
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
    if (!form) return;
    const errorElement = document.getElementById('login-error');
    const submitButton = form.querySelector('button[type="submit"]');
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

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = form.password.value;
        const confirm = form['password-confirm'].value;
        const errorElement = document.getElementById('register-error');

        if (password !== confirm) {
            errorElement.textContent = "As senhas não correspondem.";
            return;
        }

        auth.createUserWithEmailAndPassword(form.email.value, password)
            .then(userCredential => {
                const defaultGoals = { reserveGoal: 6, riskProfile: 'moderado' };
                return db.collection('users').doc(userCredential.user.uid).collection('structural_data').doc('user_goals').set(defaultGoals);
            })
            .catch(error => {
                 switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorElement.textContent = "Este e-mail já está em uso.";
                        break;
                    case 'auth/invalid-email':
                        errorElement.textContent = "O formato do e-mail é inválido.";
                        break;
                    case 'auth/weak-password':
                        errorElement.textContent = "A senha é muito fraca.";
                        break;
                    default:
                        errorElement.textContent = "Ocorreu um erro ao criar a conta.";
                        break;
                }
            });
    });
}

function setupOnboardingPage(user) {
    // Lógica da página de Onboarding/Setup
}

// --- PÁGINA DE OPERAÇÕES ---
async function setupOperationsPage(user) {
    let allTransactions = []; // Cache local das transações

    // Elementos do DOM
    const form = document.getElementById('transaction-form');
    const tableBody = document.getElementById('transactions-table-body');
    const formTitle = document.getElementById('form-title');
    const transactionIdInput = document.getElementById('transaction-id');
    const cancelBtn = document.getElementById('cancel-btn');
    const tipoSelect = document.getElementById('form-tipo');
    const tipoCustoSelect = document.getElementById('form-tipo-custo');

    const searchInput = document.getElementById('search-input');
    const filterTipoSelect = document.getElementById('filter-tipo');
    const applyFiltersBtn = document.getElementById('apply-filters');

    const transactionsRef = db.collection('users').doc(user.uid).collection('transactions');

    // Carregar e renderizar dados
    async function loadTransactions() {
        const snapshot = await transactionsRef.orderBy('createdAt', 'desc').get();
        allTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTransactions();
    }

    // Renderizar transações na tabela com base nos filtros
    function renderTransactions() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterType = filterTipoSelect.value;

        const filtered = allTransactions.filter(t => {
            const nameMatch = t.nome.toLowerCase().includes(searchTerm);
            const typeMatch = filterType === 'todos' || t.tipo === filterType;
            return nameMatch && typeMatch;
        });

        tableBody.innerHTML = ''; // Limpa a tabela
        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">Nenhuma transação encontrada.</td></tr>';
            return;
        }

        filtered.forEach(t => {
            const date = t.createdAt.toDate ? t.createdAt.toDate().toLocaleDateString('pt-BR') : new Date(t.createdAt).toLocaleDateString('pt-BR');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${t.nome}</td>
                <td class="${t.tipo === 'receita' ? 'text-success' : 'text-danger'}">R$ ${t.valor.toFixed(2)}</td>
                <td>${date}</td>
                <td>${t.tipo} ${t.tipoCusto ? `(${t.tipoCusto})` : ''}</td>
                <td>
                    <button class="btn-edit" data-id="${t.id}">Editar</button>
                    <button class="btn-delete" data-id="${t.id}">Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Lógica do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = transactionIdInput.value;
        const transactionData = {
            nome: form['form-nome'].value,
            valor: parseFloat(form['form-valor'].value),
            tipo: form['form-tipo'].value,
            tipoCusto: form['form-tipo-custo'].value,
            createdAt: firebase.firestore.Timestamp.fromDate(new Date(form['form-data'].value)),
        };

        if (transactionData.tipo !== 'despesa') {
            delete transactionData.tipoCusto;
        }

        if (id) { // Atualizar
            await transactionsRef.doc(id).update(transactionData);
        } else { // Criar
            await transactionsRef.add(transactionData);
        }
        resetForm();
        await loadTransactions();
    });

    // Lógica dos botões de ação na tabela
    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (!id) return;

        if (target.classList.contains('btn-edit')) {
            const transaction = allTransactions.find(t => t.id === id);
            if (transaction) {
                formTitle.textContent = 'Editar Transação';
                transactionIdInput.value = id;
                form['form-nome'].value = transaction.nome;
                form['form-valor'].value = transaction.valor;
                form['form-data'].valueAsDate = transaction.createdAt.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);
                form['form-tipo'].value = transaction.tipo;
                form['form-tipo-custo'].value = transaction.tipoCusto || 'fixo';
                tipoCustoSelect.classList.toggle('hidden', transaction.tipo !== 'despesa');
                cancelBtn.classList.remove('hidden');
                window.scrollTo(0, 0); // Rola para o topo para ver o formulário
            }
        } else if (target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir esta transação?')) {
                transactionsRef.doc(id).delete().then(loadTransactions);
            }
        }
    });

    // Reseta o formulário
    function resetForm() {
        form.reset();
        transactionIdInput.value = '';
        formTitle.textContent = 'Adicionar Nova Transação';
        cancelBtn.classList.add('hidden');
        tipoCustoSelect.classList.add('hidden');
    }

    // Event listeners
    cancelBtn.addEventListener('click', resetForm);
    tipoSelect.addEventListener('change', () => {
        tipoCustoSelect.classList.toggle('hidden', tipoSelect.value !== 'despesa');
    });
    applyFiltersBtn.addEventListener('click', renderTransactions); // Aplica filtros ao clicar
    searchInput.addEventListener('keyup', (e) => { // Filtra enquanto digita
        if(e.key === 'Enter') renderTransactions();
    });

    // Carga inicial
    await loadTransactions();
}

// --- LÓGICA DO PAINEL DE CONTROLE ---
async function setupDashboardPage(user) {
    const userData = await fetchAndProcessData(user.uid);
    const engine = new EngineCore(); // Assegura que simulation.js está carregado
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

    const userProfile = profileSnap.exists ? profileSnap.data() : { profile: 'pessoa_fisica' };
    const userGoals = goalsSnap.exists ? goalsSnap.data() : { reserveGoal: 6, riskProfile: 'moderado' };
    
    const transactions = transSnap.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data, createdAt: data.createdAt?.toDate() || new Date() };
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
    return Math.sqrt(numbers.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
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
        cashflowChartInstance = new Chart(cashflowCtx, { type: 'doughnut', data: { labels: ['Receita Total', 'Despesa Total'], datasets: [{ data: [totalReceitas, totalDespesas], backgroundColor: ['#4CAF50', '#F44336'] }] } });
    }

    const healthCtx = document.getElementById('structural-health-chart')?.getContext('2d');
    if (healthCtx) {
        const msd = parseFloat(diagnosis.msd) || 0;
        const goal = userData.userGoals.reserveGoal || 6;
        structuralHealthChartInstance = new Chart(healthCtx, { type: 'doughnut', data: { labels: ['Reserva Atingida (MSD)', 'Meta Restante'], datasets: [{ data: [msd, Math.max(0, goal - msd)], backgroundColor: ['#03A9F4', '#E0E0E0'] }] } });
    }

    const historyCtx = document.getElementById('history-chart')?.getContext('2d');
    if (historyCtx) {
        let balance = 0;
        const balanceHistory = userData.transactions.map(t => {
            balance += t.tipo === 'receita' ? t.valor : -t.valor;
            return { x: t.createdAt, y: balance };
        });
        historyChartInstance = new Chart(historyCtx, { type: 'line', data: { datasets: [{ label: 'Evolução do Patrimônio', data: balanceHistory, borderColor: '#FF9800', tension: 0.1 }] }, options: { scales: { x: { type: 'time', time: { unit: 'day' } } } } });
    }
}

// --- INTERATIVIDADE DOS FORMULÁRIOS ---
function setupQuickAddForm(user) {
    const form = document.getElementById('quick-add-form');
    if (!form) return;
    const tipoSelect = document.getElementById('qa-tipo');
    const tipoCustoSelect = document.getElementById('qa-tipo-custo');

    tipoSelect.addEventListener('change', () => tipoCustoSelect.classList.toggle('hidden', tipoSelect.value !== 'despesa'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const transaction = {
            nome: form['qa-nome'].value,
            valor: parseFloat(form['qa-valor'].value),
            tipo: form['qa-tipo'].value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (transaction.tipo === 'despesa') {
            transaction.tipoCusto = form['qa-tipo-custo'].value;
        }
        await db.collection('users').doc(user.uid).collection('transactions').add(transaction);
        form.reset();
        tipoCustoSelect.classList.add('hidden');
        await setupDashboardPage(user);
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
        const newGoals = {
            reserveGoal: parseInt(form['reserve-goal'].value, 10),
            riskProfile: form['risk-profile'].value
        };
        await goalsRef.set(newGoals, { merge: true });
        alert("Perfil atualizado! Redirecionando para o painel.");
        window.location.href = '/dashboard.html';
    });
}