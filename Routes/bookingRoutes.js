const express = require('express');
const router = express.Router();

const {
  bookTickets,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');

const { protect, user } = require('../middleware/authMiddleware');

// ======================
// Booking Routes
// ======================

/**
 * @route   POST /api/v1/bookings
 * @desc    Book tickets for an event
 * @access  User
 */
router.post('/', protect, user, bookTickets);

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

module.exports = router;
