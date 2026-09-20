const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');

router.get('/recommendations', historyController.getRecommendationHistory);
router.get('/diseases', historyController.getDiseaseHistory);

router.delete('/recommendations/:id', historyController.deleteRecommendationHistory);
router.delete('/diseases/:id', historyController.deleteDiseaseHistory);

module.exports = router;
