const jwt = require('jsonwebtoken');
const User = require('../Models/Users');

/**
 * Protect routes - Auth middleware
 * Verifies JWT token and attaches user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'helloworld');

      // Attach user (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      next();
    } else {
      return res.status(401).json({ message: 'No token provided' });
    }
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Organizer middleware
const organizer = (req, res, next) => {
  if (req.user && req.user.role === 'Organizer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as organizer' });
  }
};

// Standard user middleware
const user = (req, res, next) => {
  if (req.user && req.user.role === 'Standard') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as standard user' });
  }
};

module.exports = {
  protect,
  admin,
  organizer,
  user
};
