
// Versão Clássica (sem módulos) do register.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    const displayMessage = (message, type) => {
        const container = document.querySelector('.auth-box'); // Updated selector
        let messageBox = container.querySelector('.error-message'); // Updated selector
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.className = 'error-message';
            container.insertBefore(messageBox, registerForm);
        }
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.style.color = type === 'error' ? '#f87171' : '#34d399';
    };

    const setButtonLoading = (button, isLoading, originalText) => {
        if (isLoading) {
            button.disabled = true;
            button.textContent = 'Criando conta...';
        } else {
            button.disabled = false;
            button.textContent = originalText;
        }
    };

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = registerForm.email.value;
        const password = registerForm.password.value;
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalButtonText = 'Criar Conta';

        if (password.length < 6) {
            displayMessage("A senha precisa ter no mínimo 6 caracteres.", "error");
            return;
        }

        setButtonLoading(submitButton, true, originalButtonText);

        try {
            // As funções signUp e setDocument agora estão disponíveis globalmente
            await signUp(email, password);
            
            // --- CRITICAL CHANGE --- 
            // Redirect to the profile type selection page after successful registration.
            window.location.href = 'type-selection.html';

        } catch (error) {
            let friendlyMessage = "Ocorreu um erro desconhecido.";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    friendlyMessage = "Este endereço de e-mail já está em uso.";
                    break;
                case 'auth/invalid-email':
                    friendlyMessage = "O e-mail fornecido não é válido.";
                    break;
                case 'auth/weak-password':
                    friendlyMessage = "A senha é muito fraca. Tente uma mais forte.";
                    break;
                default:
                    console.error("Register Error:", error);
            }
            displayMessage(friendlyMessage, "error");
        } finally {
            setButtonLoading(submitButton, false, originalButtonText);
        }
    });
});
