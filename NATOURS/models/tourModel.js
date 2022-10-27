//Creating a schema
//Importing mongoose framework
const mongoose = require('mongoose');
const User = require('./userModel');

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

    startLocation: {
      //GeoJson, we can have different types of geo location (like point, lines etc...)
      type: {
        type: String,
        //In this way we use as default a point and with the enum we restrict it to only a point
        //The user can no longer pass other type (like a line)
        default: 'Point',
        enum: ['Point'],
      },
      //In the coordinates we should receive an a array of numbers
      coordinates: [Number],
      address: String,
      description: String,
    },

    //Creating an embedded document for the locations
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    //Adding User guides to our tour!!
    //Embeded using a pre-save middlleware
    guides: Array,

    //Or Referencing, passing the id:
    //Next we have to populate the query (just adding .populate(guides) in the query)
    // guide: [
    //   {
    //     //Refering the data we wan't to keep (Id in this case)
    //     type: mongoose.Schema.ObjectId,
    //     //From wich document.
    //     ref: 'User',
    //   }
    // ]

    //to private tours
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

//Creating compound indexes to price field in ascending order (1), and to ratingsAverage in descending(-1)
//it will order the prices and the db now don't have to run all the documents to query for price
tourSchema.index({ price: 1, ratingsAverage: -1 });

//Virtual Properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual populate properties from another document (reviews),
//then we have to call the method populate in the query (like we did in getTourById)
tourSchema.virtual('reviews', {
  ref: 'Review',
  //The field name(tour) that we are going to compare in the foreign document(reviews)
  foreignField: 'tour',
  //The field name(_id) that we are going to compare with the foreign field
  localField: '_id',
});

//QUERY MIDDLEWARE / HOOK (this. refers to the query itself)

//EMBEDDING DATA !!

//Document middleware for ADDING a User to our document
tourSchema.pre('save', async function (next) {
  //we use the guides array(of User id's) in the req.body params, and will add the User to our document
  const guidesPromisses = this.guides.map(
    async (id) => await User.findById(id)
  );
  this.guides = await Promise.all(guidesPromisses);
  next();
});

//POPULATING DATA !!

// //Adding a pre query Find middleware
// tourSchema.pre(/^find/, function (next) {
//   //populate the query with the field 'guides', but we don't wan't the field -__v ...
//   this.populate({
//     path: 'guides',
//     select: '-__v -passwordChangedAt',
//   });
//   next();
// });

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
