const express = require('express');
const admin = require('firebase-admin');

// --- Firebase Admin SDK Initialization ---
// IMPORTANT: The serviceAccountKey.json file is critical for server-side Firebase operations.
// Ensure this file is present and properly configured, but NEVER expose it publicly.
// In a production environment, use environment variables or a secret manager.

// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


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

// --- SUPPORTINGBASES - ENGINE CORE ANTICOLAPSO (v1.0) ---

// This section implements the mathematical core of the financial stability analysis.

/**
 * Calculates the mean (average) of a series of numbers.
 * @param {number[]} data - An array of numbers.
 * @returns {number} The mean of the numbers.
 */
const calculateMean = (data) => {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
};

/**
 * Calculates the standard deviation of a series of numbers.
 * This is a measure of volatility or dispersion.
 * @param {number[]} data - An array of numbers.
 * @returns {number} The standard deviation.
 */
const calculateStdDev = (data) => {
  if (data.length < 2) return 0; // Standard deviation requires at least 2 data points
  const mean = calculateMean(data);
  const squareDiffs = data.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = calculateMean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
};

/**
 * @typedef {object} Expense
 * @property {number} amount - The value of the expense.
 * @property {'fixed'|'variable'} classification - The nature of the expense.
 * @property {'essential'|'non_essential'} priority - The importance of the expense for structural survival.
 */

/**
 * @typedef {object} Income
 * @property {number} amount - The value of the income.
 */

// --- API Routes ---


// Endpoint to provide Firebase config to the client
app.get('/api/firebase-config', (req, res) => {
  res.json(firebaseConfig);
});

/**
 * API Endpoint: /api/engine/calculate
 * Method: POST
 * Description: Receives financial data and calculates the core stability metrics
 * based on the SupportingBases Anticolapse financial engineering model.
 *
 * Request Body:
 * {
 *   "incomes": [{"amount": 5000}, {"amount": 5200}, {"amount": 4800}], // Historical income per period
 *   "expenses": [
 *     {"amount": 1500, "classification": "fixed", "priority": "essential"},
 *     {"amount": 300, "classification": "variable", "priority": "essential"},
 *     {"amount": 800, "classification": "variable", "priority": "non_essential"}
 *   ],
 *   "liquid_assets": 10000 // Total emergency reserves
 * }
 *
 * Response:
 * A JSON object containing the calculated financial metrics.
 */
app.post('/api/engine/calculate', (req, res) => {
  const { incomes, expenses, liquid_assets } = req.body;

  if (!incomes || !expenses || liquid_assets === undefined) {
    return res.status(400).json({ error: 'Missing required fields: incomes, expenses, liquid_assets.' });
  }

  // 1. Meta Mínima Estrutural Dinâmica (MME)
  // The absolute minimum cost to maintain the essential structure.
  const essentialExpenses = expenses.filter(e => e.priority === 'essential');
  const mme = essentialExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 2. Receita Ajustada por Volatilidade (RAV)
  // Estimated revenue in a pessimistic scenario, penalizing volatility.
  const incomeAmounts = incomes.map(i => i.amount);
  const meanIncome = calculateMean(incomeAmounts);
  const stdDevIncome = calculateStdDev(incomeAmounts);
  const riskCoefficient = 1.5; // Conservative coefficient
  const rav = meanIncome - (riskCoefficient * stdDevIncome);

  // 3. Índice de Compressão Financeira (ICF)
  // The core indicator of structural pressure. ICF > 1.0 means imminent collapse.
  const icf = rav > 0 ? mme / rav : Infinity;

  // 4. Margem de Sobrevivência Dinâmica (MSD)
  // How many months of survival are guaranteed if all income ceases.
  const msd = mme > 0 ? liquid_assets / mme : Infinity;

  // 5. Elasticidade Estrutural (EE)
  // The capacity to cut costs without affecting the essential structure.
  const nonEssentialExpenses = expenses.filter(e => e.priority === 'non_essential');
  const nonEssentialSum = nonEssentialExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const ee = totalExpenses > 0 ? nonEssentialSum / totalExpenses : 0;

  const results = {
    mme: {
      value: mme,
      label: 'Meta Mínima Estrutural',
      description: 'Custo mensal mínimo para sobrevivência estrutural.'
    },
    rav: {
      value: rav,
      label: 'Receita Ajustada por Volatilidade',
      description: 'Estimativa de receita líquida em cenário pessimista.'
    },
    icf: {
      value: icf,
      label: 'Índice de Compressão Financeira',
      description: 'Pressão sobre a estrutura. > 1.0 = Colapso Iminente.'
    },
    msd: {
      value: msd,
      label: 'Margem de Sobrevivência Dinâmica',
      description: 'Meses de sobrevivência garantida sem nenhuma receita.'
    },
    ee: {
      value: ee,
      label: 'Elasticidade Estrutural',
      description: 'Capacidade de cortar custos não essenciais (0 a 1).'
    }
  };

  res.status(200).json(results);
});


// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: "API is working!" });
});

// Registration route (Firebase functionality currently commented out)
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required."});
  }

  try {
    // const userRecord = await admin.auth().createUser({
    //   email: email,
    //   password: password,
    // });
    // res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
    res.status(201).json({ message: 'Dummy registration successful', uid: `user_${Date.now()}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  console.log('--- SUPPORTINGBASES Engine Core Initialized ---');
  console.log('Ready to receive financial data at /api/engine/calculate');
});
