
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is initialized
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("Firebase is not initialized.");
        displayAuthMessage("Erro crítico: A conexão com o servidor falhou. Tente recarregar a página.", "error");
        return;
    }

    const auth = firebase.auth();
    const path = window.location.pathname;

    if (path.includes('register.html')) {
        setupRegisterPage(auth);
    } else if (path.includes('login.html')) {
        setupLoginPage(auth);
    } else if (path.includes('forgot-password.html')) {
        setupForgotPasswordPage(auth);
    }
});

function setupRegisterPage(auth) {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = registerForm.email.value;
        const password = registerForm.password.value;
        const submitButton = registerForm.querySelector('button[type="submit"]');

        if (password.length < 6) {
            displayAuthMessage("A senha precisa ter no mínimo 6 caracteres.", "error");
            return;
        }

        setButtonLoading(submitButton, true, "Criando conta...");

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                const db = firebase.firestore();
                return db.collection('users').doc(user.uid).set({
                    email: user.email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    window.location.href = 'setup.html';
                });
            })
            .catch(error => {
                let friendlyMessage = "Ocorreu um erro desconhecido.";
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        friendlyMessage = "Este endereço de e-mail já está em uso por outra conta.";
                        break;
                    case 'auth/invalid-email':
                        friendlyMessage = "O endereço de e-mail fornecido não é válido.";
                        break;
                    case 'auth/weak-password':
                        friendlyMessage = "A senha fornecida é muito fraca. Por favor, use uma senha mais forte.";
                        break;
                    default:
                        console.error("Register Error:", error);
                }
                displayAuthMessage(friendlyMessage, "error");
                setButtonLoading(submitButton, false, "Criar Conta");
            });
    });
}

function setupLoginPage(auth) {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        
        setButtonLoading(submitButton, true, "Entrando...");

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                 window.location.href = 'dashboard.html';
            })
            .catch(error => {
                let friendlyMessage = "Ocorreu um erro ao tentar fazer login.";
                switch (error.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        friendlyMessage = "E-mail ou senha incorretos. Por favor, verifique e tente novamente.";
                        break;
                    case 'auth/invalid-email':
                        friendlyMessage = "O e-mail digitado não é válido.";
                        break;
                    default:
                        console.error("Login Error:", error);
                }
                displayAuthMessage(friendlyMessage, "error");
                setButtonLoading(submitButton, false, "Login");
            });
    });
}

function setupForgotPasswordPage(auth) {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (!forgotPasswordForm) return;

    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = forgotPasswordForm.email.value;
        const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');

        setButtonLoading(submitButton, true, "Enviando...");

        auth.sendPasswordResetEmail(email)
            .then(() => {
                displayAuthMessage("E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada.", "success");
                setButtonLoading(submitButton, false, "Redefinir Senha");
                 setTimeout(() => { window.location.href = 'login.html'; }, 3000);
            })
            .catch(error => {
                let friendlyMessage = "Ocorreu um erro.";
                 if (error.code === 'auth/user-not-found') {
                    friendlyMessage = "Não foi encontrada uma conta com este endereço de e-mail.";
                }
                displayAuthMessage(friendlyMessage, "error");
                setButtonLoading(submitButton, false, "Redefinir Senha");
            });
    });
}

function displayAuthMessage(message, type = 'error') {
    const oldMessage = document.querySelector('.auth-message');
    if (oldMessage) {
        oldMessage.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = `auth-message ${type}`;
    messageElement.textContent = message;

    const authCard = document.querySelector('.auth-card');
    if (authCard) {
        const form = authCard.querySelector('form');
        if (form) {
            authCard.insertBefore(messageElement, form);
        }
    }
}

function setButtonLoading(button, isLoading, loadingText = "Aguarde...") {
    if (isLoading) {
        button.disabled = true;
        button.textContent = loadingText;
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || button.textContent;
    }
}

document.querySelectorAll('.auth-card button[type="submit"]').forEach(button => {
    button.dataset.originalText = button.textContent;
});
