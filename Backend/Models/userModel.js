const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ... existing code ...
  resetPasswordOTP: {
    type: String,
    default: undefined
  },
  resetPasswordOTPExpiry: {
    type: Date,
    default: undefined
  }
  // ... existing code ...
});

// ... rest of the existing code ... 