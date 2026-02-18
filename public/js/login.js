// Versão Clássica (sem módulos) do login.js

document.addEventListener('DOMContentLoaded', () => {
    // A função onAuthStateChange agora está disponível globalmente
    // Redireciona se o usuário já estiver logado
    onAuthStateChange(user => {
        if (user) {
            // Antes de redirecionar para o dashboard, verifica se o onboarding foi concluído
            getDocument('users', user.uid).then(userDoc => {
                if (userDoc.exists && userDoc.data().onboardingCompleted) {
                    window.location.href = 'dashboard.html';
                } else {
                    // Se não completou o onboarding, força o usuário a ir para a página de setup
                    window.location.href = 'setup.html';
                }
            });
        }
    });

    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const displayMessage = (message, type) => {
        const container = document.querySelector('.auth-card');
        let messageBox = container.querySelector('.auth-message');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.className = 'auth-message';
            container.insertBefore(messageBox, loginForm);
        }
        messageBox.textContent = message;
        messageBox.className = `auth-message ${type}`;
    };

    const setButtonLoading = (button, isLoading, originalText) => {
        if (isLoading) {
            button.disabled = true;
            button.textContent = 'Entrando...';
        } else {
            button.disabled = false;
            button.textContent = originalText;
        }
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = 'Login';

        setButtonLoading(submitButton, true, originalButtonText);

        try {
            // A função signIn agora está disponível globalmente
            await signIn(email, password);
            // O onAuthStateChange acima cuidará do redirecionamento para o local correto (dashboard ou setup).
        } catch (error) {
            let friendlyMessage = "Ocorreu um erro ao tentar fazer login.";
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    friendlyMessage = "E-mail ou senha incorretos.";
                    break;
                case 'auth/invalid-email':
                    friendlyMessage = "O e-mail digitado não é válido.";
                    break;
                default:
                    console.error("Login Error:", error);
            }
            displayMessage(friendlyMessage, "error");
            setButtonLoading(submitButton, false, originalButtonText);
        }
    });
});
