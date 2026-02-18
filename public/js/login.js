
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    // --- REDIRECT LOGIC ---
    // This listener is always active. If a user is logged in, it redirects them.
    // This handles both the initial page load and the successful login event.
    onAuthStateChange(user => {
        if (user) {
            showAuthLoader(true); // Show a loader during the doc check
            getDocument('users', user.uid).then(userDoc => {
                if (userDoc.exists && userDoc.data().onboardingCompleted) {
                    window.location.href = 'dashboard.html';
                } else {
                    // If the user doc doesn't exist or onboarding isn't done, go to setup.
                    window.location.href = 'setup.html';
                }
            }).catch(() => {
                // If reading the doc fails, still go to setup as a fallback.
                window.location.href = 'setup.html';
            });
        }
    });

    // --- UI HELPER FUNCTIONS (Standardized) ---
    const displayMessage = (message, type = 'error') => {
        const container = document.querySelector('.auth-card');
        if (!container) return;

        let messageBox = container.querySelector('.form-message');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.className = 'form-message';
            container.insertBefore(messageBox, loginForm.querySelector('.form-actions'));
        }
        
        messageBox.textContent = message;
        messageBox.className = `form-message ${type}`;
        messageBox.style.display = 'block';
    };

    const setButtonLoading = (button, isLoading, originalText) => {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="loader-sm"></span> Entrando...';
        } else {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    };

    const showAuthLoader = (isLoading) => {
        const loader = document.querySelector('.auth-container .loader-fullpage'); // A specific loader for this page
        if (loader) {
            loader.style.display = isLoading ? 'flex' : 'none';
        }
    };

    // --- FORM SUBMISSION LOGIC ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = 'Login';

        // Clear previous messages
        displayMessage('', 'success');
        setButtonLoading(submitButton, true, originalButtonText);

        try {
            // 1. Attempt to sign in with Firebase Auth
            await signIn(email, password);
            // 2. If successful, the `onAuthStateChange` listener at the top will automatically handle the redirect.
            // We don't need to do anything else here.

        } catch (error) {
            let friendlyMessage = "Ocorreu um erro ao tentar fazer login.";
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential': // Common error code for wrong email/pass
                    friendlyMessage = "E-mail ou senha incorretos.";
                    break;
                case 'auth/invalid-email':
                    friendlyMessage = "O e-mail digitado não é válido.";
                    break;
                default:
                    console.error("Login Error:", error);
            }
            displayMessage(friendlyMessage, 'error');
            setButtonLoading(submitButton, false, originalButtonText); // Only stop loading on error
        }
    });
});
