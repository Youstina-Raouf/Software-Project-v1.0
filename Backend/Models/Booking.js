const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer'],
    required: true
  },
  paymentDetails: {
    type: Object
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  cancellationDate: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Virtual for checking if booking is refundable
bookingSchema.virtual('isRefundable').get(function() {
  const eventDate = this.event?.date;
  if (!eventDate) return false;
  
  const now = new Date();
  const eventDateTime = new Date(eventDate);
  const hoursUntilEvent = (eventDateTime - now) / (1000 * 60 * 60);
  
  return hoursUntilEvent > 24; // Refundable if more than 24 hours before event
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 