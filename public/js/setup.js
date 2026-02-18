// Versão Clássica (sem módulos) do setup.js

document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('auth-loader');
    const mainContainer = document.getElementById('main-container');

    onAuthStateChange(async (user) => {
        if (user) {
            try {
                // Busca o documento do usuário para verificar se o onboarding já foi feito.
                const userDoc = await getDocument('users', user.uid);

                if (userDoc.exists && userDoc.data().onboardingCompleted) {
                    // Se o onboarding já foi feito, redireciona para o dashboard.
                    window.location.href = 'dashboard.html';
                    return;
                }
                
                // Esconde o loader e mostra o formulário
                if (loader) loader.style.display = 'none';
                if (mainContainer) mainContainer.style.display = 'block';

                // --- CORREÇÃO PRINCIPAL: Usa o ID correto do formulário ('setup-form') ---
                const setupForm = document.getElementById('setup-form');

                if (setupForm) {
                    setupForm.addEventListener('submit', async (e) => {
                        e.preventDefault(); // Impede o recarregamento da página
                        const submitButton = setupForm.querySelector('button[type="submit"]');
                        submitButton.disabled = true;
                        submitButton.textContent = 'Salvando...';

                        try {
                            // --- CORREÇÃO PRINCIPAL: Coleta dados dos campos corretos do HTML ---
                            const profileData = {
                                fullName: setupForm.fullName.value,
                                birthDate: setupForm.birthDate.value,
                                monthlyIncome: parseFloat(setupForm.monthlyIncome.value) || 0,
                                onboardingCompleted: true // Marca o onboarding como concluído
                            };
                            
                            // Salva os dados no documento do usuário, mesclando com dados existentes.
                            await setDocument('users', user.uid, profileData, true);

                            // Redireciona para o dashboard após o sucesso.
                            window.location.href = 'dashboard.html';

                        } catch (error) {
                            console.error("Erro ao salvar dados do setup: ", error);
                            alert('Ocorreu um erro ao salvar suas informações. Tente novamente.');
                            submitButton.disabled = false;
                            submitButton.textContent = 'Salvar e Ir para o Dashboard';
                        }
                    });
                }
            } catch (error) {
                console.error('Erro crítico no processo de setup: ', error);
                if (loader) loader.style.display = 'none';
                alert('Houve um erro ao verificar sua conta. Por favor, tente fazer o login novamente.');
                window.location.href = 'login.html';
            }
        } else {
            // Se não há usuário logado, volta para a página de login.
            window.location.href = 'login.html';
        }
    });
});
