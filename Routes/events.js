const express = require('express');
const router = express.Router();
const eventController = require('../Controllers/eventController');
const { protect, admin, organizer } = require('../middleware/authMiddleware');

// Public routes
router.get('/v1/events', eventController.getAllEvents);
router.get('/v1/events/:id', eventController.getEventById);

// Organizer routes
router.post('/v1/events', protect, organizer, eventController.createEvent);
router.put('/v1/events/:id', protect, organizer, eventController.updateEvent);
router.delete('/v1/events/:id', protect, organizer, eventController.deleteEvent);

// Admin routes
router.put('/v1/events/:id/status', protect, admin, eventController.updateEventStatus);

// Analytics route (Organizer only)
router.get('/v1/users/events/analytics', protect, organizer, eventController.getEventAnalytics);

module.exports = router; 