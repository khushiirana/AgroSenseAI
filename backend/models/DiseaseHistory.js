const mongoose = require('mongoose');

const DiseaseHistorySchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  predicted_disease: {
    type: String,
    required: true
  },
  display_name: String,
  confidence: {
    type: Number,
    required: true
  },
  top_3: [{
    rank: Number,
    disease: String,
    confidence: Number
  }],
  health_guidance: String,
  model_source: String
});

module.exports = mongoose.model('DiseaseHistory', DiseaseHistorySchema);
