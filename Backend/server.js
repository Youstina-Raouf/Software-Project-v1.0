require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./Routes/userRoutes');
const eventRoutes = require('./Routes/eventsRoutes');
const bookingRoutes = require('./Routes/bookingRoutes');
const authRoutes = require('./Routes/authRoutes');

// Debug logging for environment variables
console.log('Environment Variables Check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not Set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('PORT:', process.env.PORT || 5000);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request body:', req.body);
    next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });
    
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.stack : 'Internal server error'
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_booking_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected Successfully');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
})
.catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n Server running on port ${PORT}`);
    console.log('\n Available Routes:');
    console.log('   Auth:');
    console.log('   - POST /api/v1/auth/register         - Register new user');
    console.log('   - POST /api/v1/auth/login            - Login user');
    console.log('   - POST /api/v1/auth/request-reset-otp - Request password reset OTP');
    console.log('   - POST /api/v1/auth/verify-reset-otp  - Verify reset OTP');
    console.log('   - POST /api/v1/auth/reset-password    - Reset password');
    console.log('   - POST /api/v1/auth/logout           - Logout user');
    console.log('   - GET  /api/v1/auth/profile          - Get user profile');
    console.log('   - PUT  /api/v1/auth/profile          - Update profile');
    console.log('\n   Users:');
    console.log('   - GET  /api/v1/users/bookings        - Get user bookings');
    console.log('   - GET  /api/v1/users/events          - Get user events');
    console.log('   - GET  /api/v1/users/events/analytics - Get event analytics');
    console.log('\n   Events:');
    console.log('   - GET  /api/v1/events                - Get all approved events');
    console.log('   - GET  /api/v1/events/all            - Get all events (Admin)');
    console.log('   - GET  /api/v1/events/:id            - Get event by ID');
    console.log('   - POST /api/v1/events                - Create event (Organizer)');
    console.log('   - PUT  /api/v1/events/:id            - Update event (Organizer/Admin)');
    console.log('   - DEL  /api/v1/events/:id            - Delete event (Organizer/Admin)');
    console.log('   - PUT  /api/v1/events/:id/status     - Update event status (Admin)');
    console.log('\n   Bookings:');
    console.log('   - POST /api/v1/bookings              - Book tickets (User)');
    console.log('   - GET  /api/v1/bookings/:id          - Get booking details (User)');
    console.log('   - DEL  /api/v1/bookings/:id          - Cancel booking (User)');
});
