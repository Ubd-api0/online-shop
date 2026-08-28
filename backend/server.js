const express = require('express');
const ErrorHandler = require('./middleware/error');
const connectDatabase = require('./db/Database');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();

// ================= CONFIG =================
dotenv.config();

// ================= CORS ================= (must run before anything that can error)
// CLIENT_URL is a comma-separated allow-list; requests with no Origin
// (server-to-server, curl) and any origin are allowed by default so the
// same code works behind a Vercel rewrite proxy or a direct cross-site call.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
allowedOrigins.push('http://localhost:3030', 'http://localhost:3000');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // permissive fallback — tighten by removing this line once CLIENT_URL is set
      return callback(null, true);
    },
    credentials: true,
  })
);

// ================= MIDDLEWARES =================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ================= HEALTH =================
app.get('/', (req, res) => res.send('Server running 🚀'));
app.get('/test', (req, res) => res.send('Test working ✅'));

// ================= DB =================
// Connect lazily so serverless cold starts reuse a cached connection
// (see db/Database.js). Only the API routes need the DB.
app.use('/api', async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

// ================= ROUTES =================
app.use('/api/v2/user', require('./controller/user'));
app.use('/api/v2/shop', require('./controller/shop'));
app.use('/api/v2/category', require('./controller/category'));
app.use('/api/v2/product', require('./controller/product'));
app.use('/api/v2/event', require('./controller/event'));
app.use('/api/v2/coupon', require('./controller/coupounCode'));
app.use('/api/v2/payment', require('./controller/payment'));
app.use('/api/v2/order', require('./controller/order'));
app.use('/api/v2/message', require('./controller/message'));
app.use('/api/v2/conversation', require('./controller/conversation'));

// ================= ERROR HANDLER =================
app.use(ErrorHandler);

// ================= LOCAL SERVER =================
// On Vercel the app is imported by api/index.js and never listens.
if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  const server = app.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
  );

  process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down for UNCAUGHT EXCEPTION 💥');
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down for UNHANDLED REJECTION 💥');
    server.close(() => process.exit(1));
  });
}

module.exports = app;
