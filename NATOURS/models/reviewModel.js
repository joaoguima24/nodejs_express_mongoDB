const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
