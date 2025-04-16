const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUserAccount
} = require('../Controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginUser);

// Protected routes - require authentication
/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @route   DELETE /api/users/profile
 * @desc    Delete user account (soft delete)
 * @access  Private
 */
router.delete('/profile', protect, deleteUserAccount);

// Export the router
module.exports = router;
