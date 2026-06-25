const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/set-goals', authenticateToken, metricsController.calculateAndSetGoals);
router.get('/get-metrics', authenticateToken, metricsController.getMetrics);

module.exports = router;