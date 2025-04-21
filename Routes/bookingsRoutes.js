const express = require("express");
const router = express.Router();

const {
  bookTicket,
  getBookingById,
  cancelBooking
} = require('../Controllers/bookingController');

const { protect, user } = require('../middleware/authMiddleware');

// ======================
// Standard User Routes
// ======================

/**
 * @route   POST /api/bookings
 * @desc    Book tickets for an event
 * @access  Standard User
 */
router.post('/bookings', protect, user, bookTicket);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details by ID
 * @access  Standard User
 */
router.get('/bookings/:id', protect, user, getBookingById);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel a booking
 * @access  Standard User
 */
router.delete('/bookings/:id', protect, user, cancelBooking);

module.exports = router; 