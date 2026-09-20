const mlClient = require('../services/mlClient');
const RecommendationHistory = require('../models/RecommendationHistory');
const { getStatus } = require('../config/db');

// In-memory fallback history buffer
const inMemoryRecommendationHistory = [];

exports.evaluateDecision = async (req, res, next) => {
  try {
    const mlResponse = await mlClient.evaluateDecision(req.body);

    if (mlResponse.success && mlResponse.data) {
      const d = mlResponse.data;
      const record = {
        _id: new Date().getTime().toString() + '-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
        farmer_inputs: d.farmer_inputs,
        recommended_crop: d.final_recommended_crop,
        final_suitability_score: d.final_suitability_score,
        human_readable_explanation: d.human_readable_explanation,
        ranked_crops: d.ranked_crops,
        weather_summary: {
          location: d.weather_analysis?.location,
          temperature: d.weather_analysis?.temperature,
          humidity: d.weather_analysis?.humidity,
          rainfall: d.weather_analysis?.rainfall,
          weather: d.weather_analysis?.weather
        },
        irrigation_need: d.irrigation_analysis?.predicted_irrigation_need
      };

      if (getStatus().connected) {
        RecommendationHistory.create(record).catch(err => console.warn('[DB Error]', err.message));
      } else {
        inMemoryRecommendationHistory.unshift(record);
        if (inMemoryRecommendationHistory.length > 50) inMemoryRecommendationHistory.pop();
      }
    }

    return res.status(200).json(mlResponse);
  } catch (error) {
    next(error);
  }
};

exports.getInMemoryHistory = () => inMemoryRecommendationHistory;

exports.deleteInMemoryRecommendation = (id) => {
  const idx = inMemoryRecommendationHistory.findIndex(r => r._id === id || r.id === id);
  if (idx !== -1) {
    inMemoryRecommendationHistory.splice(idx, 1);
    return true;
  }
  return false;
};
