require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getStatus } = require('./config/db');
const mlClient = require('./services/mlClient');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const cropRoutes = require('./routes/crop.routes');
const irrigationRoutes = require('./routes/irrigation.routes');
const diseaseRoutes = require('./routes/disease.routes');
const decisionRoutes = require('./routes/decision.routes');
const weatherRoutes = require('./routes/weather.routes');
const historyRoutes = require('./routes/history.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (with graceful fallback)
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const mlStatus = await mlClient.checkHealth();
  const dbStatus = getStatus();

  res.status(200).json({
    status: 'healthy',
    backend: 'Node.js + Express',
    port: PORT,
    database: dbStatus,
    ml_service: mlStatus
  });
});

// API Routes
app.use('/api/crop', cropRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/decision', decisionRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/history', historyRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` AgroSense AI Backend Gateway running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
