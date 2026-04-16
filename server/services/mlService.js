const fetch = require('node-fetch');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Call the Python ML service for delay prediction
 * @param {Object} features - Shipment features
 * @returns {Object} Prediction results with SHAP values
 */
async function getPrediction(features) {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('ML service error:', err);
      return getMockPrediction(features);
    }

    return await response.json();
  } catch (error) {
    console.error('ML service connection error:', error.message);
    return getMockPrediction(features);
  }
}

/**
 * Check ML service health
 */
async function checkHealth() {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Mock prediction when ML service is unavailable
 */
function getMockPrediction(features) {
  // Generate plausible predictions based on input features
  const scheduled = features.scheduled_days || 4;
  const windRisk = (features.weather_wind || 10) > 20 ? 1.5 : 0;
  const baseDelay = (Math.random() * 2 - 0.5) + windRisk;

  const riskScore = Math.min(100, Math.max(0,
    30 + (baseDelay * 15) + (windRisk * 10) + Math.random() * 10
  ));

  return {
    risk_score: Math.round(riskScore * 10) / 10,
    predicted_delay_days: Math.round(baseDelay * 100) / 100,
    delay_category: baseDelay <= 0 ? 'On Time' : baseDelay <= 1 ? 'Minor Delay' : baseDelay <= 3 ? 'Moderate Delay' : 'Severe Delay',
    rf_prediction: Math.round((baseDelay + Math.random() * 0.3) * 100) / 100,
    xgb_prediction: Math.round((baseDelay - Math.random() * 0.3) * 100) / 100,
    shap_values: {
      'Shipping Mode': 0.35,
      'Days for shipment (scheduled)': -0.28,
      'Order Region': 0.22,
      'Order Item Total': -0.18,
      'Market': 0.15,
      'Product Price': -0.12,
      'Latitude': 0.10,
      'Longitude': 0.08,
    },
    top_risk_factors: [
      { feature: 'Shipping Mode', impact: 0.35, direction: 'increases risk', importance: 0.35 },
      { feature: 'Days for shipment (scheduled)', impact: -0.28, direction: 'decreases risk', importance: 0.28 },
      { feature: 'Order Region', impact: 0.22, direction: 'increases risk', importance: 0.22 },
      { feature: 'Order Item Total', impact: -0.18, direction: 'decreases risk', importance: 0.18 },
      { feature: 'Market', impact: 0.15, direction: 'increases risk', importance: 0.15 },
    ],
    model_metrics: {
      rf: { mae: 0.15, mse: 0.05, r2: 0.98 },
      xgb: { mae: 0.12, mse: 0.04, r2: 0.99 },
    },
    isMock: true,
  };
}

module.exports = { getPrediction, checkHealth };
