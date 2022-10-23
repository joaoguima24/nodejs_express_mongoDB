//Creating a class, and then we will use this class all over the place to pass our errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    //If we get a status code starting with a 4 (like 400 or 404) we know that status is a 'fail'
    //else we know that is an 'error' so we will implement that directlly in the constructor
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    //We will use a boolean to separate errors (created from us that should be passed to client)
    //And errors that the client doesnt't need to know about (like bugs)
    this.isOperational = true;

    //We don't wan't to capture the stack trace of the error in this class, so we use:
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
