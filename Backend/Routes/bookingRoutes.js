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
 * @access  Protected (Standard User)
 */
router.post('/v1/bookings', protect, user, bookTicket);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking details by ID
 * @access  Protected (User)
 */
router.get('/v1/bookings/:id', protect, user, getBookingById);

/**
 * @route   DELETE /api/v1/bookings/:id
 * @desc    Cancel a booking
 * @access  Protected (User)
 */
router.delete('/v1/bookings/:id', protect, user, cancelBooking);

/**
 * @route   GET /api/v1/bookings/user/bookings
 * @desc    Get current user's bookings
 * @access  Protected (User)
 */
router.get('/v1/users/bookings', protect, user, getUserBookings);

module.exports = router;