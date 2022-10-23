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
      minlength: [8, 'A tour mus have at least 8 characters'],
    },
    duration: {
      type: Number,
      requires: [true, 'Duration is mandatory'],
    },
    difficulty: {
      type: String,
      requires: [true, 'Difficulty is mandatory'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'A tour can only have one of this three values: easy,medium,difficult',
      },
    },
    maxGroupSize: {
      type: Number,
      requires: [true, 'GroupSize is mandatory'],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, 'A tour must have a minimumm value above 1'],
      max: [5, 'A tour must have a max value below 5'],
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
      //this validator only works when we create a new document
      validate: {
        validator: function (val) {
          return val >= this.price;
        },
        message: 'Discount must be lower than price',
      },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
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

//QUERY MIDDLEWARE / HOOK (this. refers to the query itself)

//Now we have secret tours, and before each find() we want to hide secretTours

//we use tourSchema.pre (pre middleware) and then pass a function with method next
//tourSchema.pre('find', function (next) {

//But we want to hide the secretTour in the findById, we can copy paste the methodBefore
//or we can use a regEx like this (all the methods started by find):
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  //using the Date.now in pre-hook to calculate the time tooked by this method in the post hook
  this.start = Date.now();
  next();
});

//Using the post hook to calculate the time that the query took
tourSchema.post(/^find/, function (docs, next) {
  console.log(`This query took: ${Date.now() - this.start}ms`);
  next();
});

//AGGREGATION MIDDLEWARE (.this refers to the aggregation itself)

tourSchema.pre('aggregate', function (next) {
  //We will hide the secret tours in the aggregation pipeline (getStats())
  //this.pipeline will refer to the Array, so we have to add another $match
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
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
