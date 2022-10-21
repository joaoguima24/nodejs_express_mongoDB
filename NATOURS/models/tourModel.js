//Creating a schema
//Importing mongoose framework
const mongoose = require('mongoose');

//creating our DTO
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The name of the tour is mandatory.'],
    unique: true,
  },
  rating: Number,
  price: {
    type: Number,
    required: [true, 'The price of the tour is mandatory'],
  },
});

//Creating our model
const Tour = mongoose.model('Tour', tourSchema);

// const testTour = new Tour({
//   name: 'Testing',
//   rating: 4.5,
//   price: 10,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

module.exports = Tour;
