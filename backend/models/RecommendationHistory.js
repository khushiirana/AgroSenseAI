const mongoose = require('mongoose');

const RecommendationHistorySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  farmer_inputs: {
    N: Number,
    P: Number,
    K: Number,
    ph: Number,
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    soil_moisture: Number,
    soil_type: String
  },
  recommended_crop: {
    type: String,
    required: true
  },
  final_suitability_score: {
    type: Number,
    required: true
  },
  human_readable_explanation: {
    type: String,
    required: true
  },
  ranked_crops: [{
    crop: String,
    crop_probability: Number,
    weather_score: Number,
    irrigation_score: Number,
    final_score: Number
  }],
  weather_summary: {
    location: String,
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    weather: String
  },
  irrigation_need: String
});

module.exports = mongoose.model('RecommendationHistory', RecommendationHistorySchema);
