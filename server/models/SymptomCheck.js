const mongoose = require('mongoose');

const symptomCheckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Symptom description is required'],
    trim: true,
    minlength: [10, 'Please describe your symptoms in more detail (at least 10 characters)'],
    maxlength: [2000, 'Symptom description cannot exceed 2000 characters'],
  },
  aiResponse: {
    possibleConditions: {
      type: [String],
      default: [],
    },
    recommendedTests: [{
      test: { type: String, required: true },
      reason: { type: String, required: true },
    }],
    urgency: {
      type: String,
      enum: ['routine', 'soon', 'urgent'],
      default: 'routine',
    },
  },
}, {
  timestamps: true,
});

// Index for user history queries
symptomCheckSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SymptomCheck', symptomCheckSchema);
