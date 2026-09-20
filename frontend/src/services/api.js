import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
});

export const checkSystemHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const evaluateDecision = async (payload) => {
  const res = await api.post('/decision/evaluate', payload);
  return res.data;
};

export const getLiveWeather = async (params) => {
  const res = await api.get('/weather/current', { params });
  return res.data;
};

export const detectDisease = async (formData) => {
  const res = await api.post('/disease/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getRecommendationHistory = async () => {
  const res = await api.get('/history/recommendations');
  return res.data;
};

export const deleteRecommendationHistory = async (id) => {
  const res = await api.delete(`/history/recommendations/${id}`);
  return res.data;
};

export const getDiseaseHistory = async () => {
  const res = await api.get('/history/diseases');
  return res.data;
};

export const deleteDiseaseHistory = async (id) => {
  const res = await api.delete(`/history/diseases/${id}`);
  return res.data;
};

export default api;
