const mongoose = require('mongoose');

const sosLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'acknowledged', 'resolved'],
      message: 'Status must be active, acknowledged, or resolved',
    },
    default: 'active',
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  acknowledgedAt: {
    type: Date,
    default: null,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  message: {
    type: String,
    default: '',
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
}, {
  timestamps: true,
});

// Index for active SOS lookups
sosLogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SosLog', sosLogSchema);
