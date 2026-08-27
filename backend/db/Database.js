const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Cache the connection across serverless invocations (Vercel reuses the
// module scope between warm calls). Without this every request opens a new
// pool and exhausts Atlas connection limits.
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

const connectDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.DB_URL) {
      throw new Error('DB_URL is not set');
    }
    cached.promise = mongoose
      .connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        console.log(`mongod connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        // reset so the next request retries instead of reusing a rejected promise
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDatabase;
