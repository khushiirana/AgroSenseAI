const mlClient = require('../services/mlClient');

exports.recommendCrop = async (req, res, next) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

    if (
      N === undefined || P === undefined || K === undefined ||
      temperature === undefined || humidity === undefined ||
      ph === undefined || rainfall === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required crop input features (N, P, K, temperature, humidity, ph, rainfall)'
      });
    }

    const mlResponse = await mlClient.predictCrop({
      N: Number(N),
      P: Number(P),
      K: Number(K),
      temperature: Number(temperature),
      humidity: Number(humidity),
      ph: Number(ph),
      rainfall: Number(rainfall)
    });

    return res.status(200).json(mlResponse);
  } catch (error) {
    next(error);
  }
};
