const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  logoutUser,
  requestResetOTP,
  verifyResetOTP,
  resetPassword
} = require('../Controllers/userController');

// Validation for Register
const validateRegister = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Validation for Login
const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').optional().notEmpty().withMessage('Password cannot be empty'),
  body('otp').optional().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

// Error handling for validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Public routes
router.post('/register', validateRegister, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.post('/logout', logoutUser);
router.post('/request-reset-otp', requestResetOTP);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserAccount);

module.exports = router;
