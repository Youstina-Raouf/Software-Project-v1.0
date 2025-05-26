const express = require('express');
const router = express.Router();

const {
  bookTicket,
  getBookingById,
  cancelBooking,
  getUserBookings
} = require('../Controllers/bookingController');

const { protect, authorize } = require('../middleware/authMiddleware');

// ======================
// Booking Routes
// ======================

/**
 * @route   POST /api/v1/bookings
 * @desc    Book tickets for an event
 * @access  Protected (Standard User)
 */
router.post('/', protect, authorize('user'), bookTicket);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking details by ID
 * @access  Protected (User)
 */
router.get('/:id', protect, authorize('user'), getBookingById);

/**
 * @route   DELETE /api/v1/bookings/:id
 * @desc    Cancel a booking
 * @access  Protected (User)
 */
router.delete('/:id', protect, authorize('user'), cancelBooking);

/**
 * @route   GET /api/v1/bookings/user/bookings
 * @desc    Get current user's bookings
 * @access  Protected (User)
 */
router.get('/user/bookings', protect, authorize('user'), getUserBookings);

module.exports = router;