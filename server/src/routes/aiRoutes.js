const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const aiController = require('../controllers/aiController');

// Module 1 & 2: Resume Upload & Analysis
router.post('/uploadResume', upload.single('resume'), aiController.uploadAndAnalyzeResume);

// Module 3: Resume vs Job Description
router.post('/compareJD', aiController.compareJD);

// Module 4: Learning Roadmap
router.post('/roadmap', aiController.generateRoadmap);

// Module 5: Interview Questions
router.post('/generateQuestions', aiController.generateQuestions);

// Module 6: AI Career Chatbot
router.post('/chat', aiController.chat);

// Module 7: Agentic AI Workflow
router.post('/agent', aiController.agentWorkflow);

// Module 8: RAG Knowledge Base
router.post('/rag/ingest', aiController.ragIngest);
router.post('/rag/query', aiController.ragQuery);

// Module 9: Personalized Job Recommendations
router.post('/personalizedJobs', aiController.getPersonalizedJobs);

module.exports = router;
