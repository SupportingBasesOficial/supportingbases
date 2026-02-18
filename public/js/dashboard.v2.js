
// --- CORE APPLICATION LOGIC (V3 - CLIENT-SIDE) ---

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    initializeUI(); 
    showLoader(true);

    let userId = null;
    let unsubscribeTransactions = null;
    let recommendations = null; // Cache for recommendations JSON

    // Fetch static recommendations on initial load
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
                // 1. Check if user has completed the onboarding process
                const userDoc = await getDocument('users', userId);
                if (!userDoc.exists || !userDoc.data().onboardingCompleted) {
                    window.location.href = 'setup.html';
                    return;
                }

                // 2. Load the user's structural profile data
                const profileDoc = await getDocument(`users/${userId}/structural_data`, 'user_profile');
                showDashboard(profileDoc.data()); // Update UI with user name, etc.

                // 3. Listen for real-time updates on transactions
                const transactionsPath = `users/${userId}/transactions`;
                unsubscribeTransactions = onSnapshot(transactionsPath, (transactions) => {
                    renderTransactions(transactions); // Update the transactions table
                    
                    // 4. Whenever transactions change, trigger a new CLIENT-SIDE diagnosis
                    // This replaces the old backend call.
                    if (recommendations) { // Only run if recommendations are loaded
                        runClientSideDiagnosis(transactions, profileDoc.data(), recommendations);
                    }
                });

            } catch (error) {
                console.error("Dashboard Loading Error:", error);
                alert("Could not load dashboard data. Please reload.");
                showLoader(false);
            }
        } else {
            // User is signed out, clean up and redirect to login
            userId = null;
            if (unsubscribeTransactions) unsubscribeTransactions();
            window.location.href = 'login.html';
        }
    });

    // --- UI EVENT LISTENERS ---
    
    // Listener for the new transaction form
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
                await addDocument(`users/${userId}/transactions`, { description, amount, type, date, category, createdAt: new Date() });
                clearTransactionForm(); // Assumes this function exists in ui.js
            }
        });
    }

    // Listener for deleting transactions from the list
    if (window.transactionList) {
        window.transactionList.addEventListener('click', async (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton && userId && confirm('Tem certeza que deseja apagar este lançamento?')) {
                const transactionId = deleteButton.closest('tr').dataset.id;
                await deleteDocument(`users/${userId}/transactions/${transactionId}`);
            }
        });
    }

    // Listener for the logout button
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => logOut());
    }
});
