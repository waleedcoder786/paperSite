import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

// Build time par crash hone se bachne ke liye condition
if (!MONGO_URI && process.env.NODE_ENV === 'production') {
  console.warn("Warning: MONGO_URI is not defined in production environment.");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing. Please add it to your environment variables.");
    }

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}