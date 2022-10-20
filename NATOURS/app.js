const express = require('express');
const morgan = require('morgan');

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

module.exports = app;
