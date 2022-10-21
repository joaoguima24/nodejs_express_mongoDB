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
  const tours = await Tour.find();
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
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
