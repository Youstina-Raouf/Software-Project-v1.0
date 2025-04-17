const Event = require('../Models/Events');

// 📌 Get all events (Public)
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving events", error: error.message });
  }
};

// 📌 Get event by ID (Public)
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving the event", error: error.message });
  }
};

// 📌 Create event (Organizer only)
exports.createEvent = async (req, res) => {
  const { title, description, date, location, totalTickets, price } = req.body;

  try {
    if (!req.user || req.user.role !== 'Organizer') {
      return res.status(403).json({ message: "Only organizers can create events" });
    }

    const event = new Event({
      title,
      description,
      date,
      location,
      organizer: req.user._id,
      totalTickets,
      remainingTickets: totalTickets,
      price,
      status: 'pending'
    });

    await event.save();
    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error: error.message });
  }
};

// 📌 Update event (Organizer only)
exports.updateEvent = async (req, res) => {
  const { date, location, totalTickets } = req.body;

  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!req.user || req.user.role !== 'Organizer' || event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own events" });
    }

    event.date = date || event.date;
    event.location = location || event.location;

    if (totalTickets) {
      const diff = totalTickets - event.totalTickets;
      event.totalTickets = totalTickets;
      event.remainingTickets += diff;
    }

    await event.save();
    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
};

// 📌 Delete event (Organizer only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!req.user || req.user.role !== 'Organizer' || event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own events" });
    }

    await event.remove();
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error: error.message });
  }
};

// 📌 Update event status (Admin only)
exports.updateEventStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ message: "Only admins can update event status" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = status;
    await event.save();
    res.status(200).json({ message: "Event status updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Error updating event status", error: error.message });
  }
};

// 📌 Helper to calculate % booked
const calculateTicketBookingPercentage = (event) => {
  if (!event.totalTickets || event.totalTickets === 0) return 0;

  const booked = event.totalTickets - event.remainingTickets;
  return ((booked / event.totalTickets) * 100).toFixed(2);
};

// 📌 Event analytics (Organizer only)
exports.getEventAnalytics = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'Organizer') {
      return res.status(403).json({ message: "Only organizers can view analytics" });
    }

    const events = await Event.find({ organizer: req.user._id });

    const analytics = events.map(event => ({
      eventId: event._id,
      title: event.title,
      percentageBooked: calculateTicketBookingPercentage(event) + "%",
      totalTickets: event.totalTickets,
      remainingTickets: event.remainingTickets,
      bookedTickets: event.totalTickets - event.remainingTickets
    }));

    const totalTickets = events.reduce((acc, event) => acc + event.totalTickets, 0);
    const totalBookedTickets = events.reduce((acc, event) => acc + (event.totalTickets - event.remainingTickets), 0);
    const overallPercentageBooked = totalTickets > 0 ? ((totalBookedTickets / totalTickets) * 100).toFixed(2) : 0;

    res.status(200).json({
      events: analytics,
      overallAnalytics: {
        totalEvents: events.length,
        totalTickets,
        totalBookedTickets,
        overallPercentageBooked: overallPercentageBooked + "%"
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error calculating analytics", error: error.message });
  }
};
