const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const tokenValidator = require('../utils/tokenValidator');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.use(tokenValidator.protect);

router.route('/updatePassword').post(authController.updatePassword);
router.route('/updateMe').post(userController.updateMe);
router.route('/me').get(userController.getMe, userController.getUser);
router.route('/deleteMe').delete(userController.deleteMe);
router.route('/').get(userController.getAllUsers);

module.exports = router;
