// =====================================================================================
// ARQUIVO DE CONFIGURAÇÃO DO FIREBASE
// =====================================================================================
// A única responsabilidade deste arquivo é obter a configuração do servidor.
// A inicialização do App ocorrerá no firebaseService.js

// Esta função busca a configuração do Firebase do servidor e a torna disponível globalmente.
async function fetchFirebaseConfig() {
  try {
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const config = await response.json();
    // Torna a configuração disponível globalmente para outros scripts
    window.firebaseConfig = config;
    console.log('Firebase config loaded successfully.');
  } catch (error) {
    console.error('Failed to fetch Firebase config:', error);
    // Você pode querer lidar com este erro de forma mais robusta
  }
}

// Inicia o processo de busca da configuração assim que o script for carregado.
fetchFirebaseConfig();
