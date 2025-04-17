const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getAnalytics
} = require('../Controllers/eventController');

const { protect, organizer, admin } = require('../middleware/authMiddleware');

// ======================
// Public Routes
// ======================

/**
 * @route   GET /api/v1/events
 * @desc    Get all events
 * @access  Public
 */
router.get('/', getEvents);

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get('/:id', getEventById);

// ======================
// Organizer Routes
// ======================

/**
 * @route   POST /api/v1/events
 * @desc    Create new event
 * @access  Organizer
 */
router.post('/', protect, organizer, createEvent);

/**
 * @route   PUT /api/v1/events/:id
 * @desc    Update an event
 * @access  Organizer
 */
router.put('/:id', protect, organizer, updateEvent);

/**
 * @route   DELETE /api/v1/events/:id
 * @desc    Delete an event
 * @access  Organizer
 */
router.delete('/:id', protect, organizer, deleteEvent);

/**
 * @route   GET /api/v1/users/events/analytics
 * @desc    Get analytics for organizer's events
 * @access  Organizer
 */
router.get('/users/events/analytics', protect, organizer, getAnalytics);

// ======================
// Admin Route (Optional)
// ======================

/**
 * @route   PUT /api/v1/events/:id/status
 * @desc    Update event status (admin only)
 * @access  Admin
 */
router.put('/:id/status', protect, admin, updateEventStatus);

module.exports = router;
