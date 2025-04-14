const express = require('express');
const mongoose = require('mongoose');
const bookingRoutes = require('./Routes/bookingRoutes');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/api/v1/bookings', bookingRoutes);

mongoose.connect('mongodb://localhost:27017/event-ticketing', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
