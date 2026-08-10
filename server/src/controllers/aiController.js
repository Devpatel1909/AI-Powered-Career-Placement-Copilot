const axios = require('axios');
const Resume = require('../models/Resume');
const Report = require('../models/Report');
const Roadmap = require('../models/Roadmap');
const Chat = require('../models/Chat');
const InterviewHistory = require('../models/InterviewHistory');
const JobRecommendation = require('../models/JobRecommendation');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// 1. Upload & Analyze Resume
exports.uploadAndAnalyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
    }

    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', req.file.buffer, { filename: req.file.originalname });

    // Step A: Extract PDF Text
    const uploadRes = await axios.post(`${AI_SERVICE_URL}/api/ai/upload-resume`, formData, {
      headers: formData.getHeaders()
    });

    const extractedText = uploadRes.data.extracted_text;
    const targetRole = req.body.targetRole || 'Software Engineer';

    // Step B: Call AI Service for Analysis & Improvement
    const analyzeRes = await axios.post(`${AI_SERVICE_URL}/api/ai/analyze-resume`, {
      resume_text: extractedText,
      target_role: targetRole
    });

    const parsedResume = analyzeRes.data.parsed_resume;
    const improvement = analyzeRes.data.improvement_analysis;

    // Optional MongoDB Save
    let savedResume = null;
    try {
      savedResume = await Resume.create({
        filename: req.file.originalname,
        rawText: extractedText,
        parsedData: parsedResume
      });
      await Report.create({
        resumeId: savedResume._id,
        targetRole: targetRole,
        resumeScore: improvement.resume_score,
        atsSuggestions: improvement.ats_suggestions,
        missingSkills: improvement.missing_skills,
        missingKeywords: improvement.missing_keywords
      });
    } catch (dbErr) {
      console.warn('[DB Persist Warning]:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        resumeId: savedResume ? savedResume._id : null,
        filename: req.file.originalname,
        extractedText: extractedText,
        parsed: parsedResume,
        improvement: improvement
      }
    });

  } catch (error) {
    next(error);
  }
};

// 2. Compare Resume vs Job Description
exports.compareJD = async (req, res, next) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ success: false, message: 'Both resumeText and jobDescription are required.' });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/compare-jd`, {
      resume_text: resumeText,
      job_description: jobDescription
    });

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};

// 3. Generate Roadmap
exports.generateRoadmap = async (req, res, next) => {
  try {
    const { missingSkills, targetRole, availableHoursPerWeek, durationWeeks } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/roadmap`, {
      missing_skills: missingSkills || [],
      target_role: targetRole || 'Software Engineer',
      available_hours_per_week: availableHoursPerWeek || 15,
      duration_weeks: durationWeeks || 4
    });

    // Optional DB Save
    try {
      await Roadmap.create({
        targetRole: targetRole || 'Software Engineer',
        timeframeWeeks: response.data.timeframe_weeks,
        weeklyPlan: response.data.weekly_plan,
        learningResources: response.data.learning_resources,
        recommendedProjects: response.data.recommended_projects
      });
    } catch (dbErr) {
      console.warn('[DB Persist Warning]:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};

// 4. Generate Interview Questions
exports.generateQuestions = async (req, res, next) => {
  try {
    const { resumeText, jobDescription, targetRole } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-questions`, {
      resume_text: resumeText || '',
      job_description: jobDescription || '',
      target_role: targetRole || 'Software Engineer'
    });

    // Optional DB Save
    try {
      await InterviewHistory.create({
        targetRole: targetRole || 'Software Engineer',
        questions: [
          ...response.data.technical_questions,
          ...response.data.behavioral_questions,
          ...response.data.project_questions
        ]
      });
    } catch (dbErr) {
      console.warn('[DB Persist Warning]:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};

// 5. Chatbot
exports.chat = async (req, res, next) => {
  try {
    const { query, history, useRag } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/chat`, {
      query,
      history: history || [],
      use_rag: !!useRag
    });

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};

// 6. Agent Workflow
exports.agentWorkflow = async (req, res, next) => {
  try {
    const { userQuery, resumeText, jobDescription, targetRole } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/agent`, {
      user_query: userQuery,
      resume_text: resumeText,
      job_description: jobDescription,
      target_role: targetRole || 'Software Engineer'
    });

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};

// 7. RAG Ingest & Query
exports.ragIngest = async (req, res, next) => {
  try {
    const { documentTitle, category, content } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/rag/ingest`, {
      document_title: documentTitle,
      category,
      content
    });

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};

exports.ragQuery = async (req, res, next) => {
  try {
    const { query } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/rag/query`, { query });

    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    next(error);
  }
};

// 8. Personalized Job Recommendations
exports.getPersonalizedJobs = async (req, res, next) => {
  try {
    const {
      resumeText,
      targetRole,
      skills,
      missingSkills,
      careerReadinessScore,
      preferredLocation,
      useRag,
    } = req.body;

    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'resumeText is required.' });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/personalized-jobs`, {
      resume_text: resumeText,
      target_role: targetRole || 'Software Engineer',
      skills: skills || [],
      missing_skills: missingSkills || [],
      career_readiness_score: careerReadinessScore ?? null,
      preferred_location: preferredLocation || 'Remote / India',
      use_rag: useRag !== false,
    });

    try {
      await JobRecommendation.create({
        targetRole: targetRole || 'Software Engineer',
        candidateSummary: response.data.candidate_summary,
        targetRoles: response.data.target_roles,
        recommendedJobs: response.data.recommended_jobs.map((job) => ({
          title: job.title,
          company: job.company,
          location: job.location,
          workMode: job.work_mode,
          matchScore: job.match_score,
          salaryRange: job.salary_range,
          requiredSkills: job.required_skills,
          matchingSkills: job.matching_skills,
          missingSkills: job.missing_skills,
          whyRecommended: job.why_recommended,
          applicationTips: job.application_tips,
        })),
        marketInsights: response.data.market_insights,
        nextSteps: response.data.next_steps,
      });
    } catch (dbErr) {
      console.warn('[DB Persist Warning]:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    next(error);
  }
};
