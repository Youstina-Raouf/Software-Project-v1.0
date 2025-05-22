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

    // Validate input
    if (!eventId || !ticketsBooked) {
      return res.status(400).json({ message: "Please provide eventId and ticketsBooked" });
    }

    // Fetch event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event is approved
    if (event.status !== 'approved') {
      return res.status(400).json({ message: "Cannot book tickets for unapproved events" });
    }

    // Check ticket availability
    if (!validateTicketQuantity(ticketsBooked, event.remainingTickets)) {
      return res.status(400).json({ message: "Not enough tickets available" });
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

    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        _id: booking._id,
        event: {
          title: event.title,
          date: event.date,
          location: event.location
        },
        ticketsBooked,
        totalPrice,
        status: booking.status
      }
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking", error: error.message });
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

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { eventId, numberOfTickets } = req.body;

    // Validate input
    if (!eventId || !numberOfTickets) {
      return res.status(400).json({ message: "Please provide eventId and numberOfTickets" });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event is approved
    if (event.status !== 'approved') {
      return res.status(400).json({ message: "Cannot book tickets for unapproved events" });
    }

    // Check if enough tickets are available
    if (event.remainingTickets < numberOfTickets) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    // Calculate total price
    const totalPrice = event.price * numberOfTickets;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      event: eventId,
      numberOfTickets,
      totalPrice,
      status: 'confirmed'
    });

    // Save booking
    await booking.save();

    // Update event's remaining tickets
    event.remainingTickets -= numberOfTickets;
    await event.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: {
        _id: booking._id,
        event: {
          title: event.title,
          date: event.date,
          location: event.location
        },
        numberOfTickets,
        totalPrice,
        status: booking.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};