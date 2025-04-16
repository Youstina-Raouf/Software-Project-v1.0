const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

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

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName
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
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

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
                role: user.role,
                profilePicture: user.profilePicture,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Login failed', 
            error: error.message 
        });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile retrieved successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                role: user.role,
                profilePicture: user.profilePicture,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Failed to get profile', 
            error: error.message 
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.username = req.body.username || user.username;
        user.profilePicture = req.body.profilePicture || user.profilePicture;

        // If password is provided, hash it
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
                profilePicture: updatedUser.profilePicture,
                token: generateToken(updatedUser._id)
            }
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Profile update failed', 
            error: error.message 
        });
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Soft delete - just deactivate the account
        user.isActive = false;
        await user.save();

        res.json({ message: 'Account deactivated successfully' });
    } catch (error) {
        res.status(400).json({ 
            message: 'Account deactivation failed', 
            error: error.message 
        });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET || 'helloworld', 
        { expiresIn: '30d' }
    );
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUserAccount
};
