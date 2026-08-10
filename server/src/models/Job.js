const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  source: { type: String, required: true },
  sourceJobId: { type: String, required: true },
  company: { type: String, required: true, index: true },
  title: { type: String, required: true, index: true },
  location: { type: String, default: 'Remote', index: true },
  employmentType: {
    type: String,
    enum: ['Internship', 'Full-time', 'Part-time'],
    default: 'Full-time',
    index: true,
  },
  description: { type: String, default: '' },
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  educationRequirements: [{ type: String }],
  experienceRequirements: [{ type: String }],
  graduationYear: { type: Number },
  jobUrl: { type: String, required: true },
  postedAt: { type: Date },
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true, index: true },
  contentHash: { type: String },
}, { timestamps: true });

JobSchema.index({ source: 1, sourceJobId: 1 }, { unique: true });
JobSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Job', JobSchema);
