module.exports = (err, req, res, next) => {
  //First we get the error status, and pass a default value if there is not a status error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
