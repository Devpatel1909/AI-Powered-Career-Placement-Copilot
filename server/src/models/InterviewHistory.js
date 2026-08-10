const mongoose = require('mongoose');

const InterviewHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetRole: { type: String, required: true },
  questions: [{
    category: String,
    question: String,
    difficulty: String,
    idealAnswerPoints: [String],
    followUpQuestions: [String]
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InterviewHistory', InterviewHistorySchema);
