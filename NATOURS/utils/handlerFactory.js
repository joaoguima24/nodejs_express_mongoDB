const catchAsync = require('./catchAsync');
const AppError = require('./appError');

//Working with closers, the inner function will have acess to the variables of the outer function that call's him
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No doc find with that ID', 404));
    }
    res.status(204).json({
      status: 'Deleted with success',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //this will run the validators from tourModel like: required, minlength...
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document find with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = await Model.findById(req.params.id);
    //Now we have the possibility to populate our query, so we have to test it:
    if (popOptions) query = query.populate('reviews');

    if (!query) {
      return next(new AppError('No document find with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: query,
      },
    });
  });
