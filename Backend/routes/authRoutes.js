const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', validateRegister, handleValidationErrors, authController.register);
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/check-validation-code', authController.checkValidationCode);

// Protected routes
router.use(auth.verifyToken);
router.post('/update-password', authController.updatePassword);

module.exports = router;