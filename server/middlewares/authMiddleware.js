const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_hackathon_key';

const requireAuth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    logger.warn('Unauthorized access attempt: No token provided');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, role, ... }
    next();
  } catch (err) {
    logger.warn('Forbidden access attempt: Invalid token');
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: No user session' });
  }
  
  if (req.user.role !== 'admin') {
    logger.warn(`Forbidden attempt by user ${req.user.userId}: Admins only`);
    return res.status(403).json({ error: 'Forbidden: Admin access required to view this data' });
  }
  next();
};

module.exports = { requireAuth, requireAdmin, JWT_SECRET };
