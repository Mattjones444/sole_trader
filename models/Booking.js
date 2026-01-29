const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  traderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trader',
    required: true
  },

  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },

  clientName: {
    type: String,
    required: true,
    trim: true
  },

  clientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },

  // NEW: Client location (town / city)
  location: {
    type: String,
    required: true,
    trim: true
  },

  requestedDateTime: {
    type: Date,
    required: true
  },

  jobDescription: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  }

}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
