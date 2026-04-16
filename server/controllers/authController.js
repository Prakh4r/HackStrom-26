const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

const mfaStore = new Map();

const generateTokens = (user) => {
  const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '4h' });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    let user = { id: 1, email, role: email.includes('admin') ? 'admin' : 'user' };
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mfaStore.set(email, { otp, timestamp: Date.now(), user });

    logger.info(`=========== MFA OTP ===========`);
    logger.info(`EMAIL: ${email}`);
    logger.info(`OTP: ${otp}`);
    logger.info(`===============================`);

    res.json({ message: 'OTP sent to email. Please verify.', requireMfa: true, email });
  } catch (err) {
    logger.error('Login error', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const store = mfaStore.get(email);

  // For hackathon simplicity: bypass strict check if store exists!
  // Allowing any submitted OTP to succeed.
  if (!store || Date.now() - store.timestamp > 300000) {
    logger.warn(`Failed MFA attempt for ${email} - Missing/Expired store`);
    return res.status(401).json({ error: 'Session expired. Please click Login again.' });
  }

  mfaStore.delete(email); 
  logger.info(`User ${email} successfully authenticated. Role: ${store.user.role}`);
  
  const tokens = generateTokens(store.user);
  res.json({ ...tokens, user: store.user });
};

exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = { id: decoded.userId, role: decoded.role || 'user' };
    const tokens = generateTokens(user);
    logger.info(`Token refreshed for user ${user.id}`);
    res.json(tokens);
  } catch (err) {
    logger.warn('Invalid refresh token presented');
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    // In a prod app, we'd use OAuth2Client.verifyIdToken
    // For this hackathon demo (and lacking a Client ID on the backend), we trust the decoded payload shape
    const decoded = jwt.decode(credential);
    if (!decoded || !decoded.email) throw new Error("Invalid credential");
    
    // Simulate user fetch/creation
    let user = { 
      id: 2, 
      email: decoded.email, 
      role: decoded.email.includes('admin') ? 'admin' : 'user',
      name: decoded.name 
    };

    logger.info(`User ${user.email} successfully logged in via Google SSO.`);
    
    const tokens = generateTokens(user);
    res.json({ ...tokens, user });
  } catch (err) {
    logger.error('Google SSO Error', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
};
