
// --- DYNAMIC SETUP LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    const forms = {
        pessoa_fisica: document.getElementById('setup-form-pessoa_fisica'),
        autonomo: document.getElementById('setup-form-autonomo'),
        empresa: document.getElementById('setup-form-empresa')
    };

    let currentForm = null;
    let userId = null;

    // Main logic execution
    onAuthStateChange(user => {
        if (user) {
            userId = user.uid;
            initializeForm(user);
        } else {
            window.location.href = 'login.html';
        }
    });

    /**
     * Initializes and displays the correct form based on the URL parameter.
     */
    function initializeForm(user) {
        const urlParams = new URLSearchParams(window.location.search);
        const profileType = urlParams.get('type');

        if (profileType && forms[profileType]) {
            currentForm = forms[profileType];
            loader.style.display = 'none';
            currentForm.style.display = 'block';
            currentForm.addEventListener('submit', (e) => handleFormSubmit(e, profileType, user));
        } else {
            showError("Tipo de perfil inválido ou não especificado. Redirecionando...");
            setTimeout(() => window.location.href = 'type-selection.html', 3000);
        }
    }

    /**
     * Handles the form submission, collects data, and saves it to Firestore.
     */
    async function handleFormSubmit(event, profileType, user) {
        event.preventDefault();
        const submitButton = currentForm.querySelector('button[type="submit"]');
        setButtonLoading(submitButton, true, 'Salvando...');

        let profileData = {};

        // Collect data based on the active form
        try {
            if (profileType === 'pessoa_fisica') {
                profileData = {
                    fullName: document.getElementById('pf-fullName').value,
                    birthDate: document.getElementById('pf-birthDate').value,
                    liquid_assets: parseFloat(document.getElementById('pf-liquid_assets').value)
                };
            } else if (profileType === 'autonomo') {
                profileData = {
                    fullName: document.getElementById('autonomo-fullName').value,
                    field: document.getElementById('autonomo-field').value,
                    formalization: document.getElementById('autonomo-formalization').value,
                    liquid_assets: parseFloat(document.getElementById('autonomo-liquid_assets').value)
                };
            } else if (profileType === 'empresa') {
                profileData = {
                    companyName: document.getElementById('empresa-companyName').value,
                    cnpj: document.getElementById('empresa-cnpj').value,
                    market: document.getElementById('empresa-market').value,
                    liquid_assets: parseFloat(document.getElementById('empresa-liquid_assets').value)
                };
            }

            // Save the structured data
            await setDocument(`users/${user.uid}/structural_data`, 'user_profile', profileData);

            // Mark onboarding as complete
            await updateDocument('users', user.uid, { onboardingCompleted: true });

            // Redirect to the main dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error("Setup Error:", error);
            showError("Falha ao salvar os dados. Por favor, verifique os campos e tente novamente.");
            setButtonLoading(submitButton, false, 'Salvar e Ir para o Dashboard');
        }
    }

    // --- Helper Functions ---
    function setButtonLoading(button, isLoading, text) {
        button.disabled = isLoading;
        button.textContent = text;
    }

    function showError(message) {
        loader.style.display = 'none';
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
