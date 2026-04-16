const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseService');

/**
 * GET /api/history
 * Returns prediction history, most recent first
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const { data, error } = await supabase
      .from('predictions')
      .select('id, query, parsed_query, risk_score, predicted_delay_days, delay_category, top_risk_factors, weather_data, news_data, mitigations, llm_analysis, model_metrics, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Map snake_case from DB back to camelCase as expected by frontend
    const uiData = (data || []).map(row => ({
      ...row,
      parsedQuery: row.parsed_query,
      riskScore: row.risk_score,
      predictedDelayDays: row.predicted_delay_days,
      delayCategory: row.delay_category,
      topRiskFactors: row.top_risk_factors,
      weatherData: row.weather_data,
      newsData: row.news_data,
      llmAnalysis: row.llm_analysis,
      modelMetrics: row.model_metrics,
      createdAt: row.created_at
    }));

    res.json(uiData);
  } catch (error) {
    console.error('History fetch error:', error);
    // Return empty array if error
    res.json([]);
  }
});

/**
 * GET /api/history/:id
 * Returns a single prediction by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('id, query, parsed_query, risk_score, predicted_delay_days, delay_category, top_risk_factors, weather_data, news_data, mitigations, llm_analysis, model_metrics, created_at')
      .eq('id', req.params.id)
      .single();
      
    if (error || !data) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    
    const uiData = {
      ...data,
      parsedQuery: data.parsed_query,
      riskScore: data.risk_score,
      predictedDelayDays: data.predicted_delay_days,
      delayCategory: data.delay_category,
      topRiskFactors: data.top_risk_factors,
      weatherData: data.weather_data,
      newsData: data.news_data,
      llmAnalysis: data.llm_analysis,
      modelMetrics: data.model_metrics,
      createdAt: data.created_at
    };

    res.json(uiData);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch prediction' });
  }
});

module.exports = router;
