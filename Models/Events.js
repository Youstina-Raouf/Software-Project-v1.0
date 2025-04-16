const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalTickets: { type: Number, required: true },
  remainingTickets: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['approved', 'pending', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model("Event", EventSchema);
module.exports = Event;