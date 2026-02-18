
// --- TYPE SELECTION LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const selectionContainer = document.querySelector('.profile-selection-container');

    // Check authentication state immediately
    onAuthStateChange(async (user) => {
        if (!user) {
            // If no user is logged in, they shouldn't be here.
            window.location.href = 'login.html';
            return;
        }

        selectionContainer.addEventListener('click', async (e) => {
            const card = e.target.closest('.profile-card');
            if (!card) return;

            const profileType = card.dataset.type;
            if (!profileType) return;

            showLoading(true);

            try {
                // Save the chosen profile type to the user's document in Firestore
                await updateDocument('users', user.uid, { profileType: profileType });
                
                // Redirect to the setup page, passing the type as a URL parameter
                window.location.href = `setup.html?type=${profileType}`;

            } catch (error) {
                console.error("Error saving profile type:", error);
                showError("Não foi possível salvar sua escolha. Tente novamente.");
                showLoading(false);
            }
        });
    });

    function showLoading(isLoading) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
        selectionContainer.style.display = isLoading ? 'none' : 'flex';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
