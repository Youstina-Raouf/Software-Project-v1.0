const mongoose = require('mongoose');
const Booking = require('../Models/Bookings');
const Event = require('../Models/Events');
const { 
  calculateTotalPrice, 
  validateTicketQuantity, 
  updateAvailableTickets, 
  revertAvailableTickets 
} = require('../utils/bookingUtils');

// BOOK a ticket
exports.bookTicket = async (req, res) => {
  try {
    const { eventId, ticketsBooked } = req.body;
    const userId = req.user._id;

    // Fetch event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check ticket availability
    if (!validateTicketQuantity(ticketsBooked, event.remainingTickets)) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    const totalPrice = calculateTotalPrice(ticketsBooked, event.price);

    // Create booking
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      ticketsBooked,
      totalPrice,
      status: 'Confirmed'
    });

    // Update event ticket count
    event.remainingTickets = updateAvailableTickets(event.remainingTickets, ticketsBooked);
    await event.save();

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

    // Find the event
    const event = await Event.findById(booking.event);
    if (!event) return res.status(404).json({ error: 'Associated event not found' });

    // Update event tickets
    event.remainingTickets = revertAvailableTickets(event.remainingTickets, booking.ticketsBooked);
    await event.save();

    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Cancellation failed', details: err.message });
  }
};

// VIEW user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId }).populate('event');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// GET booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve booking', details: err.message });
  }
};
