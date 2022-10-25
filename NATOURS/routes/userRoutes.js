const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const tokenValidator = require('../utils/tokenValidator');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router
  .route('/updatePassword')
  .post(tokenValidator.protect, authController.updatePassword);
router.route('/updateMe').post(tokenValidator.protect, userController.updateMe);
router
  .route('/deleteMe')
  .delete(tokenValidator.protect, userController.deleteMe);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.route('/').get(userController.getAllUsers);

module.exports = router;
