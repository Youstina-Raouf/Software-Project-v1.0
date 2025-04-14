const express = require('express');
const router = express.Router();
const bookingController = require('../Controllers/bookingController');

router.post('/', bookingController.bookTicket);             // POST /api/v1/bookings
router.get('/:id', bookingController.getBookingById);       // GET /api/v1/bookings/:id
router.delete('/:id', bookingController.cancelBooking);     // DELETE /api/v1/bookings/:id

module.exports = router;
