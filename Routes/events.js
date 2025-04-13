const express = require("express");
const router = express.Router();
const eventController = require("../Controllers/eventController");

// Public routes
router.get("/api/v1/events", eventController.getAllEvents);
router.get("/api/v1/events/:id", eventController.getEventById);

// Organizer routes (will need auth middleware)
router.post("/api/v1/events", eventController.createEvent);
router.put("/api/v1/events/:id", eventController.updateEvent);
router.delete("/api/v1/events/:id", eventController.deleteEvent);

// Admin routes (will need auth middleware)
router.put("/api/v1/events/:id/status", eventController.updateEventStatus);

// Analytics route (Organizer only)
router.get("/api/v1/users/events/analytics", eventController.getEventAnalytics);

module.exports = router;
