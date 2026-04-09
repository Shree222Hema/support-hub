import mongoose from 'mongoose';

const rawUri = process.env.MONGODB_URI || '';
const MONGODB_URI = (rawUri.trim() && rawUri.trim() !== 'your_mongodb_connection_string') 
  ? rawUri.trim() 
  : 'mongodb://127.0.0.1:27017/support_hub_kanban';

console.log('Connecting to MongoDB with URI:', MONGODB_URI.substring(0, 20) + '...');

if (!MONGODB_URI || MONGODB_URI === '') {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      return mongooseInstance;
    }).catch((err) => {
      console.error('MongoDB connection error:', err.message);
      cached.promise = null; // Clear cached promise on failure
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Ensure null if await fails
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;
