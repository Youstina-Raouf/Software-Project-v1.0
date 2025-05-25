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
  getEventAnalytics,
  getOrganizerEvents
} = require('../Controllers/eventController');

const { protect, authorize, admin } = require('../middleware/authMiddleware');
const Event = require('../Models/Events');

// ======================
// Public Routes
// ======================

/**
 * @route   GET /api/v1/events
 * @desc    Get list of all Approved events
 * @access  Public
 */
router.get('/', getEvents);

// ======================
// Admin Routes
// ======================

/**
 * @route   GET /api/v1/events/all
 * @desc    Get list of all events (approved,pending,declined)
 * @access  Admin
 */
router.get('/all', protect, authorize('admin'), getAllEvents);

// ======================
// Organizer Routes
// ======================

/**
 * @route   GET /api/v1/events/organizer
 * @desc    Get events for the logged-in organizer
 * @access  Organizer
 */
router.get('/organizer', protect, authorize('organizer'), getOrganizerEvents);

/**
 * @route   GET /api/v1/events/analytics
 * @desc    Get analytics for organizer's events
 * @access  Organizer
 */
router.get('/analytics', protect, authorize('organizer'), getEventAnalytics);

/**
 * @route   POST /api/v1/events
 * @desc    Create a new event
 * @access  Event Organizer
 */
router.post('/', protect, authorize('organizer'), createEvent);

/**
 * @route   POST /api/v1/events/create
 * @desc    Create a new event (alternative endpoint)
 * @access  Event Organizer
 */
router.post('/create', protect, authorize('organizer'), createEvent);

// ======================
// Event ID Routes
// ======================

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', getEventById);

/**
 * @route   PUT /api/v1/events/:id
 * @desc    Update an event
 * @access  Event Organizer or Admin
 */
router.put('/:id', protect, (req, res, next) => {
  if (req.user.role.toLowerCase() === 'organizer' || req.user.role.toLowerCase() === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as organizer or admin' });
  }
}, updateEvent);

/**
 * @route   DELETE /api/v1/events/:id
 * @desc    Delete an event
 * @access  Event Organizer or Admin
 */
router.delete('/:id', protect, authorize('organizer'), deleteEvent);

/**
 * @route   PUT /api/v1/events/:id/status
 * @desc    Update event status
 * @access  Admin
 */
router.put('/:id/status', protect, authorize('admin'), updateEventStatus);

module.exports = router;