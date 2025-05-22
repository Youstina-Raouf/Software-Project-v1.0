const User = require('../Models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;
    console.log('Registration attempt for:', { username, email, firstName, lastName, role });

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
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

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
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
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const { username, email, firstName, lastName, password } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (password) user.password = password;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// @desc    Delete user account
const deleteUserAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'User account deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

// @desc    Forget password
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real application, you would send this token via email
    res.json({ message: 'Password reset instructions sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process password reset' });
  }
};

// @desc    Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// @desc    Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// @desc    Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// @desc    Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.role = role;
    await user.save();
    
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

// @desc    Delete user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// @desc    Get user bookings
const getUserBookings = async (req, res) => {
  try {
    // This would typically fetch bookings from a Booking model
    res.json({ message: 'User bookings endpoint' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// @desc    Get user events
const getUserEvents = async (req, res) => {
  try {
    // This would typically fetch events from an Event model
    res.json({ message: 'User events endpoint' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// @desc    Get user analytics
const getUserAnalytics = async (req, res) => {
  try {
    // This would typically fetch analytics data
    res.json({ message: 'User analytics endpoint' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserBookings,
  getUserEvents,
  getUserAnalytics
};
