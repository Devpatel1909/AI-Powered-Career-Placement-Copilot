const mongoose = require('mongoose');

const JobListingSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  workMode: String,
  matchScore: Number,
  salaryRange: String,
  requiredSkills: [String],
  matchingSkills: [String],
  missingSkills: [String],
  whyRecommended: String,
  applicationTips: [String],
}, { _id: false });

const JobRecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  targetRole: { type: String, required: true },
  candidateSummary: String,
  targetRoles: [String],
  recommendedJobs: [JobListingSchema],
  marketInsights: [String],
  nextSteps: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('JobRecommendation', JobRecommendationSchema);
