const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handDuplicatedFieldsDb = (err) => {
  const message = `The name of the tour already exists, please choose another`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //we will iterate through the object errors, and get the message from it
  const errors = Object.values(err.errors).map((el) => el.message);
  //we will pass the map and join every error separated by ". " (with join())
  const message = `Invalid parameter. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorProd = (err, res) => {
  //Operational errors, we have to send it to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown errors, we don't want the client to receive it,
    //so we will log the error but not send it to client
    console.log('Error', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  //First we get the error status, and pass a default value if there is not a status error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //we have errors for example from the db that is not created by us like (CastError, )
    //, so the user will get our
    //'something went wrong' message, but we should instead pass information to the user, like:

    //The id is wrong ... , so we will create handlers for that errors

    let error = { ...err };
    //If we search for an Invalid ID
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    //If we get duplicated values (like name of tour for example)
    if (error.code === 11000) error = handDuplicatedFieldsDb(error);
    //if we pass invalid parameters
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};
