const FormData = require('form-data');
const mlClient = require('../services/mlClient');
const DiseaseHistory = require('../models/DiseaseHistory');
const { getStatus } = require('../config/db');

// In-memory fallback history buffer
const inMemoryDiseaseHistory = [];

exports.detectDisease = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a leaf image file (JPEG/PNG).'
      });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const mlResponse = await mlClient.predictDisease(form, form.getHeaders());

    if (mlResponse.success && mlResponse.data) {
      const record = {
        _id: new Date().getTime().toString() + '-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
        predicted_disease: mlResponse.data.predicted_disease,
        display_name: mlResponse.data.display_name,
        confidence: mlResponse.data.confidence,
        top_3: mlResponse.data.top_3,
        health_guidance: mlResponse.data.health_guidance,
        model_source: mlResponse.data.model_source
      };

      if (getStatus().connected) {
        DiseaseHistory.create(record).catch(err => console.warn('[DB Error]', err.message));
      } else {
        inMemoryDiseaseHistory.unshift(record);
        if (inMemoryDiseaseHistory.length > 50) inMemoryDiseaseHistory.pop();
      }
    }

    return res.status(200).json(mlResponse);
  } catch (error) {
    next(error);
  }
};

exports.getInMemoryHistory = () => inMemoryDiseaseHistory;

exports.deleteInMemoryDisease = (id) => {
  const idx = inMemoryDiseaseHistory.findIndex(r => r._id === id || r.id === id);
  if (idx !== -1) {
    inMemoryDiseaseHistory.splice(idx, 1);
    return true;
  }
  return false;
};
