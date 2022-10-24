const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const User = require('../models/userModel');

//We will use this function as middleware to check if the token is valid (authentication validation)
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  //Check if the request had authorization header (Bearer)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(new AppError('You have to login first', 401));
  }

  //Now we have to assure that the token was not modified

  //we will use the util lyb to promisify this method jwt.verify()
  //that method receives the token and our secret

  const tokenDecoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  //check if the user still exist

  const freshUser = await User.findById(tokenDecoded.id);
  if (!freshUser)
    next(
      new AppError(
        'Something went wrong with your user Id, pleas login again',
        401
      )
    );

  //check if the password was not changed after the token was emmited
  if (freshUser.passwordChangedAt) {
    //Get time in ms
    const changedTimeStamp = parseInt(
      freshUser.passwordChangedAt.getTime() / 1000,
      10
    );
    //We had access to expiration date of the token with the iat property
    if (tokenDecoded.iat < changedTimeStamp) {
      return next(
        new AppError(
          'Something wrong with your password, please login again',
          401
        )
      );
    }
  }

  //we pass the freshUser to the req so from now, we can use the user in the next middleware
  req.user = freshUser;

  next();
});

//we need to create a wraper function to be able to receive arguments in a middleware
//closers

exports.restrictTo = (...roles) =>
  //roles is an array of roles like ['admin', 'lead-guide']
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  });
