const express = require('express');
const router = express.Router();
const multer = require('multer');
const diseaseController = require('../controllers/disease.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/detect', upload.single('image'), diseaseController.detectDisease);

module.exports = router;
