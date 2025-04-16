const mongoose = require('mongoose');
const Booking = require('../models/bookingModel');
const { calculateTotalPrice, validateTicketQuantity } = require('../utils/bookingUtils');

exports.bookTicket = async (req, res) => {
  try {
    const { eventId, ticketsBooked } = req.body;

    // Make sure userId is an actual valid ObjectId (use real ObjectId here)
    const userId = mongoose.Types.ObjectId("60d5f9b3f8d4f8b34f84e2bb"); // Replace with your actual MongoDB ObjectId

    // For debugging purposes, let's log the userId and eventId
    console.log("UserId:", userId);
    console.log("EventId:", eventId);
    console.log("TicketsBooked:", ticketsBooked);

    const eventPrice = 100;  // Replace with actual event price from your event model
    const availableTickets = 100; // Replace with actual available tickets from your event model

    // Check if tickets are available
    if (!validateTicketQuantity(ticketsBooked, availableTickets)) {
      return res.status(400).json({ error: 'Not enough tickets available.' });
    }

    // Calculate total price
    const totalPrice = calculateTotalPrice(ticketsBooked, eventPrice);

    // Create the booking in the database
    const booking = await Booking.create({
      user: userId,  // Should be valid ObjectId here
      event: eventId, // Should be valid eventId
      ticketsBooked,
      totalPrice,
      status: 'Confirmed'
    });

    // Respond with success
    res.status(201).json({ message: 'Booking successful', booking });

  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
};


// CANCEL a booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'Cancelled';
    await booking.save();

    //  increase tickets in Event model

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Cancellation failed', details: err.message });
  }
};

// VIEW user bookings
exports.getUserBookings = async (req, res) => {
  try {
    // TEMP user ID — use req.user._id later
    const userId = "643b3f3af9e57a001ed18420"; // TEMP valid ObjectId

    
    const bookings = await Booking.find({ user: userId }).populate('event');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// GET booking by ID //GET /api/v1/bookings/:id

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve booking', details: err.message });
  }
};