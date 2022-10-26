const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

//Routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

//Global middleware

// Security HTTP headers
app.use(helmet());

//Logger middleware
if (process.env.NODE_ENV === 'development') {
  //using the logger but only in the development env.
  app.use(morgan('dev'));
}

//Implementing the limiter global middleware, so you can only do X requests per hour
const limiter = rateLimit({
  //max requests per ip
  max: 100,
  //in time (ms)
  windowsMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later',
});
//passing the middleware to every request to our routes starting in '/api'
app.use('/api', limiter);

//Body parser middleware, reading data from the body (req.body)
//Setting the option limit of 10kb per request to protect our API from big amount of data atack
app.use(express.json({ limit: '10kb' }));

//Data Sanitization middleware against NoSQL query injection, this will remove all the ${} from the request
app.use(mongoSanitize());

//Data sanitization middleware against XSS, this will clean from malicious html
app.use(xssClean());

//Prevent parameter polution middleware (like when we pass more than 1 paremeter in the url), but sometimes we wan't it
//So we have to specify the whitelist
app.use(
  hpp({
    whitelist: [
      'duration',
      'average',
      'maxGroupSize',
      'difficulty',
      'price',
      'ratingsAverage',
    ],
  })
);

//serving static files (public folder open to a static endpoint)
app.use(express.static(`${__dirname}/public`));

//giving the tourRouter the main rout
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//We will implement an route to get everything else then our routers

//For this we will catch every route using *
//And then pass a middleware
app.all('*', (req, res, next) => {
  //Passing a value to the next(), it will skip every middleware and go directly through the err
  //We are using the AppError class that we create (message,statusCode)

  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

//Implementing a middleware to deal with all the errors:

app.use(errorController);

module.exports = app;
