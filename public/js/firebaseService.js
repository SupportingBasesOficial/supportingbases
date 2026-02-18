// =====================================================================================
// Módulo Central de Serviços do Firebase - VERSÃO SEM MÓDULOS (GLOBAL SCOPE)
// =====================================================================================
// O HTML deve carregar os SDKs do Firebase e o firebase-config.js ANTES deste arquivo.

// --- Inicialização ---
// Assume que os objetos `firebase` e `firebaseConfig` já existem no escopo da janela.
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- Funções de Autenticação (disponíveis globalmente) ---

function onAuthStateChange(callback) {
    return auth.onAuthStateChanged(callback);
}

function signUp(email, password) {
    return auth.createUserWithEmailAndPassword(email, password);
}

function signIn(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

function logOut() {
    return auth.signOut();
}

function sendPasswordReset(email) {
    return auth.sendPasswordResetEmail(email);
}

// --- Funções do Firestore (disponíveis globalmente) ---

function setDocument(collectionPath, docId, data, merge = false) {
    return db.collection(collectionPath).doc(docId).set(data, { merge });
}

function getDocument(collectionPath, docId) {
    return db.collection(collectionPath).doc(docId).get();
}

function addDocument(collectionPath, data) {
    return db.collection(collectionPath).add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function getCollection(collectionPath) {
    return db.collection(collectionPath).get();
}

function onSnapshot(path, callback) {
    return db.collection(path).onSnapshot(snapshot => {
        const docs = [];
        snapshot.forEach(doc => {
            docs.push({ id: doc.id, ...doc.data() });
        });
        callback(docs);
    });
}
