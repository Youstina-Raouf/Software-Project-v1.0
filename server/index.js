 require('dotenv').config();  
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/routeAuth');  

const app = express();
const PORT = process.env.PORT || 5000;  //port on 5000

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketing-system', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth',  authRoutes);  // Auth routes

// Test route   
app.get('/', (req, res) => {
    res.send('Welcome to the Ticketing System API');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});