const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'completed', 'cancelled'],
      message: 'Status must be pending, confirmed, completed, or cancelled',
    },
    default: 'pending',
  },
  // Place snapshot from Google Places API — stored at booking time
  // to protect against external data changing
  placeId: {
    type: String,
    required: [true, 'Place ID is required'],
  },
  placeName: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true,
  },
  specialty: {
    type: String,
    default: '',
    trim: true,
  },
  address: {
    type: String,
    default: '',
    trim: true,
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  notes: {
    type: String,
    default: '',
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
}, {
  timestamps: true,
});

// Index for user's appointments sorted by date
appointmentSchema.index({ userId: 1, date: -1 });
appointmentSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
