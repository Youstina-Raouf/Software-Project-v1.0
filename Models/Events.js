const mongoose = require("mongoose");

// Schema definition using a different structure
const eventSchemaDefinition = {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    organizer: { 
        type: mongoose.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    attendees: {
        type: [{ type: mongoose.Types.ObjectId, ref: "User" }],
        default: []
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    }
};

// Creating the schema instance
const eventSchema = new mongoose.Schema(eventSchemaDefinition, { timestamps: true });

// Defining and exporting the model
module.exports = mongoose.model("Event", eventSchema);