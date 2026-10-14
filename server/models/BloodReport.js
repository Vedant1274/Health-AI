const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
  parameter: { type: String, required: true },
  value: { type: String, required: true },
  normalRange: { type: String, required: true },
  flag: {
    type: String,
    enum: ['normal', 'low', 'high', 'critical'],
    default: 'normal',
  },
  explanation: { type: String, default: '' },
}, { _id: false });

const bloodReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  symptomCheckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SymptomCheck',
    default: null,
  },
  fileUrl: {
    type: String,
    default: '',
  },
  rawText: {
    type: String,
    default: '',
  },
  extractedText: {
    type: String,
    default: '',
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'text'],
    default: 'text',
  },
  originalFilename: {
    type: String,
    default: '',
  },
  documentName: {
    type: String,
    default: '',
  },
  analysis: {
    status: {
      type: String,
      enum: ['pending', 'normal', 'attention', 'error'],
      default: 'pending',
    },
    findings: [findingSchema],
    summary: {
      type: String,
      default: '',
    },
    analyzedAt: {
      type: Date,
      default: null,
    },
  },
}, {
  timestamps: true,
});

// Index for user's reports
bloodReportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('BloodReport', bloodReportSchema);
