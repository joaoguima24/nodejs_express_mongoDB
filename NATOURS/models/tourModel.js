//Creating a schema
//Importing mongoose framework
const mongoose = require('mongoose');

//creating our DTO (we can pass object and the object properties like we did here)
const tourSchema = new mongoose.Schema(
  //adding the object (dto)
  {
    name: {
      type: String,
      required: [true, 'The name of the tour is mandatory.'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      requires: [true, 'Duration is mandatory'],
    },
    difficulty: {
      type: String,
      requires: [true, 'Difficulty is mandatory'],
    },
    maxGroupSize: {
      type: Number,
      requires: [true, 'GroupSize is mandatory'],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    rating: Number,
    price: {
      type: Number,
      required: [true, 'The price of the tour is mandatory'],
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      required: [true, 'The summary of the tour is mandatory'],
      trim: true,
    },
    description: {
      type: String,
      requires: [true, 'Description is mandatory'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'The image of the tour is mandatory'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  //Adding the object properties
  {
    //Turning the virtual properties of our object to true
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Virtual Properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
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
