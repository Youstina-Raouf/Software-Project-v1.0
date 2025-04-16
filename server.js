require('dotenv').config();  // Load environment variables from .env

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {  // Read MONGO_URI from .env
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.log("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5001; // Change to port 5001 (or any other available port)
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});