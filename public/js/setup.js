
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('auth-loader');
    const errorMessageContainer = document.getElementById('error-message'); // This is a general container, not form-specific

    const forms = {
        pessoa_fisica: document.getElementById('setup-form-pessoa_fisica'),
        autonomo: document.getElementById('setup-form-autonomo'),
        empresa: document.getElementById('setup-form-empresa')
    };

    let currentForm = null;

    onAuthStateChange(user => {
        if (user) {
            initializeForm(user);
        } else {
            window.location.href = 'login.html';
        }
    });

    // Adjusted to work with a general error container and form-specific if needed
    const displayMessage = (message, type = 'error') => {
        // Use the general error message container if the form one doesn't make sense here
        if (errorMessageContainer) {
            errorMessageContainer.textContent = message;
            errorMessageContainer.className = `form-message ${type}`;
            errorMessageContainer.style.display = message ? 'block' : 'none';
        }
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

    function initializeForm(user) {
        const urlParams = new URLSearchParams(window.location.search);
        const profileType = urlParams.get('type');

        showLoader(true);

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

    async function handleFormSubmit(event, profileType, user) {
        event.preventDefault();
        if (!currentForm) return;

        const submitButton = currentForm.querySelector('button[type="submit"]');
        const originalButtonText = 'Salvar e Ir para o Dashboard';

        setButtonLoading(submitButton, true, originalButtonText);
        displayMessage('');

        let profileData = { profileType };

        try {
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
            
            // Basic validation to ensure fields are not empty
            for (const key in profileData) {
                if (!profileData[key] && key !== 'profileType') {
                    throw new Error(`O campo ${key} é obrigatório.`);
                }
            }

            await setDocument(`users/${user.uid}/profile`, 'user_data', profileData);
            await updateDocument('users', user.uid, { 
                onboardingCompleted: true,
                profileType: profileType
            });

            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error("Setup Error:", error);
            displayMessage(error.message || "Falha ao salvar. Verifique os campos e tente novamente.", "error");
            setButtonLoading(submitButton, false, originalButtonText);
        }
    }
});
