const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
  },
  parsedQuery: {
    port: String,
    eta_days: Number,
    cargo_type: String,
    shipping_mode: String,
    region: String,
  },
  riskScore: {
    type: Number,
    required: true,
  },
  predictedDelayDays: {
    type: Number,
    required: true,
  },
  delayCategory: {
    type: String,
    required: true,
  },
  topRiskFactors: [{
    feature: String,
    impact: Number,
    direction: String,
    importance: Number,
  }],
  weatherData: {
    temp: Number,
    wind_speed: Number,
    humidity: Number,
    description: String,
    icon: String,
    city: String,
  },
  newsData: [{
    title: String,
    description: String,
    source: String,
    url: String,
    sentiment: String,
  }],
  mitigations: [{
    title: String,
    description: String,
    priority: String,
    icon: String,
  }],
  llmAnalysis: {
    type: String,
  },
  modelMetrics: {
    rf: { mae: Number, mse: Number, r2: Number },
    xgb: { mae: Number, mse: Number, r2: Number },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Prediction', predictionSchema);
