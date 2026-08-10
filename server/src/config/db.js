const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_career_copilot';
  try {
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${connStr}. Application will operate in memory/mock persistence mode:`, error.message);
  }
};

module.exports = connectDB;
