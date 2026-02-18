
// --- CORE APPLICATION LOGIC (V3 - DECOUPLED) ---

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    showLoader(true);

    let userId = null;
    let unsubscribeTransactions = null;
    let recommendations = null; // Cache for recommendations

    // Fetch recommendations once on load
    fetch('js/recommendations.json')
        .then(response => response.json())
        .then(data => {
            recommendations = data;
        })
        .catch(error => console.error("Failed to load recommendations:", error));

    // Main authentication and data loading sequence
    onAuthStateChange(async (user) => {
        if (user) {
            userId = user.uid;
            try {
                // Check for user profile and onboarding completion
                const userDoc = await getDocument('users', userId);
                if (!userDoc.exists || !userDoc.data().onboardingCompleted) {
                    window.location.href = 'setup.html';
                    return;
                }

                const profileDoc = await getDocument(`users/${userId}/structural_data`, 'user_profile');
                showDashboard(profileDoc.data()); // Display user profile info

                // Listen for real-time updates on transactions
                const transactionsPath = `users/${userId}/transactions`;
                unsubscribeTransactions = onSnapshot(transactionsPath, (transactions) => {
                    renderTransactions(transactions);
                    // Whenever transactions change, trigger a new diagnosis from the backend
                    runBackendDiagnosis(transactions, profileDoc.data());
                });

            } catch (error) {
                console.error("Dashboard Loading Error:", error);
                alert("Could not load dashboard data. Please reload.");
                showLoader(false);
            }
        } else {
            // User is signed out
            userId = null;
            if (unsubscribeTransactions) unsubscribeTransactions();
            window.location.href = 'login.html';
        }
    });

    /**
     * Triggers the backend diagnosis engine and renders the results.
     * @param {Array<object>} transactions - The user's transactions.
     * @param {object} profile - The user's profile data.
     */
    async function runBackendDiagnosis(transactions, profile) {
        // Prepare the data payload for the API
        const financialData = {
            incomes: transactions.filter(t => t.type === 'revenue').map(t => ({ amount: t.amount })),
            expenses: transactions.filter(t => t.type === 'expense').map(t => ({ amount: t.amount, priority: t.category === 'essential' ? 'essential' : 'non_essential' })),
            liquid_assets: profile.liquid_assets || 0
        };

        try {
            const response = await fetch('/api/engine/diagnose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(financialData)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const diagnosis = await response.json();
            renderDiagnosisResults(diagnosis, recommendations);

        } catch (error) {
            console.error("Error running backend diagnosis:", error);
            // Optionally, render an error state in the diagnosis panel
        }
    }

    // --- UI EVENT LISTENERS ---
    
    // Transaction form submission
    if (window.transactionForm) {
        window.transactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!userId) return;
            // Logic to add document remains the same...
            const description = document.getElementById('description').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const type = document.getElementById('type').value;
            const date = document.getElementById('date').value;
            const category = document.getElementById('category').value;
            
            if (description && !isNaN(amount) && type && date && category) {
                await addDocument(`users/${userId}/transactions`, { description, amount, type, date, category });
                clearTransactionForm();
            }
        });
    }

    // Transaction deletion
    if (window.transactionList) {
        window.transactionList.addEventListener('click', async (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton && userId && confirm('Are you sure?')) {
                const transactionId = deleteButton.closest('tr').dataset.id;
                await deleteDocument(`users/${userId}/transactions/${transactionId}`);
            }
        });
    }

    // Logout
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => logOut());
    }
});
