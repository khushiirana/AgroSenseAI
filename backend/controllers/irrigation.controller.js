const mlClient = require('../services/mlClient');

exports.recommendIrrigation = async (req, res, next) => {
  try {
    const mlResponse = await mlClient.predictIrrigation(req.body);
    return res.status(200).json(mlResponse);
  } catch (error) {
    next(error);
  }
};
