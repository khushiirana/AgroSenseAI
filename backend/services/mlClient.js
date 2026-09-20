const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000 // 30 seconds
});

module.exports = {
  checkHealth: async () => {
    try {
      const response = await mlClient.get('/health');
      return response.data;
    } catch (err) {
      return { status: 'down', error: err.message };
    }
  },

  predictCrop: async (soilData) => {
    const response = await mlClient.post('/predict/crop', soilData);
    return response.data;
  },

  predictIrrigation: async (irrigationData) => {
    const response = await mlClient.post('/predict/irrigation', irrigationData);
    return response.data;
  },

  predictDisease: async (formData, headers) => {
    const response = await mlClient.post('/predict/disease', formData, {
      headers: {
        ...headers
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    return response.data;
  },

  evaluateDecision: async (decisionData) => {
    const response = await mlClient.post('/decision', decisionData);
    return response.data;
  },

  getWeather: async (params) => {
    const response = await mlClient.get('/weather', { params });
    return response.data;
  }
};
