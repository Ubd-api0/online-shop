const express = require('express');
const ErrorHandler = require('./middleware/error');
const connectDatabase = require('./db/Database');

const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();

// ================= CONFIG =================
dotenv.config();

// ================= DB =================
connectDatabase();

// ================= MIDDLEWARES =================

// ✅ VERY IMPORTANT (fix req.body undefined)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());

// ✅ CORS (production + local)
const allowedOrigins = [
  'http://localhost:3030',
  'https://eb24-182-177-144-64.ngrok-free.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // allow all (you can restrict later)
      return callback(null, true);
    },
    credentials: true,
  })
);

// ================= ROUTES =================

app.get('/', (req, res) => {
  res.send('Server running 🚀');
});

app.get('/test', (req, res) => {
  res.send('Test working ✅');
});

// controllers
const user = require('./controller/user');
const shop = require('./controller/shop');
const product = require('./controller/product');
const event = require('./controller/event');
const coupon = require('./controller/coupounCode');
const payment = require('./controller/payment');
const order = require('./controller/order');
const message = require('./controller/message');
const conversation = require('./controller/conversation');
const withdraw = require('./controller/withdraw');

// endpoints
app.use('/api/v2/user', user);
app.use('/api/v2/shop', shop);
app.use('/api/v2/product', product);
app.use('/api/v2/event', event);
app.use('/api/v2/coupon', coupon);
app.use('/api/v2/payment', payment);
app.use('/api/v2/order', order);
app.use('/api/v2/message', message);
app.use('/api/v2/conversation', conversation);
app.use('/api/v2/withdraw', withdraw);

// ================= ERROR HANDLER =================
app.use(ErrorHandler);

// ================= SERVER =================
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ================= GLOBAL ERRORS =================
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down for UNCAUGHT EXCEPTION 💥');
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down for UNHANDLED REJECTION 💥');

  server.close(() => {
    process.exit(1);
  });
});
