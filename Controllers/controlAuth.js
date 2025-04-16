const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require(path.join(__dirname, '../models/User'));

// Register controller
const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Login controller
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret');
        res.json({ token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get profile controller
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Export all controllers
module.exports = {
    register,
    login,
    getProfile
};
