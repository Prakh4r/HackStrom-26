const logger = require('../utils/logger');
const supabase = require('../services/supabaseService');

const requireAuth = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    logger.warn('Unauthorized access attempt: No token provided');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      logger.warn('Forbidden access attempt: Invalid token');
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }

    req.user = { 
      userId: user.id, 
      email: user.email,
      role: user.email?.includes('admin') ? 'admin' : 'user'
    };
    next();
  } catch (err) {
    logger.error('Auth middleware error', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
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

module.exports = { requireAuth, requireAdmin };
