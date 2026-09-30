import mongoose from "mongoose";

// Cache the connection across serverless invocations / dev hot-reloads.
// Without this every request/reload opens a new pool and exhausts Atlas
// connection limits.
const globalForMongoose = globalThis;
let cached = globalForMongoose._mongoose;
if (!cached) {
  cached = globalForMongoose._mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.DB_URL) {
      throw new Error("DB_URL is not set");
    }
    cached.promise = mongoose
      .connect(process.env.DB_URL, { serverSelectionTimeoutMS: 10000 })
      .then((m) => {
        console.log(`mongod connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
