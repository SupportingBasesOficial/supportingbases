
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const displayMessage = (message, type = 'error') => {
        let messageBox = loginForm.querySelector('.form-message');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.className = 'form-message';
            const formActions = loginForm.querySelector('.form-actions');
            if (formActions) {
                loginForm.insertBefore(messageBox, formActions);
            } else {
                loginForm.appendChild(messageBox); 
            }
        }
        messageBox.textContent = message;
        messageBox.className = `form-message ${type}`;
        messageBox.style.display = message ? 'block' : 'none';
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

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = 'Entrar';

        displayMessage('');
        setButtonLoading(submitButton, true, originalButtonText);

        try {
            const userCredential = await signIn(email, password);
            const user = userCredential.user;
            
            const userDoc = await getDocument('users', user.uid);

            if (userDoc && userDoc.onboardingCompleted) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'type-selection.html';
            }

        } catch (error) {
            let friendlyMessage = "Ocorreu um erro ao tentar fazer login.";
            if (error.code) {
                 switch (error.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        friendlyMessage = "E-mail ou senha inválidos.";
                        break;
                    case 'auth/invalid-email':
                        friendlyMessage = "O formato do e-mail é inválido.";
                        break;
                    default:
                        console.error("Login Error:", error);
                }
            }
            displayMessage(friendlyMessage, 'error');
            setButtonLoading(submitButton, false, originalButtonText);
        }
    });
});
