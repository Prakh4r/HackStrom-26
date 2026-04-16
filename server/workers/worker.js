require('dotenv').config();
const { Worker } = require('bullmq');
const { connection } = require('../services/queueService');
const logger = require('../utils/logger');
const supabase = require('../services/supabaseService');

const { parseShipmentQuery, generateRiskAssessment } = require('../services/llmService');
const { getWeather, getPortCoordinates } = require('../services/weatherService');
const { getNews } = require('../services/newsService');
const { getPrediction } = require('../services/mlService');

logger.info('🚀 Backend Worker started... Waiting for prediction jobs.');

const predictionWorker = new Worker('DelayPredictions', async job => {
  const { query, traceId, overrides = {} } = job.data;
  logger.info(`[${traceId}] Job Started: Processing query: "${query}" with overrides: ${JSON.stringify(overrides)}`);

  await job.updateProgress(10);
  
  try {
    const parsedQuery = await parseShipmentQuery(query);
    logger.info(`[${traceId}] Query parsed successfully`);
    await job.updateProgress(30);

    let weather = null;
    let news = null;
    try {
      weather = await getWeather(parsedQuery.destination);
      news = await getNews(parsedQuery.destination || parsedQuery.region || 'logistics');

      // --- SIMULATOR OVERRIDES ---
      if (overrides.forceWeather) {
        logger.warn(`[${traceId}] SIMULATOR: Forcing Category 5 Hurricane`);
        weather = {
          ...weather,
          temp: 28,
          wind_speed: 145, // Hurricane force
          description: 'SEVERE HURRICANE - CATEGORY 5',
          icon: '11d'
        };
      }
      
      if (overrides.forceStrike) {
        logger.warn(`[${traceId}] SIMULATOR: Forcing Massive Port Strike`);
        news = [
          {
            title: "CRITICAL: Nationwide Port Union Strike Halts All Operations",
            description: "No cargo moving in or out. Backlog estimated at 3 weeks.",
            sentiment: "negative",
            source: "Logistics Weekly"
          },
          ...(news || [])
        ];
      }

      if (overrides.forceBlockade) {
        logger.warn(`[${traceId}] SIMULATOR: Forcing Naval Blockade / Geopolitical Conflict`);
        news = [
          {
            title: "ALERT: Geopolitical Conflict Leads to Naval Blockade of Region",
            description: "Shipping lanes closed until further notice. Immediate reroute mandatory.",
            sentiment: "negative",
            source: "Global Conflict Watch"
          },
          ...(news || [])
        ];
      }
    } catch (err) {
      logger.warn(`[${traceId}] External API warning: ${err.message}`);
    }
    await job.updateProgress(50);

    const mlRequestData = {
      shipping_mode: parsedQuery.shipping_mode || "Standard Class",
      market: parsedQuery.market || "Europe",
      order_region: parsedQuery.region || "Western Europe",
      scheduled_days: parsedQuery.eta_days || 4,
      latitude: weather?.lat || 25.2048,
      longitude: weather?.lon || 55.2708,
      origin: parsedQuery.origin || "Singapore",
      destination: parsedQuery.destination || "Rotterdam",
      weather_temp: weather?.temp,
      weather_wind: weather?.wind_speed,
      weather_humidity: weather?.humidity,
      news_sentiment: news?.[0]?.sentiment || 'neutral',
      // Other model defaults
      customer_segment: "Consumer",
      category_name: "Sporting Goods",
      order_status: "COMPLETE"
    };
    
    const mlResponse = await getPrediction(mlRequestData);
    logger.info(`[${traceId}] ML Processing complete: Risk ${mlResponse.risk_score}`);
    await job.updateProgress(75);

    const assessment = await generateRiskAssessment(
      mlResponse, 
      weather || {}, 
      news || [], 
      query
    );
    await job.updateProgress(90);

    const originCoords = getPortCoordinates(parsedQuery.origin);
    const destCoords = getPortCoordinates(parsedQuery.destination);

    // ── FORMULA-BASED FINANCIAL MODEL ──
    // Industry standard rates, not LLM hallucinations
    const cargoTypeMultipliers = {
      'electronics': 25000, 'auto parts': 18000, 'pharmaceutical': 30000,
      'perishable': 15000, 'textiles': 8000, 'machinery': 22000,
      'chemicals': 20000, 'general': 12000, 'bulk': 6000, 'wheat': 5000
    };
    const cargoKey = Object.keys(cargoTypeMultipliers).find(
      k => (parsedQuery.cargo_type || 'general').toLowerCase().includes(k)
    ) || 'general';
    const estimatedCargoValue = cargoTypeMultipliers[cargoKey];

    const delayDays = Math.max(0, mlResponse.predicted_delay_days);
    const riskMultiplier = mlResponse.risk_score / 100;

    // Formula: transparent, auditable, defensible
    const holdingCost = Math.round(delayDays * 850 * riskMultiplier); // $850/day warehouse rate × risk
    const penaltyFees = delayDays > 1 ? Math.round(estimatedCargoValue * 0.03 * riskMultiplier) : 0; // 3% penalty if late
    const revenueAtRisk = Math.round(estimatedCargoValue * riskMultiplier * 0.4); // 40% of cargo value weighted by risk
    const totalFinancialImpact = holdingCost + penaltyFees + revenueAtRisk;

    const financialBreakdown = {
      revenue_at_risk: revenueAtRisk,
      holding_cost: holdingCost,
      penalty_fees: penaltyFees
    };

    const finalResult = {
      query,
      parsedQuery,
      originCoords,
      destCoords,
      riskScore: mlResponse.risk_score,
      predictedDelayDays: mlResponse.predicted_delay_days,
      delayCategory: mlResponse.delay_category,
      topRiskFactors: mlResponse.top_risk_factors,
      weatherData: weather,
      newsData: news,
      mitigations: assessment.mitigations,
      alternativeRoutes: assessment.alternative_routes,
      financialImpactUsd: totalFinancialImpact,
      financialBreakdown: financialBreakdown,
      mode_comparison: assessment.mode_comparison || [],
      llmAnalysis: assessment.analysis,
      modelMetrics: mlResponse.model_metrics,
      jobId: job.id
    };

    const { encryptPII } = require('../utils/crypto');
    const mockShipperContact = query.slice(0, 15) + "@shipper.com";
    const encryptedPii = encryptPII(mockShipperContact);
    logger.info(`[${traceId}] Encrypted PII for storage`);

    try {
      const { error } = await supabase.from('predictions').insert([{
        query: finalResult.query,
        parsed_query: finalResult.parsedQuery,
        risk_score: finalResult.riskScore,
        predicted_delay_days: finalResult.predictedDelayDays,
        delay_category: finalResult.delayCategory,
        top_risk_factors: finalResult.topRiskFactors,
        weather_data: finalResult.weatherData,
        news_data: finalResult.newsData,
        mitigations: finalResult.mitigations,
        alternative_routes: finalResult.alternativeRoutes,
        financial_impact_usd: finalResult.financialImpactUsd,
        financial_breakdown: finalResult.financialBreakdown,
        llm_analysis: finalResult.llmAnalysis,
        model_metrics: finalResult.modelMetrics,
        job_id: job.id,
        shipper_contact_encrypted: encryptedPii
      }]);

      if (error) {
        logger.warn(`[${traceId}] Supabase insert returned an error: ${error.message}`);
      } else {
        logger.info(`[${traceId}] Job Complete! Saved to database.`);
      }
    } catch (dbErr) {
      logger.warn(`[${traceId}] Failed to save to Supabase (check API keys): ${dbErr.message}`);
    }
    await job.updateProgress(100);
    
    return finalResult;
  } catch (error) {
    logger.error(`[${traceId}] Job Failed: ${error.message}`);
    throw error;
  }
}, { connection, concurrency: 2 }); 

predictionWorker.on('failed', (job, err) => {
  logger.error(`${job.id} has failed with ${err.message}`);
});
