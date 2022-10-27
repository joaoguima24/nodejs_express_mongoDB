const express = require('express');
const tourController = require('../controllers/tourController');
const tokenValidator = require('../utils/tokenValidator');
const reviewRouter = require('./reviewRoutes');
// const reviewController = require('../controllers/reviewController');

const router = express.Router();

// //Nested route ({{URL}}/tour/:tourId/reviews)
// router
//   .route('/:tourId/reviews')
//   .post(
//     tokenValidator.protect,
//     tokenValidator.restrictTo('user'),
//     reviewController.createReview
//   );

//now using express router: (we need to set mergeParams to true in the reviewRouter)
router.use('/:tourId/reviews', reviewRouter);

//first we pass through the middleware then we go to getAllTours
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

//Routing our stats pipeline
router.route('/tour-stats').get(tourController.getTourStats);

//Routing our monthly plan pipeline
router
  .route('/monthly-plan/:year')
  .get(
    tokenValidator.protect,
    tokenValidator.restrictTo('admin', 'lead-guide'),
    tourController.getMonthlyPlan
  );

//Geospatial search within
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

//Geospatial calculating distances:
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    tokenValidator.protect,
    tokenValidator.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tokenValidator.protect, tourController.getTourByID)
  .patch(tokenValidator.protect, tourController.updateTour)
  .delete(
    tokenValidator.protect,
    tokenValidator.restrictTo('admin', 'lead-guide'),
    tourController.deleteByID
  );

module.exports = router;
