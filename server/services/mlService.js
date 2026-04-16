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
  // Generate plausible predictions based on input features with high variance for demo
  const dest = (features.destination || '').toLowerCase();
  const cargo = (features.cargo_type || '').toLowerCase();
  
  let baseRisk = 25; // Base low risk

  // ── DEMO TRIGGERS ──
  // Port-specific risk (Simulating real-world congestion)
  if (dest.includes('rotterdam') || dest.includes('hamburg')) baseRisk += 25; // Moderate range
  if (dest.includes('hong kong') || dest.includes('shanghai')) baseRisk += 45; // High range
  if (dest.includes('los angeles')) baseRisk += 15;

  // Signal-specific risk
  if (features.news_sentiment === 'negative') baseRisk += 20;
  if ((features.weather_wind || 0) > 30) baseRisk += 25;
  if (features.shipping_mode === 'Same Day') baseRisk += 15; // Higher pressure
  
  // Cargo-specific risk
  if (cargo.includes('pharmaceutical') || cargo.includes('electronics')) baseRisk += 10;

  // Final Score with some jitter
  const riskScore = Math.min(98.5, Math.max(8.2, baseRisk + (Math.random() * 15 - 5)));
  
  // Calculate predicted delay based on risk score
  // 0-30: 0-1 days, 30-60: 1-3 days, 60-100: 3-7 days
  let predictedDelay;
  if (riskScore < 35) {
    predictedDelay = Math.random() * 0.8;
  } else if (riskScore < 65) {
    predictedDelay = 1 + Math.random() * 2;
  } else {
    predictedDelay = 3.5 + Math.random() * 4;
  }

  const delayCategory = predictedDelay <= 0.5 ? 'On Time' : 
                        predictedDelay <= 1.5 ? 'Minor Delay' : 
                        predictedDelay <= 4 ? 'Moderate Delay' : 'Severe Delay';

  return {
    risk_score: Math.round(riskScore * 10) / 10,
    predicted_delay_days: Math.round(predictedDelay * 100) / 100,
    delay_category: delayCategory,
    rf_prediction: Math.round((predictedDelay + 0.1) * 100) / 100,
    xgb_prediction: Math.round((predictedDelay - 0.1) * 100) / 100,
    shap_values: {
      'Shipping Mode': riskScore > 50 ? 0.42 : 0.15,
      'Days for shipment (scheduled)': riskScore > 50 ? 0.38 : -0.22,
      'Order Region': 0.22,
      'Weather Wind': (features.weather_wind || 0) > 20 ? 0.35 : 0.05,
      'News Sentiment': features.news_sentiment === 'negative' ? 0.45 : 0.02,
    },
    top_risk_factors: [
      { feature: 'Shipping Mode', impact: riskScore > 50 ? 0.42 : 0.15, direction: 'increases risk' },
      { feature: 'Weather/Wind', impact: (features.weather_wind || 0) > 20 ? 0.35 : 0.05, direction: 'increases risk' },
      { feature: 'News Sentiment', impact: features.news_sentiment === 'negative' ? 0.45 : 0.02, direction: 'increases risk' },
      { feature: 'Order Region', impact: 0.22, direction: 'increases risk' },
      { feature: 'Market Demand', impact: 0.18, direction: 'increases risk' },
    ],
    model_metrics: {
      rf: { mae: 0.15, mse: 0.05, r2: 0.98 },
      xgb: { mae: 0.12, mse: 0.04, r2: 0.99 },
    },
    isMock: true,
  };
}

module.exports = { getPrediction, checkHealth };
