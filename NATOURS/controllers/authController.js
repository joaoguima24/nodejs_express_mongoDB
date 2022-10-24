const jwt = require('jsonwebtoken');
const pwEncryptor = require('../utils/pwEncryptor');
const tokenGenerator = require('../utils/tokenGenerator');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
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
