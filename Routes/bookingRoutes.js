const express = require('express');
const router = express.Router();

const {
  bookTicket,
  getBookingById,
  cancelBooking,
  getUserBookings
} = require('../Controllers/bookingController');

const { protect, user } = require('../middleware/authMiddleware');

// ======================
// Booking Routes
// ======================

/**
 * @route   POST /api/v1/bookings
 * @desc    Book tickets for an event
 * @access  User
 */
router.post('/', protect, user, bookTicket);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking details by ID
 * @access  User
 */
router.get('/:id', protect, user, getBookingById);

/**
 * @route   DELETE /api/v1/bookings/:id
 * @desc    Cancel a booking
 * @access  User
 */
router.delete('/:id', protect, user, cancelBooking);

/**
 * @route   GET /api/v1/users/bookings
 * @desc    Get current user's bookings
 * @access  User
 */
router.get('/users/bookings', protect, user, getUserBookings);

module.exports = router;
