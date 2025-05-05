// const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const sanitizeHtml = require('sanitize-html');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./Utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global Middlewares

// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP Headers
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://cdn.jsdelivr.net/',
  'https://*.stripe.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
  'https://cdn.jsdelivr.net/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'ws://127.0.0.1:1234',
  'ws://localhost:1234',
  'https://checkout.stripe.com',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", 'https://*.stripe.com'],
    },
  }),
);

// Turn Logger In Development Mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limiting Request From The Same IP
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: 'To many Requests form this IP. Please try again in an hour!',
});
app.use('/api', limiter);

// Body Parser, Reading Data From Body Into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// Data Sanitization Against NoSql Query Injection as email:{$gt:""}= always
app.use(mongoSanitize());

// Data Sanitization Against XSS (Cross-Site-Scripting)
app.use((req, res, next) => {
  if (req.body) {
    // Sanitize each field in req.body
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {},
        });
      }
    }
  }
  next();
});

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  // console.log(req.headers); //to show header to make authorization
  next();
});

// 3) Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Implement Global Error Middleware
app.use(globalErrorHandler);

module.exports = app;
