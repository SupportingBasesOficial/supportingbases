// Versão Clássica (sem módulos) do dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    showLoader(true);

    let userId = null;
    let unsubscribeTransactions = null;

    onAuthStateChange(async (user) => {
        if (user) {
            userId = user.uid;
            try {
                // --- CORREÇÃO CRÍTICA: Trocando a FUNÇÃO .exists() pela PROPRIEDADE .exists ---
                const userDoc = await getDocument('users', userId);
                if (!userDoc.exists || !userDoc.data().onboardingCompleted) {
                    window.location.href = 'setup.html';
                    return;
                }

                const profileDoc = await getDocument(`users/${userId}/structural_data`, 'user_profile');
                
                // --- MELHORIA: Se o perfil não existe, cria um e recarrega a página ---
                if (!profileDoc.exists) {
                    // Isso pode acontecer se o processo de setup for interrompido.
                    // Criamos um perfil básico para evitar que a aplicação quebre.
                    const basicProfile = {
                        fullName: user.email, // Usa o email como fallback
                        birthDate: 'Não informado',
                        monthlyIncome: 0
                    };
                    await setDocument(`users/${userId}/structural_data`, 'user_profile', basicProfile);
                    window.location.reload(); // Recarrega a página para carregar o novo perfil.
                    return;
                }

                showDashboard(profileDoc.data());
                clearTransactionForm();

                const transactionsPath = `users/${userId}/transactions`;
                unsubscribeTransactions = onSnapshot(transactionsPath, (transactions) => {
                    renderTransactions(transactions);
                    const metrics = calculateStructuralMetrics(transactions);
                    renderDiagnosisResults(metrics);
                });

            } catch (error) {
                console.error("Erro ao carregar o dashboard:", error);
                alert("Não foi possível carregar seus dados. Por favor, tente recarregar a página.");
                showLoader(false);
            }
        } else {
            userId = null;
            if (unsubscribeTransactions) {
                unsubscribeTransactions();
            }
            window.location.href = 'login.html';
        }
    });

    // O resto do arquivo permanece o mesmo...
    // (listeners de formulário, delete, e logout)

    if (window.transactionForm) {
        window.transactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!userId) return;
            const description = document.getElementById('description').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const type = document.getElementById('type').value;
            const date = document.getElementById('date').value;
            const category = document.getElementById('category').value;

            if (description && !isNaN(amount) && type && date && category) {
                try {
                    await addDocument(`users/${userId}/transactions`, { description, amount, type, date, category });
                    clearTransactionForm();
                } catch (error) {
                    console.error("Erro ao adicionar lançamento:", error);
                }
            }
        });
    }

    if (window.transactionList) {
        window.transactionList.addEventListener('click', async (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton && userId) {
                const transactionId = deleteButton.closest('tr').dataset.id;
                if (confirm('Tem certeza?')) {
                    try {
                        await deleteDocument(`users/${userId}/transactions/${transactionId}`);
                    } catch (error) {
                        console.error("Erro ao excluir:", error);
                    }
                }
            }
        });
    }

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await logOut();
            } catch (error) {
                console.error("Erro ao fazer logout:", error);
            }
        });
    }
});
