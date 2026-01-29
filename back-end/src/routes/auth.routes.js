const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resettoken', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
