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
  getEventAnalytics
} = require('../Controllers/eventController');

// Admin routes
router.get('/admin/all', protect, getAllEvents);

// Analytics route (must be before /:id routes)
router.get('/organizer/analytics', protect, organizer, getEventAnalytics);

// Event status route
router.put('/:id/status', protect, updateEventStatus);

// CRUD routes
router.get('/', getEvents);
router.post('/', protect, organizer, createEvent);
router.get('/:id', getEventById);
router.put('/:id', protect, organizer, updateEvent);
router.delete('/:id', protect, organizer, deleteEvent);

module.exports = router; 