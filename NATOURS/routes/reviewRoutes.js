const express = require('express');
const reviewController = require('../controllers/reviewController');
const tokenValidator = require('../utils/tokenValidator');

//To have access to nested routes, we need to set mergeParams to true
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(tokenValidator.protect, reviewController.getAllReviews)
  .post(
    tokenValidator.protect,
    tokenValidator.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
