const User = require('../Models/Users');
const Booking = require('../Models/Bookings');
const Event = require('../Models/Events');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require("../utils/bookingUtils");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user
// @route   POST /api/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists by email or username (case-insensitive)
    const userExists = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (userExists) {
      return res.status(400).json({
        message: userExists.email === email.toLowerCase()
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    // Validate role
    const validRoles = ['user', 'organizer', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'user';

    // Create user (password hashed by pre-save hook)
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: userRole
    });

    if (user) {
      return res.status(201).json({
        message: 'Registration successful',
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Request login OTP
// @route   POST /api/v1/auth/request-login-otp
// @access  Public
const requestLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.loginOTP = otp;
    user.loginOTPExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    await sendOTPEmail(email, otp);

    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error:', error);
    return res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    // Handle password login
    if (password) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }
    // Handle OTP login
    else if (otp) {
      if (!user.loginOTP || !user.loginOTPExpiry) {
        return res.status(400).json({ message: 'Please request an OTP first' });
      }

      if (user.loginOTP !== otp) {
        return res.status(401).json({ message: 'Invalid OTP' });
      }

      if (new Date() > user.loginOTPExpiry) {
        return res.status(401).json({ message: 'OTP has expired' });
      }

      // Clear OTP after successful verification
      user.loginOTP = undefined;
      user.loginOTPExpiry = undefined;
    } else {
      return res.status(400).json({ message: 'Please provide either password or OTP' });
    }

    user.lastLogin = new Date();
    await user.save();

    return res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Request password reset OTP
// @route   POST /api/v1/auth/request-reset-otp
// @access  Public
const requestResetOTP = async (req, res) => {
  try {
    console.log('Request reset OTP called with body:', req.body);
    const { email } = req.body;

    if (!email) {
      console.log('Email missing in request');
      return res.status(400).json({ message: 'Please provide email' });
    }

    console.log('Looking for user with email:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('User not found with email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated OTP for user:', user._id);
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;
    await user.save();

    console.log('Attempting to send OTP email to:', email);
    // Send OTP via email
    await sendOTPEmail(email, otp);
    console.log('OTP email sent successfully');

    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error details:', {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    return res.status(500).json({ 
      message: 'Error sending OTP', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Verify password reset OTP
// @route   POST /api/v1/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({ message: 'Please request an OTP first' });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.resetPasswordOTPExpiry) {
      return res.status(401).json({ message: 'OTP has expired' });
    }

    return res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/v1/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({ message: 'Please request an OTP first' });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.resetPasswordOTPExpiry) {
      return res.status(401).json({ message: 'OTP has expired' });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear OTP
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    console.log('getAllUsers called');
    console.log('User making request:', req.user);
    const users = await User.find().select('-password');
    console.log('Found users:', users.length);
    return res.json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    return res.json({
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture
      }
    });
  } catch (error) {
    return res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
};

// @desc    Deactivate user account
// @route   DELETE /api/users/account
// @access  Private
const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = false;
    await user.save();

    return res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    return res.status(400).json({ message: 'Error deactivating account', error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = req.body.role || user.role;
    const updatedUser = await user.save();

    return res.json({
      message: 'User role updated successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    return res.status(400).json({ message: 'Error updating user role', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/v1/users/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date location')
      .sort({ createdAt: -1 });
    
    return res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// @desc    Get user events (Event Organizer)
// @route   GET /api/users/events
// @access  Event Organizer
const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .sort({ date: -1 });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving events', error: error.message });
  }
};

// @desc    Get user analytics (Event Organizer)
// @route   GET /api/users/events/analytics
// @access  Event Organizer
const getUserAnalytics = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id });

    const analytics = {
      totalEvents: events.length,
      activeEvents: events.filter(event => event.status === 'active').length,
      pendingEvents: events.filter(event => event.status === 'pending').length,
      totalTickets: events.reduce((acc, event) => acc + event.totalTickets, 0),
      totalBookedTickets: events.reduce((acc, event) => acc + (event.totalTickets - event.remainingTickets), 0),
      revenue: events.reduce((acc, event) => {
        const bookedTickets = event.totalTickets - event.remainingTickets;
        return acc + (bookedTickets * event.price);
      }, 0)
    };

    analytics.bookingPercentage = analytics.totalTickets > 0
      ? ((analytics.totalBookedTickets / analytics.totalTickets) * 100).toFixed(2) + '%'
      : '0%';

    analytics.events = events.map(event => ({
      id: event._id,
      title: event.title,
      status: event.status,
      totalTickets: event.totalTickets,
      bookedTickets: event.totalTickets - event.remainingTickets,
      revenue: (event.totalTickets - event.remainingTickets) * event.price,
      bookingPercentage: ((event.totalTickets - event.remainingTickets) / event.totalTickets * 100).toFixed(2) + '%'
    }));

    return res.json(analytics);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving analytics', error: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  requestLoginOTP,
  loginUser,
  requestResetOTP,
  verifyResetOTP,
  resetPassword,
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  updateUserRole,
  deleteUser,
  getUserBookings,
  getUserEvents,
  getUserAnalytics,
  logoutUser,
};
