const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  targetRole: { type: String, required: true },
  resumeScore: { type: Number },
  atsSuggestions: [String],
  missingSkills: [String],
  missingKeywords: [String],
  jdMatchScore: { type: Number },
  matchingSkills: [String],
  strengths: [String],
  weaknesses: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
