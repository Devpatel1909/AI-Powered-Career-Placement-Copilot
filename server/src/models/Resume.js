const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filename: { type: String, required: true },
  rawText: { type: String },
  parsedData: {
    name: String,
    email: String,
    phone: String,
    skills: [String],
    programmingLanguages: [String],
    frameworks: [String],
    databases: [String],
    projects: [{
      title: String,
      description: String,
      techStack: [String],
      link: String
    }],
    education: [{
      institution: String,
      degree: String,
      year: String,
      score: String
    }],
    experience: [{
      company: String,
      role: String,
      duration: String,
      highlights: [String]
    }],
    achievements: [String],
    certifications: [String],
    softSkills: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', ResumeSchema);
