const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/generate-plan', authenticateToken, mealController.generatePlan);
router.post('/analyze-food', authenticateToken, mealController.analyzeFood);
router.post('/log-meal', authenticateToken, mealController.logMeal);
router.get('/weekly-progress', authenticateToken, mealController.getWeeklyProgress);

module.exports = router;