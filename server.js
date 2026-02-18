
const express = require('express');
const admin = require('firebase-admin');

// --- MODULE IMPORTS ---
// Layered Architecture: Interface -> Application -> Core Engine
const { calculateAllMetrics } = require('./core-engine/financial-metrics.js');
const { classifyPhase } = require('./application/phase-classifier.js');

// --- FIREBASE & EXPRESS SETUP (placeholders) ---
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // ... other config from environment
};

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('public'));

// --- API ROUTES ---

// Client config endpoint
app.get('/api/firebase-config', (req, res) => {
  res.json(firebaseConfig);
});

/**
 * API Endpoint: /api/engine/diagnose
 * Method: POST
 * Description: The main diagnostic endpoint. It orchestrates the call to the
 * core engine and the application layer to return a full diagnosis.
 */
app.post('/api/engine/diagnose', (req, res) => {
  try {
    // 1. Call the Core Engine to get the raw metrics
    const metrics = calculateAllMetrics(req.body);

    // 2. Call the Application Layer to interpret the metrics
    const phase = classifyPhase(metrics);

    // 3. Assemble the final diagnostic object
    const diagnosis = {
      phase,
      metrics,
      // The conceptual reserve target used for some phases
      reserveTarget: 6, 
    };

    res.status(200).json(diagnosis);

  } catch (error) {
    // Handle errors from any layer (e.g., bad data for the engine)
    res.status(400).json({ error: error.message });
  }
});

// Dummy registration route
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  res.status(201).json({ message: 'Dummy registration successful', uid: `user_${Date.now()}` });
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log('--- SUPPORTINGBASES Architecture ---');
  console.log('[v] Interface Layer Initialized');
  console.log('[v] Application Layer Integrated');
  console.log('[v] Core Mathematical Engine is standing by.');
});
