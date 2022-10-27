const express = require('express');
const bookingController = require('../controllers/bookingController');
const tokenValidator = require('../utils/tokenValidator');

const router = express.Router();

// router.use(
//   tokenValidator.protect,
//   tokenValidator.restrictTo('admin', 'lead-guide')
// );

router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
