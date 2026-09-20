const RecommendationHistory = require('../models/RecommendationHistory');
const DiseaseHistory = require('../models/DiseaseHistory');
const { getStatus } = require('../config/db');
const { getInMemoryHistory: getDecisions, deleteInMemoryRecommendation } = require('./decision.controller');
const { getInMemoryHistory: getDiseases, deleteInMemoryDisease } = require('./disease.controller');

exports.getRecommendationHistory = async (req, res, next) => {
  try {
    if (getStatus().connected) {
      const history = await RecommendationHistory.find().sort({ timestamp: -1 }).limit(20);
      return res.status(200).json({ success: true, count: history.length, data: history });
    } else {
      const inMem = getDecisions();
      return res.status(200).json({ success: true, count: inMem.length, data: inMem, is_fallback: true });
    }
  } catch (error) {
    next(error);
  }
};

exports.getDiseaseHistory = async (req, res, next) => {
  try {
    if (getStatus().connected) {
      const history = await DiseaseHistory.find().sort({ timestamp: -1 }).limit(20);
      return res.status(200).json({ success: true, count: history.length, data: history });
    } else {
      const inMem = getDiseases();
      return res.status(200).json({ success: true, count: inMem.length, data: inMem, is_fallback: true });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteRecommendationHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (getStatus().connected) {
      await RecommendationHistory.findByIdAndDelete(id);
    } else {
      deleteInMemoryRecommendation(id);
    }
    return res.status(200).json({ success: true, message: 'Recommendation record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteDiseaseHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (getStatus().connected) {
      await DiseaseHistory.findByIdAndDelete(id);
    } else {
      deleteInMemoryDisease(id);
    }
    return res.status(200).json({ success: true, message: 'Disease record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
