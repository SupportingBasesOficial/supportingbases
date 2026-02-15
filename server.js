const express = require('express');
const admin = require('firebase-admin');

// --- Firebase Admin SDK Initialization ---
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// --- Client-side Firebase SDK Configuration ---
// We expose this configuration to the client-side via an API endpoint.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// --- Express App Setup ---
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public'));

// --- API Routes ---

// Endpoint to provide Firebase config to the client
app.get('/api/firebase-config', (req, res) => {
  res.json(firebaseConfig);
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: "API is working and Firebase Admin SDK is initialized!" });
});

// Registration route
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });
    res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
