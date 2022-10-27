const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('../utils/handlerFactory');

//this method will loop through the object req.body and saves every field === allowedFields Array,
const filterObj = (obj, ...allowedFields) => {
  const filteredBody = {};

  Object.keys(obj).forEach((elm) => {
    if (allowedFields.includes(elm)) {
      filteredBody[elm] = obj[elm];
    }
  });
  return filteredBody;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

//implementing this middleware before the getOne factory handler, because we don't have the user id in the req.params
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//using the factory handler to get user by id
exports.getUser = handlerFactory.getOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  // user cannot update the password here, so check that
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('You can not upload the password here', 400));
  }

  //Filter the body, because we don't want to give the possibility to the user to change the field role (for example)
  const filteredBody = filterObj(req.body, 'name', 'email', 'photo');
  //getting the user (we have access to him by the request, because we pass through the token validation)
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

//Delete user, we don't wan't to delete the user, but instead, to update the account to active: false
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
  });
});
