const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const { getJobStatus } = require('../controllers/predictController');

// GET /job-status/:jobId
router.get('/:jobId', requireAuth, getJobStatus);

module.exports = router;
