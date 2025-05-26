const jwt = require('jsonwebtoken');
const User = require('../Models/Users');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      console.log('User from database:', {
        id: user?._id,
        role: user?.role,
        email: user?.email
      });
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Convert both the user's role and the allowed roles to lowercase for comparison
    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());

    console.log('Role check:', {
      userRole,
      allowedRoles,
      actualUserRole: req.user.role
    });

    if (!allowedRoles.includes(userRole)) {
      console.log('Role check failed:', {
        userRole,
        allowedRoles,
        actualUserRole: req.user.role
      });
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

module.exports = { protect, authorize };