const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Authentication middleware
 * Verifies JWT token and adds user to request object
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                // Get token from header
                token = req.headers.authorization.split(' ')[1];

                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'helloworld');

                // Get user from token (exclude password)
                req.user = await User.findById(decoded.id).select('-password');

                if (!req.user) {
                    return res.status(401).json({
                        message: 'Not authorized, user not found'
                    });
                }

                // Check if user is active
                if (!req.user.isActive) {
                    return res.status(401).json({
                        message: 'Account is deactivated'
                    });
                }

                next();
            } catch (error) {
                console.error('Token verification failed:', error.message);
                return res.status(401).json({
                    message: 'Not authorized, token failed',
                    error: error.message
                });
            }
        }

        if (!token) {
            return res.status(401).json({
                message: 'Not authorized, no token provided'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(500).json({
            message: 'Authentication failed',
            error: error.message
        });
    }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: 'User not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role ${req.user.role} is not authorized to access this route`
            });
        }

        next();
    };
};

/**
 * Admin check middleware
 * Verifies if user has admin role
 */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Not authorized as admin'
        });
    }
    next();
};

module.exports = {
    protect,
    authorize,
    isAdmin
};
