const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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

exports.createTour = async (req, res) => {
  try {
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
  } catch (err) {
    //if it's not valid:
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

//Adding a middleware
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

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

exports.getTourByID = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //this will run the validators from tourModel like: required, minlength...
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.deleteByID = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'Deleted with success',
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

//Creating an aggregation pipeline to get stats of the tours
exports.getTourStats = async (req, res) => {
  try {
    //Using the mongoose aggregate method
    const stats = await Tour.aggregate([
      //We can use as many match as we want to make our query
      {
        //find every Tour with ratingAverage greater then 4.5
        $match: { ratingsAverage: { $gte: 3 } },
      },
      {
        //find every tour with difficulty !== "easy"
        $match: { difficulty: { $ne: 'easy' } },
      },
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
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

//Creating a pipeline to count how many tours we have per month
exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};
