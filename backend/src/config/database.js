const mongoose = require('mongoose');

async function connectDatabase() {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error('MONGODB_URI is required to connect to MongoDB.');
  }

  await mongoose.connect(connectionString, {
    serverSelectionTimeoutMS: 5000,
  });

  console.info(`MongoDB connected: ${mongoose.connection.name}`);
}

module.exports = { connectDatabase };
