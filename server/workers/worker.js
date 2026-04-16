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
  const { query, traceId } = job.data;
  logger.info(`[${traceId}] Job Started: Processing query: "${query}"`);

  await job.updateProgress(10);
  
  try {
    const parsedQuery = await parseShipmentQuery(query);
    logger.info(`[${traceId}] Query parsed successfully`);
    await job.updateProgress(30);

    let weather = null;
    let news = null;
    try {
      weather = await getWeather(parsedQuery.port);
      news = await getNews(parsedQuery.port || parsedQuery.region || 'logistics');
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

    const finalResult = {
      query,
      parsedQuery,
      riskScore: mlResponse.risk_score,
      predictedDelayDays: mlResponse.predicted_delay_days,
      delayCategory: mlResponse.delay_category,
      topRiskFactors: mlResponse.top_risk_factors,
      weatherData: weather,
      newsData: news,
      mitigations: assessment.mitigations,
      alternativeRoutes: assessment.alternative_routes,
      financialImpactUsd: assessment.financial_impact_usd,
      financialBreakdown: assessment.financial_breakdown,
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
