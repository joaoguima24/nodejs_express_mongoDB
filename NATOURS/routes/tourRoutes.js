const express = require('express');
const tourController = require('../controllers/tourController');
const tokenValidator = require('../utils/tokenValidator');

const router = express.Router();

// router.param('body', tourController.checkBody);

// router
//   .route('/')
//   .get(tourController.getAllTours)
//   .post(tourController.checkBody, tourController.createTour);
// router.route('/:id').get(tourController.getTourById);

//first we pass through the middleware then we go to getAllTours
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

//Routing our stats pipeline
router.route('/tour-stats').get(tourController.getTourStats);

//Routing our monthly plan pipeline
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tokenValidator.protect, tourController.getAllTours)
  .post(tokenValidator.protect, tourController.createTour);

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
