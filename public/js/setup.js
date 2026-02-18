
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('auth-loader');
    const errorMessageContainer = document.getElementById('error-message');

    const forms = {
        pessoa_fisica: document.getElementById('setup-form-pessoa_fisica'),
        autonomo: document.getElementById('setup-form-autonomo'),
        empresa: document.getElementById('setup-form-empresa')
    };

    let currentForm = null;

    // --- Main Auth Check ---
    onAuthStateChange(user => {
        if (user) {
            initializeForm(user);
        } else {
            // If no user is logged in, they can't be on this page.
            window.location.href = 'login.html';
        }
    });

    // --- UI HELPER FUNCTIONS (Standardized) ---
    const displayMessage = (message, type = 'error') => {
        errorMessageContainer.textContent = message;
        errorMessageContainer.className = `form-message ${type}`;
        errorMessageContainer.style.display = message ? 'block' : 'none';
    };

    const setButtonLoading = (button, isLoading, originalText) => {
        if (!button) return;
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="loader-sm"></span> Salvando...';
        } else {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    };

    const showLoader = (isLoading) => {
        if (loader) loader.style.display = isLoading ? 'block' : 'none';
    };

    // --- FORM INITIALIZATION ---
    function initializeForm(user) {
        const urlParams = new URLSearchParams(window.location.search);
        const profileType = urlParams.get('type');

        if (profileType && forms[profileType]) {
            showLoader(false);
            currentForm = forms[profileType];
            currentForm.style.display = 'block';
            currentForm.addEventListener('submit', (e) => handleFormSubmit(e, profileType, user));
        } else {
            showLoader(false);
            displayMessage("Tipo de perfil inválido. Você será redirecionado em breve.", "error");
            setTimeout(() => window.location.href = 'type-selection.html', 3000);
        }
    }

    // --- FORM SUBMISSION LOGIC ---
    async function handleFormSubmit(event, profileType, user) {
        event.preventDefault();
        const submitButton = currentForm.querySelector('button[type="submit"]');
        const originalButtonText = 'Salvar e Ir para o Dashboard';

        setButtonLoading(submitButton, true, originalButtonText);
        displayMessage(''); // Clear previous errors

        let profileData = { profileType }; // Include the profile type in the data

        try {
            // Collect data based on the active form
            if (profileType === 'pessoa_fisica') {
                profileData.fullName = document.getElementById('pf-fullName').value;
                profileData.birthDate = document.getElementById('pf-birthDate').value;
                profileData.liquid_assets = parseFloat(document.getElementById('pf-liquid_assets').value);
            } else if (profileType === 'autonomo') {
                profileData.fullName = document.getElementById('autonomo-fullName').value;
                profileData.field = document.getElementById('autonomo-field').value;
                profileData.formalization = document.getElementById('autonomo-formalization').value;
                profileData.liquid_assets = parseFloat(document.getElementById('autonomo-liquid_assets').value);
            } else if (profileType === 'empresa') {
                profileData.companyName = document.getElementById('empresa-companyName').value;
                profileData.cnpj = document.getElementById('empresa-cnpj').value;
                profileData.market = document.getElementById('empresa-market').value;
                profileData.liquid_assets = parseFloat(document.getElementById('empresa-liquid_assets').value);
            }

            // 1. Save the detailed profile data in a specific sub-collection
            await setDocument(`users/${user.uid}/profile`, 'user_data', profileData);

            // 2. Mark onboarding as complete and save the profile type at the top level for easy access
            await updateDocument('users', user.uid, { 
                onboardingCompleted: true,
                profileType: profileType
            });

            // 3. Redirect to the main dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error("Setup Error:", error);
            displayMessage("Falha ao salvar. Verifique os campos e tente novamente.", "error");
            setButtonLoading(submitButton, false, originalButtonText);
        }
    }
});
