const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetRole: { type: String, required: true },
  timeframeWeeks: { type: Number, default: 4 },
  weeklyPlan: [{
    weekNumber: Number,
    theme: String,
    goals: [String],
    dailyBreakdown: [{
      day: String,
      focus: String,
      hours: Number,
      activities: [String]
    }]
  }],
  learningResources: [{
    title: String,
    type: String,
    urlOrRef: String
  }],
  recommendedProjects: [{
    title: String,
    keyFeatures: [String],
    techStack: [String]
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
