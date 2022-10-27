const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review is mandatory'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    //Turning the virtual properties of our object to true
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//POPULATING DATA (Users and Tour)

//using a pre middleware
reviewSchema.pre(/^find/, function (next) {
  //if we want to select everything:
  //this.populate('tour').populate('user');

  //selecting only the field name of tours and users name and photo:
  this.populate({
    path: 'tour',
    select: 'name',
  }).populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//Creating a Static method to calculate the averageRating for the tour wich the current review was aggreggated:
//this is a static function because we need to call the aggregate on the module

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //aggregation pipeline it will return an []:
  const stats = await this.aggregate([
    {
      //find Id that match tourId with in reviews collection
      $match: { tour: tourId },
    },
    {
      //group the $match by tour Id, add 1 val to the nRating for each Id, and calc the averageRating
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  //Persist our data to Db
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//Creating a compound index to only allow the user to do 1 review for 1 tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//Using this middleware to call the calcAverageRatings() on every create review
//will use this.constructor because this refers to the query
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

//Using the pre and post middleware to calcAverageRating on every update and delete review

//First we will use the pre middleware to catch the review (in the post middleware we get the query already executed)
//and pass it to the post middleware where we already have the reviews updated
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //we save a new variable to the query to pass information to the post middleware
  this.passingReviewInfoToNext = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.passingReviewInfoToNext.constructor.calcAverageRatings(
    this.passingReviewInfoToNext.tour._id
  );
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
