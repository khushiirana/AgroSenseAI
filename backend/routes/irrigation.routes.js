const express = require('express');
const router = express.Router();
const irrigationController = require('../controllers/irrigation.controller');

router.post('/recommend', irrigationController.recommendIrrigation);

module.exports = router;
