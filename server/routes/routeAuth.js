const router = require('express').Router();
const auth = require('../middleware/auth');
const { register, login, getProfile } = require('../controller/controlAuth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get profile route
router.get('/profile', auth, getProfile);

module.exports = router;
