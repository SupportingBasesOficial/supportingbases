// =====================================================================================
// ATENÇÃO: ARQUIVO DE CONFIGURAÇÃO DO FIREBASE
// =====================================================================================
//
// POR FAVOR, SUBSTITUA AS CHAVES ABAIXO PELAS CHAVES DO SEU PROJETO FIREBASE.
//
// Você pode encontrar essas chaves no console do Firebase do seu projeto:
// (Engrenagem) > Configurações do Projeto > Geral > Seus aplicativos > Aplicativo da Web
//
// =====================================================================================

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD5jRAKuSwthbmTApCO1NIXq31Z9PagMf8",
  authDomain: "supportingbases-94551271-9f34b.firebaseapp.com",
  projectId: "supportingbases-94551271-9f34b",
  storageBucket: "supportingbases-94551271-9f34b.firebasestorage.app",
  messagingSenderId: "688483394625",
  appId: "1:688483394625:web:c03f6dffb1c24b7337d2c0"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Disponibiliza as instâncias do Auth e Firestore globalmente
const auth = firebase.auth();
const db = firebase.firestore();

// Para garantir que `auth` e `db` estejam disponíveis no escopo global (window),
// especialmente em ambientes de módulo ou scripts mais rigorosos.
window.auth = auth;
window.db = db;
