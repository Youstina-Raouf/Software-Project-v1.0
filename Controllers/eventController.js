const Event = require("../models/eventModel");

// Controller for getting all events (Public)
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving events", error: error.message });
  }
};

// Controller for getting a single event by ID (Public)
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving the event", error: error.message });
  }
};

// Controller for creating a new event (Organizer only)
exports.createEvent = async (req, res) => {
  const { title, description, date, location, totalTickets, price } = req.body;

  try {
    // Check if user is an organizer
    if (req.user.role !== 'Organizer') {
      return res.status(403).json({ message: "Only organizers can create events" });
    }

    const event = new Event({
      title,
      description,
      date,
      location,
      organizer: req.user._id,  // Use actual organizer ID from authenticated user
      totalTickets,
      remainingTickets: totalTickets,
      price,
      status: 'pending'  // New events start as pending
    });

    await event.save();
    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error: error.message });
  }
};

// Controller for updating an event (Organizer only)
exports.updateEvent = async (req, res) => {
  const { date, location, totalTickets } = req.body;  // Only allow updating these fields

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the organizer of this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own events" });
    }

    // Update only allowed fields
    event.date = date || event.date;
    event.location = location || event.location;
    if (totalTickets) {
      const ticketDifference = totalTickets - event.totalTickets;
      event.totalTickets = totalTickets;
      event.remainingTickets = event.remainingTickets + ticketDifference;
    }

    await event.save();
    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
};

// Controller for deleting an event (Organizer only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is the organizer of this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own events" });
    }

    await event.remove();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error: error.message });
  }
};

// Controller for updating event status (Admin only)
exports.updateEventStatus = async (req, res) => {
  const { status } = req.body;

  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: "Only admins can update event status" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = status;
    await event.save();
    res.status(200).json({ message: "Event status updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Error updating event status", error: error.message });
  }
};

// Analytics function for calculating percentage of tickets booked
exports.calculateTicketBookingPercentage = (event) => {
  if (!event.totalTickets || event.totalTickets === 0) {
    return 0;
  }

  const bookedTickets = event.totalTickets - event.remainingTickets;
  const percentageBooked = (bookedTickets / event.totalTickets) * 100;
  return percentageBooked.toFixed(2);
};

// Controller for getting event analytics (Organizer only - for their events)
exports.getEventAnalytics = async (req, res) => {
  try {
    // Check if user is an organizer
    if (req.user.role !== 'Organizer') {
      return res.status(403).json({ message: "Only organizers can view analytics" });
    }

    // Get all events for this organizer
    const events = await Event.find({ organizer: req.user._id });
    
    // Calculate analytics for each event
    const analytics = events.map(event => ({
      eventId: event._id,
      title: event.title,
      percentageBooked: this.calculateTicketBookingPercentage(event) + "%",
      totalTickets: event.totalTickets,
      remainingTickets: event.remainingTickets,
      bookedTickets: event.totalTickets - event.remainingTickets
    }));

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Error calculating analytics", error: error.message });
  }
};
  