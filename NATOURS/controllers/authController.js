const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pwEncryptor = require('../utils/pwEncryptor');
const tokenGenerator = require('../utils/tokenGenerator');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const sendEmail = require('../utils/mailer');
const catchAsync = require('../utils/catchAsync');

//we will use our catchAsync method to catch:

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    photo: req.body.photo,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  //TOKEN GENERATOR:

  //Call our tokenGenerator:
  const token = tokenGenerator.tokenGen(newUser.id);

  res.status(201).json({
    status: 'success',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //Check if the email and password exists
  if (!email || !password) {
    return next(new AppError('Email or Password Invalid :(', 400));
  }

  //Check if user exists
  let user = await User.findOne({ email: email });

  if (!user) {
    return next(new AppError('Email or password invalid :( ', 400));
  }

  //we have to use the "+..." because that field was not selected (to not appear in the find)
  user = await User.findOne({ email: email }).select('+password');

  //we will use our utils pwEncryptor with compareMethod (and pass the input pass and the db pass)
  const comparePassword = await pwEncryptor.comparePassword(
    password,
    user.password
  );

  //If the one of the two previous validators fail, we throw an error
  if (!user || !comparePassword) {
    return next(new AppError('Email or password invalid :( ', 400));
  }

  const token = tokenGenerator.tokenGen(user.id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //check if he posted the current password correctly
  if (
    !(await pwEncryptor.comparePassword(
      req.body.currentPassword,
      user.password
    ))
  ) {
    return next(new AppError('The current password is wrong', 400));
  }

  //if so , update the password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.confirmNewPassword;
  await user.save();
  //log user in
  const token = tokenGenerator.tokenGen(user.id);
  res.status(200).json({
    status: 'success',
    data: {
      token,
    },
  });
  next();
});

//F O R G O T  P A S S W O R D ! ! !
//sending an reset token to the client e-mail

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  //Generate a reset token

  //Creating a random password:
  const resetToken = crypto.randomBytes(32).toString('hex');

  //encrypting the token with crypto, hashing with sha256 and then converting to hex
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //giving an expiration date of 10'
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //Saving the user changes, but we have the validatorBeforeSave to false, otherwise
  //this will give us an error because we are not passing all the required fields
  await user.save({ validateBeforeSave: false });

  //send it to user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Reset here: ${resetURL} .If you didn't, just ignore this e-mail`;

  //If we get an error, we can't just throw it, we have to deal with the changes that we make in our db
  //So we will use a try catch here, to lead directly with the error
  try {
    await sendEmail({
      email: user.email,
      subject: 'You have only 10min to reset your password',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to e-mail',
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending e-mail, please try again', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token
  //We have to encrypt the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //then we will search for that token in our db
  //and check if the expiration time is valid
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('The token is invalid', 400));
  }

  //update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //log user and send a valid JWT
  const token = tokenGenerator.tokenGen(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
