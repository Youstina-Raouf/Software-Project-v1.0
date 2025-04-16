const router = require('express').Router();
const auth = require('../Middleware/auth');
const { register, login, getProfile } = require('../Controllers/controlAuth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get profile route
router.get('/profile', auth, getProfile);

module.exports = router;
