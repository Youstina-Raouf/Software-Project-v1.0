require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./Routes/userRoutes');
const eventRoutes = require('./Routes/eventsRoutes');
const bookingRoutes = require('./Routes/bookingRoutes');

const app = express();

// Middleware
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api', userRoutes);
app.use('/api', eventRoutes);
app.use('/api', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/event_booking_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log(' MongoDB Connected Successfully'))
.catch(err => console.log(' MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`\n Server running on port ${PORT}`);
    console.log('\n Available Routes:');
    console.log('   Users:');
    console.log('   - POST /api/v1/register    - Register new user');
    console.log('   - POST /api/v1/login       - Login user');
    console.log('   - PUT  /api/v1/forgetPassword - Reset password');
    console.log('   - GET  /api/v1/users/profile  - Get user profile');
    console.log('   - PUT  /api/v1/users/profile  - Update profile');
    console.log('   - GET  /api/v1/users/bookings - Get user bookings');
    console.log('   - GET  /api/v1/users/events   - Get user events');
    console.log('   - GET  /api/v1/users/events/analytics - Get event analytics');
    console.log('\n   Events:');
    console.log('   - GET  /api/v1/events         - Get all approved events');
    console.log('   - GET  /api/v1/events/all     - Get all events (Admin)');
    console.log('   - GET  /api/v1/events/:id     - Get event by ID');
    console.log('   - POST /api/v1/events         - Create event (Organizer)');
    console.log('   - PUT  /api/v1/events/:id     - Update event (Organizer/Admin)');
    console.log('   - DEL  /api/v1/events/:id     - Delete event (Organizer/Admin)');
    console.log('   - PUT  /api/v1/events/:id/status - Update event status (Admin)');
    console.log('\n   Bookings:');
    console.log('   - POST /api/v1/bookings       - Book tickets (User)');
    console.log('   - GET  /api/v1/bookings/:id   - Get booking details (User)');
    console.log('   - DEL  /api/v1/bookings/:id   - Cancel booking (User)');
});
