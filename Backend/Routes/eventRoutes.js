const express = require('express');
const router = express.Router();
const { protect, organizer } = require('../middleware/authMiddleware');
const {
  getEvents,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getEventAnalytics,
  getOrganizerEvents
} = require('../Controllers/eventController');

// Admin routes
router.get('/admin/all', protect, getAllEvents);

// Organizer routes (must be before /:id routes)
router.get('/organizer', protect, organizer, getOrganizerEvents);
router.get('/organizer/analytics', protect, organizer, getEventAnalytics);

// CRUD routes
router.get('/', getEvents);
router.post('/', protect, organizer, createEvent);

// Event status route
router.put('/:id/status', protect, updateEventStatus);

// Parameterized routes (must be last)
router.get('/:id', getEventById);
router.put('/:id', protect, organizer, updateEvent);
router.delete('/:id', protect, organizer, deleteEvent);

module.exports = router;