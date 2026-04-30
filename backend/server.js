const express = require('express');
const ErrorHandler = require('./middleware/error');
const connectDatabase = require('./db/Database');
const app = express();

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// config
dotenv.config();

// connect db
connectDatabase();

// create server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// middlewares
app.use(express.json());
app.use(cookieParser());
// Enable CORS for all routes

const allowedOrigins = [
  'http://localhost:3030',
  'https://eb24-182-177-144-64.ngrok-free.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('Origin:', origin);

      if (!origin) {
        // allow Postman / mobile / server requests
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true); // 🔥 TEMP: allow all (for debugging)
      // return callback(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

/* app.use(
  cors({
    origin: [
      'http://localhost:3030',
      'https://eb24-182-177-144-64.ngrok-free.app',
    ],
    //credentials: true,
  })
); */
/* app.use(
  cors({
    origin: 'http://localhost:3030',
    credentials: true,
  })
); */

app.use('/', express.static('uploads'));

app.get('/test', (req, res) => {
  res.send('Hello World!');
});

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// why bodyparser?
// bodyparser is used to parse the data from the body of the request to the server (POST, PUT, DELETE, etc.)

// config
/* if (process.env.NODE_ENV !== 'PRODUCTION') {
  dot.config({
    path: 'config/.env',
  });
} else {
  dotenv.config();
} */

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// routes
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
app.use('/api/v2/withdraw', withdraw);

// end points
app.use('/api/v2/user', user);
app.use('/api/v2/conversation', conversation);
app.use('/api/v2/message', message);
app.use('/api/v2/order', order);
app.use('/api/v2/shop', shop);
app.use(
  '/api/v2/product',
  (req, res, next) => {
    next();
  },
  product
);
app.use('/api/v2/event', event);
app.use('/api/v2/coupon', coupon);
app.use('/api/v2/payment', payment);

// it'for errhendel
app.use(ErrorHandler);

// Handling Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the server for handling UNCAUGHT EXCEPTION! 💥`);
});

// unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log(`Shutting down the server for ${err.message}`);
  console.log(`shutting down the server for unhandle promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
