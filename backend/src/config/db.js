import mongoose from 'mongoose';
import dns from 'dns';

/**
 * Connect to MongoDB with DNS fallback and custom timeout settings.
 */
export const connectDB = async () => {
  try {
    // Set public DNS fallback to resolve MongoDB Atlas SRV connection strings on Windows
    dns.setServers(['8.8.8.8', '1.1.1.1']);

    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
