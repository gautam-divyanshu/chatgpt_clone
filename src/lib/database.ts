import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatgpt-clone';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface GlobalMongoDB {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

declare global {
  var mongodb: GlobalMongoDB | undefined;
}

let cached = global.mongodb;

if (!cached) {
  cached = global.mongodb = { mongoose: { conn: null, promise: null } };
}

async function connectDB() {
  if (cached!.mongoose.conn) {
    return cached!.mongoose.conn;
  }

  if (!cached!.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.mongoose.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached!.mongoose.conn = await cached!.mongoose.promise;
  } catch (e) {
    cached!.mongoose.promise = null;
    throw e;
  }

  return cached!.mongoose.conn;
}

export default connectDB;
