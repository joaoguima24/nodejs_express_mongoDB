const express = require('express');
const reviewController = require('../controllers/reviewController');
const tokenValidator = require('../utils/tokenValidator');

const router = express.Router();

router
  .route('/')
  .get(tokenValidator.protect, reviewController.getAllReviews)
  .post(
    tokenValidator.protect,
    tokenValidator.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
