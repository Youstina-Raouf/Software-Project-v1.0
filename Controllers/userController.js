const User = require('../Models/Users');
const jwt = require('jsonwebtoken');
const User = require('../Models/Users');
const Booking = require('../Models/Bookings');
const Event = require('../Models/Events');
const { sendOTPEmail } = require("../utils/bookingUtils");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, role } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user exists
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

        // Create user (password will be hashed by the pre-save hook)
        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            role: role || 'Standard'  // Default role if not provided
        });

        if (user) {
            res.status(201).json({
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
        }
    } catch (error) {
        res.status(400).json({ 
            message: 'Registration failed', 
            error: error.message 
        });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with that email or username' });
    }

    console.log('Creating new user...');
    // Create user instance first
    const user = new User({
      username,
      email: email.toLowerCase(), // Ensure email is lowercase
      password,
      firstName,
      lastName,
      role: role || 'Standard'
    });

    // Save the user to trigger the pre-save middleware
    const savedUser = await user.save();
    console.log('User created successfully:', { 
      id: savedUser._id, 
      email: savedUser.email,
      hasPassword: !!savedUser.password,
      passwordLength: savedUser.password ? savedUser.password.length : 0
    });

    res.status(201).json({
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      token: generateToken(savedUser),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', { email });

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', user ? 'Yes' : 'No');

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            message: 'Login successful',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                role: user.role,  // Include the role in the response
                profilePicture: user.profilePicture,
                token: generateToken(user._id)  // Assuming generateToken is implemented elsewhere
            }
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Login failed', 
            error: error.message 
        });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token and send response
    const token = generateToken(user);
    console.log('Login successful for:', email);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Reset password
// @route   PUT /api/users/forgetPassword
// @access  Public
const forgetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Please provide email and new password' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({
            message: 'Password reset failed',
            error: error.message
        });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/users/reset-password
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

        // Verify OTP (you should implement proper OTP verification logic here)
        // For now, we'll just check if the OTP matches a stored value
        if (user.resetPasswordOTP !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordOTP = null; // Clear the OTP after successful reset
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({
            message: 'Password reset failed',
            error: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
};

// @desc    Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// @desc    Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.profilePicture = req.body.profilePicture || user.profilePicture;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();
        res.json({
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
        res.status(400).json({ message: 'Error updating profile', error: error.message });
    }
};

// @desc    Delete user account
const deleteUserAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = false;
        await user.save();
        res.json({ message: 'Account deactivated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deactivating account', error: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/users/:id
// @access  Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = req.body.role || user.role;
        const updatedUser = await user.save();

        res.json({
            message: 'User role updated successfully',
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        res.status(400).json({ message: 'Error updating user role', error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('event', 'title date location price')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving bookings', error: error.message });
    }
};

// @desc    Get user events
// @route   GET /api/users/events
// @access  Event Organizer
const getUserEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user._id })
            .sort({ date: -1 }); // Sort by date in descending order

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving events', error: error.message });
    }
};

// @desc    Get user analytics
// @route   GET /api/users/events/analytics
// @access  Event Organizer
const getUserAnalytics = async (req, res) => {
    try {
        // Get all events organized by the user
        const events = await Event.find({ organizer: req.user._id });

        // Calculate analytics
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

        // Calculate booking percentage
        analytics.bookingPercentage = analytics.totalTickets > 0
            ? ((analytics.totalBookedTickets / analytics.totalTickets) * 100).toFixed(2) + '%'
            : '0%';

        // Get event-wise analytics
        analytics.events = events.map(event => ({
            id: event._id,
            title: event.title,
            status: event.status,
            totalTickets: event.totalTickets,
            bookedTickets: event.totalTickets - event.remainingTickets,
            revenue: (event.totalTickets - event.remainingTickets) * event.price,
            bookingPercentage: ((event.totalTickets - event.remainingTickets) / event.totalTickets * 100).toFixed(2) + '%'
        }));

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving analytics', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgetPassword,
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
    getUserAnalytics
};