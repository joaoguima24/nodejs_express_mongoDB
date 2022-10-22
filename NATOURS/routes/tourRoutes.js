const express = require('express');
const tourController = require('../controllers/tourController');

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
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTourByID)
  .patch(tourController.updateTour)
  .delete(tourController.deleteByID);
module.exports = router;
