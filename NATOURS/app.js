const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

//Routes
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//middleware
if (process.env.NODE_ENV === 'development') {
  //using the logger but only in the development env.
  app.use(morgan('dev'));
}
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
