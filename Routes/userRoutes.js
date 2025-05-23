const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgetPassword,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserBookings,
  getUserEvents,
  getUserAnalytics,
  resetPassword
} = require('../Controllers/userController');

const { protect, admin, organizer, user } = require('../middleware/authMiddleware');

// ======================
// Public Routes
// ======================

/**
 * @route   POST /api/v1/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/v1/register', registerUser);

/**
 * @route   POST /api/v1/login
 * @desc    Authenticate user & return token
 * @access  Public
 */
router.post('/v1/login', loginUser);

/**
 * @route   PUT /api/v1/forgetPassword
 * @desc    Reset password
 * @access  Public
 */
router.put('/v1/forgetPassword', forgetPassword);

/**
 * @route   POST /api/v1/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post('/v1/reset-password', resetPassword);

// ======================
// Authenticated User Routes
// ======================

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/v1/users/profile', protect, getUserProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/v1/users/profile', protect, updateUserProfile);

/**
 * @route   DELETE /api/v1/users/profile
 * @desc    Soft delete current user's account
 * @access  Private
 */
router.delete('/v1/users/profile', protect, deleteUserAccount);

/**
 * @route   GET /api/v1/users/bookings
 * @desc    Get current user's bookings
 * @access  Standard User
 */
router.get('/v1/users/bookings', protect, user, getUserBookings);

/**
 * @route   GET /api/v1/users/events
 * @desc    Get current user's events
 * @access  Event Organizer
 */
router.get('/v1/users/events', protect, organizer, getUserEvents);

/**
 * @route   GET /api/v1/users/events/analytics
 * @desc    Get analytics for user's events
 * @access  Event Organizer
 */
router.get('/v1/users/events/analytics', protect, organizer, getUserAnalytics);

// ======================
// Admin Routes
// ======================

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/v1/users', protect, admin, getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get a single user's details
 * @access  Admin
 */
router.get('/v1/users/:id', protect, admin, getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update a user's role
 * @access  Admin
 */
router.put('/v1/users/:id', protect, admin, updateUserRole);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete a user
 * @access  Admin
 */
router.delete('/v1/users/:id', protect, admin, deleteUser);

module.exports = router;