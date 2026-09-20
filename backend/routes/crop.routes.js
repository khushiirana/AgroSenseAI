const express = require('express');
const router = express.Router();
const cropController = require('../controllers/crop.controller');

router.post('/recommend', cropController.recommendCrop);

module.exports = router;
