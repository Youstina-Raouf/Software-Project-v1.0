const Event = require('../Models/Events');

// 📌 Get approved events (Public)
exports.getEvents = async (req, res) => {
  try {
    console.log('Fetching approved events...');
    const events = await Event.find({ status: 'approved' }).select('-__v');
    console.log('Found events:', events.length);
    console.log('Events:', events.map(e => ({ 
      id: e._id, 
      title: e.title, 
      status: e.status,
      image: e.image 
    })));
    res.status(200).json(events);
  } catch (error) {
    console.error('Error in getEvents:', error);
    res.status(500).json({ message: "Error retrieving events", error: error.message });
  }
};

// 📌 Get all events (Admin only)
exports.getAllEvents = async (req, res) => {
  try {
    console.log('Getting all events for admin:', {
      userId: req.user._id,
      userRole: req.user.role
    });

    // Add validation for admin role
    if (!req.user || req.user.role.toLowerCase() !== 'admin') {
      console.log('Admin role check failed:', {
        hasUser: !!req.user,
        userRole: req.user?.role,
        expectedRole: 'admin'
      });
      return res.status(403).json({ message: "Only admins can access all events" });
    }

    const events = await Event.find({}).populate('organizer', 'username email');
    console.log('Found events:', events.length);
    console.log('Events:', events.map(e => ({ id: e._id, title: e.title, status: e.status })));

    res.status(200).json(events);
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    console.error('Error stack:', error.stack);
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
  const { title, description, date, location, totalTickets, price, image } = req.body;

  try {
    console.log('Creating event with data:', {
      title,
      description,
      date,
      location,
      totalTickets,
      price,
      image,
      hasImage: !!image
    });

    console.log('User from request:', {
      id: req.user?._id,
      role: req.user?.role,
      email: req.user?.email
    });

    if (!req.user || req.user.role !== 'organizer') {
      console.log('Role check failed:', {
        hasUser: !!req.user,
        userRole: req.user?.role,
        expectedRole: 'organizer'
      });
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
      image,
      status: 'pending'
    });

    console.log('Event object before save:', {
      title: event.title,
      image: event.image,
      hasImage: !!event.image
    });

    await event.save();
    
    console.log('Event saved successfully:', {
      id: event._id,
      title: event.title,
      image: event.image,
      hasImage: !!event.image
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: "Error creating event", error: error.message });
  }
};

// 📌 Update event (Organizer only)
exports.updateEvent = async (req, res) => {
  const { title, description, date, location, totalTickets, price, image } = req.body;

  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Convert role to lowercase for comparison
    const userRole = req.user.role.toLowerCase();

    // If user is admin, allow update
    if (userRole === 'admin') {
      // Update fields if they are provided in the request
      if (title) event.title = title;
      if (description) event.description = description;
      if (date) event.date = date;
      if (location) event.location = location;
      if (price) event.price = price;
      if (image) event.image = image;

      // Handle totalTickets update and adjust remainingTickets accordingly
      if (totalTickets) {
        const diff = totalTickets - event.totalTickets;
        event.totalTickets = totalTickets;
        event.remainingTickets += diff;
      }

      await event.save();
      return res.status(200).json({ message: "Event updated successfully", event });
    }

    // If user is organizer, they can only update their own events
    if (userRole === 'organizer') {
      if (event.organizer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only update your own events" });
      }

      // Update fields if they are provided in the request
      if (title) event.title = title;
      if (description) event.description = description;
      if (date) event.date = date;
      if (location) event.location = location;
      if (price) event.price = price;
      if (image) event.image = image;

      // Handle totalTickets update and adjust remainingTickets accordingly
      if (totalTickets) {
        const diff = totalTickets - event.totalTickets;
        event.totalTickets = totalTickets;
        event.remainingTickets += diff;
      }

      await event.save();
      return res.status(200).json({ message: "Event updated successfully", event });
    }

    // If user is neither admin nor organizer
    return res.status(403).json({ message: "Not authorized as organizer or admin" });
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
};

// 📌 Delete event (Organizer only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!req.user || req.user.role !== 'organizer' || event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own events" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error: error.message });
  }
};

// 📌 Update event status (Admin only)
exports.updateEventStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Convert role to lowercase for comparison
    const userRole = req.user.role.toLowerCase();
    
    if (userRole !== 'admin') {
      return res.status(403).json({ message: "Only admins can update event status" });
    }

    console.log('Finding event with ID:', req.params.id);
    const event = await Event.findById(req.params.id);
    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ message: "Event not found" });
    }

    console.log('Current event:', {
      id: event._id,
      title: event.title,
      status: event.status
    });

    event.status = status;
    await event.save();

    // Fetch the complete updated event to ensure we have all fields
    const updatedEvent = await Event.findById(event._id)
      .populate('organizer', 'username email')
      .lean(); // Use lean() to get a plain JavaScript object

    if (!updatedEvent) {
      console.error('Failed to fetch updated event');
      throw new Error('Failed to fetch updated event');
    }

    console.log('Sending updated event:', {
      id: updatedEvent._id,
      title: updatedEvent.title,
      status: updatedEvent.status,
      organizer: updatedEvent.organizer
    });

    // Return the complete updated event
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event status:', error);
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
    if (!req.user || req.user.role !== 'organizer') {
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

// 📌 Get organizer's events
exports.getOrganizerEvents = async (req, res) => {
  try {
    // Validate user and role
    if (!req.user) {
      console.error('No user found in request');
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log('Getting events for organizer:', {
      userId: req.user._id,
      userRole: req.user.role,
      email: req.user.email
    });

    if (req.user.role !== 'organizer') {
      console.log('Role check failed:', {
        hasUser: !!req.user,
        userRole: req.user?.role,
        expectedRole: 'organizer'
      });
      return res.status(403).json({ message: "Only organizers can access their events" });
    }

    // Find events where the organizer field matches the user's ID
    const events = await Event.find({ organizer: req.user._id })
      .sort({ date: -1 }) // Sort by date, newest first
      .lean(); // Convert to plain JavaScript objects for better performance
    
    console.log('Found events:', events.length);
    if (events.length > 0) {
      console.log('First event:', {
        id: events[0]._id,
        title: events[0].title,
        status: events[0].status,
        organizer: events[0].organizer
      });
    }

    return res.status(200).json(events);
  } catch (error) {
    console.error('Error in getOrganizerEvents:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      message: "Error retrieving events", 
      error: error.message
    });
  }
};