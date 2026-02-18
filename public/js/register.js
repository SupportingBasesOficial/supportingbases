
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    const displayMessage = (message, type = 'error') => {
        const container = document.querySelector('.auth-card');
        if (!container) return;

        let messageBox = container.querySelector('.form-message');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.className = 'form-message';
            container.insertBefore(messageBox, registerForm.querySelector('.form-actions'));
        }
        
        messageBox.textContent = message;
        messageBox.className = `form-message ${type}`;
        messageBox.style.display = 'block';
    };

    const setButtonLoading = (button, isLoading, originalText) => {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<span class="loader-sm"></span> Criando conta...';
        } else {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    };

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = registerForm.email.value;
        const password = registerForm.password.value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalButtonText = 'Criar Conta';

        displayMessage('', 'success'); // Limpa mensagens anteriores

        if (password !== passwordConfirm) {
            displayMessage("As senhas não coincidem.");
            return;
        }
        if (password.length < 6) {
            displayMessage("A senha precisa ter no mínimo 6 caracteres.");
            return;
        }

        setButtonLoading(submitButton, true, originalButtonText);

        try {
            const userCredential = await signUp(email, password);
            const userId = userCredential.user.uid;

            await setDocument('users', userId, {
                email: email,
                onboardingCompleted: false,
                createdAt: new Date()
            });
            
            // O redirecionamento acontecerá, então não precisamos reativar o botão aqui.
            window.location.href = 'type-selection.html';

        } catch (error) {
            let friendlyMessage = "Ocorreu um erro desconhecido ao criar a conta.";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    friendlyMessage = "Este endereço de e-mail já está em uso.";
                    break;
                case 'auth/invalid-email':
                    friendlyMessage = "O e-mail fornecido não é válido.";
                    break;
                case 'auth/weak-password':
                    friendlyMessage = "Sua senha é muito fraca. Tente uma mais forte.";
                    break;
                default:
                    console.error("Register Error:", error);
            }
            displayMessage(friendlyMessage, 'error');
            // CORREÇÃO: O botão só é reativado em caso de erro.
            setButtonLoading(submitButton, false, originalButtonText);
        }
    });
});
