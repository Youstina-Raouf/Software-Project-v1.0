const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getEventAnalytics
} = require('../Controllers/eventController');

const { protect, organizer, admin } = require('../middleware/authMiddleware');

// ======================
// Public Routes
// ======================

/**
 * @route   GET /api/v1/events
 * @desc    Get list of all Approved events
 * @access  Public
 */
router.get('/v1/events', getEvents);

/**
 * @route   GET /api/v1/events/all
 * @desc    Get list of all events (approved,pending,declined)
 * @access  Admin
 */
router.get('/v1/events/all', protect, admin, getAllEvents);

/**
 * @route   DELETE /api/v1/events/:id
 * @desc    Delete an event
 * @access  Event Organizer or Admin
 */
router.delete('/v1/events/:id', protect, organizer, deleteEvent);

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get details of a single event
 * @access  Public
 */

router.get('/v1/events/:id', getEventById);

// ======================
// Organizer Routes
// ======================

/**
 * @route   POST /api/v1/events
 * @desc    Create a new event
 * @access  Event Organizer
 */
router.post('/v1/events', protect, organizer, createEvent);

/**
 * @route   PUT /api/v1/events/:id
 * @desc    Update an event
 * @access  Event Organizer or Admin
 */
router.put('/v1/events/:id', protect, (req, res, next) => {
  if (req.user.role === 'Organizer' || req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as organizer or admin' });
  }
}, updateEvent);

// /**
//  * @route   DELETE /api/v1/events/:id
//  * @desc    Delete an event
//  * @access  Event Organizer or Admin
//  */
// router.delete('/v1/events/:id', protect, organizer, deleteEvent);

/**
 * @route   GET /api/users/events/analytics
 * @desc    Get analytics for organizer's events
 * @access  Organizer
 */
router.get('/v1/users/events/analytics', protect, organizer, getEventAnalytics);

// ======================
// Admin Route
// ======================

/**
 * @route   PUT /api/v1/events/:id/status
 * @desc    Update event status
 * @access  Admin
 */
router.put('/v1/events/:id/status', protect, admin, updateEventStatus);

module.exports = router;