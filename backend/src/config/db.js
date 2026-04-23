import mongoose from 'mongoose';

let connectionPromise;

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is required');
    }

    connectionPromise = mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB || 'bku-smart-parking',
    });
  }

  await connectionPromise;
  return mongoose.connection;
};