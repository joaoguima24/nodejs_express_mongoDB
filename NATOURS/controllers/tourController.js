const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//GET ALL TOURS

//we are getting the tours from the json file with (fs)
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     res.status(400).json({ message: 'Name and price are mandatory params.' });
//     return;
//   }
//   next();
// };

// exports.getAllTours = (req, res) => {
//   res.status(200).json({
//     //we should pass the status and the number of results in the json data
//     status: 'success',
//     results: tours.length,
//     //then we give the data
//     data: {
//       //because the key and the value has the same name, we can just give the value
//       tours,
//     },
//   });
// };

// //GET A SINGLE TOUR BY ID
// exports.getTourById = (req, res) => {
//   const idToSearch = Number(req.params.id);
//   const tour = tours.find((element) => element.id === idToSearch);
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// };

// // CREATE A TOUR

// exports.createTour = (req, res) => {
//   //giving a new id (just because we are faking the DB)
//   const newId = tours[tours.length - 1].id + 1;
//   //assign the id to the request body
//   // eslint-disable-next-line prefer-object-spread
//   const newTour = Object.assign({ id: newId }, req.body);
//   // push the new tour to the fake db
//   tours.push(newTour);
//   //overwrite the fake db

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     // eslint-disable-next-line no-unused-vars
//     (err) => {
//       res.status(200).json({
//         status: 'success',
//         data: newTour,
//       });
//     }
//   );
// };

//we only need the (next), because we are using the catchAsync
exports.createTour = catchAsync(async (req, res, next) => {
  //we are saving in the db with method create, other way:
  //const newTour = new Tour(req.body);
  //newTour.save()
  const newTour = await Tour.create(req.body);
  //if it's valid:
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

//Adding a middleware
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//we will let this function with try.catch just for example
exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getTourByID = catchAsync(async (req, res, next) => {
  //we use the virtual property that we set in the tourModel
  const tour = await Tour.findById(req.params.id).populate('reviews');
  if (!tour) {
    return next(new AppError('No tour find with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    //this will run the validators from tourModel like: required, minlength...
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour find with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.deleteByID = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour find with that ID', 404));
  }
  res.status(204).json({
    status: 'Deleted with success',
  });
});

//Creating an aggregation pipeline to get stats of the tours
exports.getTourStats = catchAsync(async (req, res, next) => {
  //Using the mongoose aggregate method
  const stats = await Tour.aggregate([
    //We can use as many match as we want to make our query
    {
      //find every Tour with ratingAverage greater then 4.5
      $match: { ratingsAverage: { $gte: 3 } },
    },
    //{
    //find every tour with difficulty !== "easy"
    //$match: { difficulty: { $ne: 'easy' } },
    //},
    {
      //Grouping our pipeline by:
      $group: {
        //Specifieing the _id to null to aggroup everything
        //_id: null, Or we can group by field like (don't forget the "$"):
        _id: '$difficulty',
        //Sum all the data that are aggrouped (we add 1 for each Tour)
        numOfTours: { $sum: 1 },
        //Sum all the ratings (ratingQuantity property of every tour)
        numOfRatings: { $sum: '$ratingsQuantity' },
        //Calculating the average Rating (we have to use "$"before the name of the field)
        avgRating: { $avg: '$ratingsAverage' },
        //Calculating the average price
        avgPrice: { $avg: '$price' },
        //Calculating the max price
        maxPrice: { $max: '$price' },
        //calculating the min price
        minPrice: { $min: '$price' },
      },
    },
    //We can now add more methods like sort for example, but we have to use the new variables
    //like numOfTours/numOfRatings ...
    {
      //sorting by avgPrice (1 to ascending)
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

//Creating a pipeline to count how many tours we have per month
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  //getting the year from the url params (*1 to turn that in a Number)
  const year = req.params.year * 1;
  //We got an array of dates in every Tour
  const plan = await Tour.aggregate([
    {
      //Unwind will convert each date inside of the dates Array, to a separated tour
      $unwind: '$startDates',
    },
    //Now we want to match every tour that equal to the year
    {
      $match: {
        //So we are going to search for startDates > first day of the Year and < then the last day of the Year
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    //Now we have to group our results by month
    {
      $group: {
        //Using the pipeline operator $month to group by month
        _id: { $month: '$startDates' },
        //Adding 1 to every Group of months
        numOfTours: { $sum: 1 },
        //Creating an array with the name of the tours per month, with the pipeline operator $push
        tours: { $push: '$name' },
      },
    },
    {
      //Labeling the Groups with the key:month / value:$_id
      $addFields: { month: '$_id' },
    },
    {
      //We can hide or show a field using $project (0 to hide, 1 to show)
      $project: { _id: 0 },
    },
    {
      //Sorting the groups in the descending order
      $sort: { numOfTours: -1 },
    },
  ]);

  //Sending our response
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

//Geospatial search:
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  //Calculating the radius of the search, so we will divide the distance to look by diferent values
  const radius = unit === 'km' ? distance / 6378.1 : distance / 3963.2;

  //The query, using $geoWithin, we have to pass a object $centerSphere that accepts an Array, with another Array
  //that contains longitude and latitude (by this order), and the radius distance to look

  //IMPORTANT: we need to create an index to startLocation (in tourModel)
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

//Calculating the distance from a point to the tours
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const multiplier = unit === 'km' ? 0.001 : 0.000621371;

  //We will use an aggregation pipeline with $geoNear (that has to be the first), we need that the locations we are
  //searching for, be indexed (so we have startLocation as geo index in tourModel)
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        //Near and distance field are mandatory, and we have to pass the json with type and the coordinates
        //we multiply by 1 to get a number
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        //The result of the pipeline comes in meters, so we will multiply for 0.001 (=== /1000)
        distanceMultiplier: multiplier,
      },
    },
    //We only wan't to see the distance and the name of the Tour
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      distances,
    },
  });
});
