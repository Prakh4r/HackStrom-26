const { Queue } = require('bullmq');
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

const predictionQueue = new Queue('DelayPredictions', { connection });

async function addPredictionJob(data) {
  const job = await predictionQueue.add('predictRisk', data, {
    // Ensuring basic idempotency by keeping recently completed jobs
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600 }
  });
  return job.id;
}

module.exports = { predictionQueue, connection, addPredictionJob };
