const winston = require('winston');
const LokiTransport = require('winston-loki');

const LOKI_URL = process.env.LOKI_URL || 'http://localhost:3100';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Avoid crashing if Loki is completely down
if (process.env.LOKI_URL) {
  logger.add(new LokiTransport({
    host: LOKI_URL,
    labels: { app: 'delay-intelligence-backend' },
    json: true,
    format: winston.format.json(),
    replaceTimestamp: true,
    onConnectionError: (err) => console.error('Loki Connection Error:', err),
  }));
}

module.exports = logger;
