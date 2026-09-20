const mlClient = require('../services/mlClient');

exports.getWeather = async (req, res, next) => {
  try {
    const { lat, lon, city } = req.query;
    const weatherResponse = await mlClient.getWeather({ lat, lon, city });
    return res.status(200).json(weatherResponse);
  } catch (error) {
    next(error);
  }
};
