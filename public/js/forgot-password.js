
import { sendPasswordReset } from './firebaseService.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    if (!form) return;

    const displayMessage = (message, type) => {
        const container = document.querySelector('.auth-card');
        let messageBox = container.querySelector('.auth-message');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.className = 'auth-message';
            container.insertBefore(messageBox, form);
        }
        messageBox.textContent = message;
        messageBox.className = `auth-message ${type}`;
    };

    const setButtonLoading = (button, isLoading, originalText) => {
        if (isLoading) {
            button.disabled = true;
            button.textContent = 'Enviando...';
        } else {
            button.disabled = false;
            button.textContent = originalText;
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.email.value;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = 'Redefinir Senha';

        setButtonLoading(submitButton, true, originalButtonText);

        try {
            await sendPasswordReset(email);
            displayMessage("E-mail de redefinição enviado! Verifique sua caixa de entrada.", "success");
            // Desabilita o botão para evitar reenvios e aguarda o redirecionamento
            submitButton.disabled = true;
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 4000);

        } catch (error) {
            let friendlyMessage = "Ocorreu um erro ao tentar enviar o e-mail.";
            if (error.code === 'auth/user-not-found') {
                friendlyMessage = "Não foi encontrada uma conta com este e-mail.";
            }
            console.error("Password Reset Error:", error);
            displayMessage(friendlyMessage, "error");
            setButtonLoading(submitButton, false, originalButtonText);
        }
    });
});
