import mongoose from 'mongoose';

let initialized = false;

export const connect = async () => {
  mongoose.set('strictQuery', true);

  if (initialized) {
    console.log('MongoDB already connected');
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'next-estate',
    });
    initialized = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB connection error:', error);
  }
};