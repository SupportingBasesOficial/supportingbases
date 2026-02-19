// Versão Clássica (sem módulos) do ui.js
// As funções e variáveis agora são globais.

// --- Seletores do DOM ---
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('auth-loader');
    const mainContainer = document.getElementById('main-container');
    const userNameElement = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-btn');
    const contentTitle = document.getElementById('content-title');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const contentSections = document.querySelectorAll('.content-body');
    const transactionList = document.getElementById('transaction-list');
    const transactionForm = document.getElementById('transaction-form');
    const diagnosisCard = document.getElementById('diagnosis-card');

    /**
     * Alterna a visibilidade das seções de conteúdo.
     */
    window.showSection = (targetId) => {
        contentSections.forEach(section => {
            section.style.display = section.id === targetId ? 'block' : 'none';
        });
    };

    /**
     * Adiciona listeners de evento aos elementos da UI.
     */
    window.initializeUI = () => {
        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                try {
                    await logOut(); // logOut é global de firebaseService.js
                } catch (error) {
                    console.error("Erro ao fazer logout:", error);
                    alert("Não foi possível sair. Tente novamente.");
                }
            });
        }

        if (sidebarNav) {
            sidebarNav.addEventListener('click', (e) => {
                e.preventDefault();
                const link = e.target.closest('a');
                if (!link) return;

                sidebarNav.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                link.parentElement.classList.add('active');

                const targetId = link.dataset.target;
                if (targetId) {
                    window.showSection(targetId);
                    contentTitle.textContent = link.textContent;
                }
            });
        }
    };

    /**
     * Controla a visibilidade do loader principal.
     */
    window.showLoader = (visible) => {
        if (loader) loader.style.display = visible ? 'flex' : 'none';
    };

    /**
     * Exibe o conteúdo principal do dashboard.
     */
    window.showDashboard = (userProfile) => {
        window.showLoader(false);
        if (mainContainer) mainContainer.style.display = 'flex';
        if (userNameElement && userProfile.fullName) {
            const firstName = userProfile.fullName.split(' ')[0];
            userNameElement.textContent = firstName;
        }
        window.showSection('dashboard-section');
        contentTitle.textContent = 'Dashboard';
        const firstNavItem = sidebarNav.querySelector('li');
        if (firstNavItem) firstNavItem.classList.add('active');
    };

    /**
     * Renderiza os resultados do diagnóstico.
     */
    window.renderDiagnosisResults = (metrics) => {
        if (!diagnosisCard) return;

        const { icf } = metrics;
        let statusClass, statusText, adviceText;

        if (icf < 1) {
            statusClass = 'status-danger';
            statusText = 'Estrutura em Crise';
            adviceText = 'Suas despesas essenciais são maiores que sua receita. É crucial agir agora para evitar o colapso.';
        } else if (icf === 1) {
            statusClass = 'status-warning';
            statusText = 'Estrutura sob Tensão';
            adviceText = 'Sua receita está apenas cobrindo suas despesas essenciais. Não há margem para imprevistos.';
        } else {
            statusClass = 'status-ok';
            statusText = 'Estrutura Estável';
            adviceText = 'Sua receita é maior que suas despesas essenciais. Você está no caminho certo para construir uma base sólida.';
        }

        diagnosisCard.innerHTML = `
            <h2>Diagnóstico Financeiro (Mês Corrente)</h2>
            <div class="icf-display ${statusClass}">
                <span class="icf-value">${icf.toFixed(2)}</span>
                <span class="icf-label">ICF</span>
            </div>
            <div class="diagnosis-summary">
                <p class="status-text ${statusClass}">${statusText}</p>
                <p class="advice-text">${adviceText}</p>
            </div>
        `;
    };

    /**
     * Renderiza a lista de transações.
     */
    window.renderTransactions = (transactions) => {
        if (!transactionList) return;
        transactionList.innerHTML = ''; 

        if (transactions.length === 0) {
            transactionList.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum lançamento encontrado.</td></tr>';
            return;
        }

        transactions.forEach(tx => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', tx.id);
            const amountClass = tx.type === 'revenue' ? 'text-revenue' : 'text-expense';
            const amountSignal = tx.type === 'revenue' ? '+' : '-';
            row.innerHTML = `
                <td>${tx.description}</td>
                <td class="${amountClass}">${amountSignal} R$ ${tx.amount.toFixed(2)}</td>
                <td>${tx.type === 'revenue' ? 'Receita' : 'Despesa'}</td>
                <td>${new Date(tx.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td class="table-actions">
                    <a href="#" class="delete-btn"><i class="fas fa-trash-alt"></i></a>
                </td>
            `;
            transactionList.appendChild(row);
        });
    };

    /**
     * Limpa o formulário de transação.
     */
    window.clearTransactionForm = () => {
        if (transactionForm) {
            transactionForm.reset();
            document.getElementById('date').valueAsDate = new Date();
        }
    };

    // Expondo variáveis do DOM para o escopo global para que dashboard.js possa usá-las
    window.transactionForm = transactionForm;
    window.transactionList = transactionList;
});
