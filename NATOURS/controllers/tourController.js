const { listen } = require('../app');
const Tour = require('../models/tourModel');

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

exports.getAllTours = async (req, res) => {
  try {
    //Create another object equal to req.query
    //so we can mannipulate it and don't mannipulate the req object
    const queryObj = { ...req.query };
    //Creating an array of fields that we want to exclude from the query params search
    //Because we wan't them to another search result
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    //excluding that fields from the queryObj
    excludeFields.forEach((elem) => delete queryObj[elem]);
    //passing a filter to our methor find(), with the query params object
    //adding an advanced filter to search >= / <= for example
    // the object query that we receive is for example: {duration: {gte:5}}
    //but the object that we need is: {duration: {$gte:5}}
    let queryStr = JSON.stringify(queryObj);
    //replacing with regex the : gte, gt , lte, lt:
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const query = Tour.find(JSON.parse(queryStr));
    const tours = await query;
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
