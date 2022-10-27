const express = require('express');
const reviewController = require('../controllers/reviewController');
const tokenValidator = require('../utils/tokenValidator');

//To have access to nested routes, we need to set mergeParams to true
const router = express.Router({ mergeParams: true });

router.use(tokenValidator.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(tokenValidator.restrictTo('user'), reviewController.createReview);

router
  .route('/:id')
  .delete(tokenValidator.restrictTo('admin'), reviewController.deleteById)
  .patch(tokenValidator.restrictTo('admin'), reviewController.updateById)
  .get(reviewController.getReviewById);

module.exports = router;
