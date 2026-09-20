const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decision.controller');

router.post('/evaluate', decisionController.evaluateDecision);

module.exports = router;
