const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrosense_ai';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Notice] Database connection failed (${error.message}). App running with in-memory fallback.`);
  }
};

const getStatus = () => ({
  connected: isConnected,
  database: isConnected ? mongoose.connection.name : 'in-memory-fallback'
});

module.exports = { connectDB, getStatus };
