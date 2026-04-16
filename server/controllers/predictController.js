const crypto = require('crypto');
const logger = require('../utils/logger');
const { addPredictionJob, predictionQueue } = require('../services/queueService');

exports.submitPrediction = async (req, res) => {
  const { query } = req.body;
  const traceId = crypto.randomUUID(); 
  
  if (!query) {
    return res.status(400).json({ error: 'Shipment query is required' });
  }

  try {
    logger.info(`[${traceId}] Received prediction request -> queueing job.`);
    const jobId = await addPredictionJob({ query, traceId });
    
    res.json({ 
      message: 'Job submitted successfully', 
      jobId, 
      traceId,
      statusUrl: `/job-status/${jobId}` 
    });
  } catch (error) {
    logger.error(`[${traceId}] Failed to enqueue job`, error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

exports.getJobStatus = async (req, res) => {
  try {
    const job = await predictionQueue.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;

    if (state === 'completed') {
      return res.json({ status: 'completed', result: job.returnvalue });
    } else if (state === 'failed') {
      return res.json({ status: 'failed', error: job.failedReason });
    } else {
      return res.json({ status: state, progress });
    }
  } catch (err) {
    logger.error('Error checking status', err);
    res.status(500).json({ error: 'Server error checking status' });
  }
};
