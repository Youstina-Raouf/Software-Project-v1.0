const express = require('express');
const router = express.Router();

const {
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
  registerUser,
  loginUser,
  requestResetOTP,
  verifyResetOTP,
  resetPassword
} = require('../Controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ======================
// Authenticated User Routes
// ======================

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @route   DELETE /api/v1/users/profile
 * @desc    Soft delete current user's account
 * @access  Private
 */
router.delete('/profile', protect, deleteUserAccount);

/**
 * @route   GET /api/v1/users/bookings
 * @desc    Get current user's bookings
 * @access  Standard User
 */
router.get('/bookings', protect, authorize('user'), getUserBookings);

/**
 * @route   GET /api/v1/users/events
 * @desc    Get current user's events
 * @access  Event Organizer
 */
router.get('/events', protect, authorize('organizer'), getUserEvents);

/**
 * @route   GET /api/v1/users/events/analytics
 * @desc    Get analytics for user's events
 * @access  Event Organizer
 */
router.get('/events/analytics', protect, authorize('organizer'), getUserAnalytics);

// ======================
// Admin Routes
// ======================

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (Admin only)
 * @access  Admin
 */
router.get('/', protect, authorize('admin'), getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get a single user's details
 * @access  Admin
 */
router.get('/:id', protect, authorize('admin'), getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update a user's role
 * @access  Admin
 */
router.put('/:id', protect, authorize('admin'), updateUserRole);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete a user
 * @access  Admin
 */
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/request-reset-otp', requestResetOTP);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

module.exports = router;