const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

//Routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//Global middleware
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

app.use(express.json());

//serving static files (public folder open to a static endpoint)
app.use(express.static(`${__dirname}/public`));

//giving the tourRouter the main rout
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
