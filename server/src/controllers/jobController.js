const axios = require('axios');
const Job = require('../models/Job');
const { syncJobsFromAI, toApiJob, getLastUpdated } = require('../services/jobSyncService');
const { buildResumeProfile, matchJobs } = require('../services/jobMatcher');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const MAX_JOBS_TO_MATCH = 150;

// POST /api/jobs/refresh
exports.refreshJobs = async (req, res, next) => {
  try {
    // Verify AI service is reachable before long sync
    try {
      await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 5000 });
    } catch {
      return res.status(503).json({
        success: false,
        message: 'AI service is not running. Start it first: cd ai-service && python main.py',
      });
    }

    const stats = await syncJobsFromAI();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        message: 'Job sync timed out. Check AI service logs and internet connection.',
      });
    }
    next(error);
  }
};

// GET/POST /api/jobs/recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const {
      search = '',
      location = '',
      employment_type: employmentType = '',
      role = 'Software Engineer',
      skills = '',
      page = '1',
      limit = '20',
      sort = 'match_score',
    } = req.query;

    const parsedResume = req.body?.parsedResume || null;
    const extraSkills = req.body?.skills || [];

    const filter = { isActive: true };
    if (employmentType) filter.employmentType = employmentType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { requiredSkills: { $regex: search, $options: 'i' } },
      ];
    }

    // Limit DB fetch for speed — no full description needed for matching
    const jobsFromDb = await Job.find(filter)
      .select('-description')
      .sort({ lastUpdated: -1 })
      .limit(MAX_JOBS_TO_MATCH)
      .lean();

    if (jobsFromDb.length === 0) {
      const lastUpdated = await getLastUpdated();
      return res.status(200).json({
        success: true,
        data: { jobs: [], total: 0, page: 1, limit: 20, last_updated: lastUpdated },
      });
    }

    let resumeSkills = [...extraSkills];
    if (typeof skills === 'string' && skills) {
      resumeSkills.push(...skills.split(',').map((s) => s.trim()).filter(Boolean));
    }

    const profile = buildResumeProfile(parsedResume, resumeSkills);
    const jobPayload = jobsFromDb.map(toApiJob);

    // Fast in-process matching (no FastAPI HTTP call)
    let matchedJobs = matchJobs(jobPayload, profile, {
      targetRole: role,
      preferredLocation: location || 'Remote / India',
      employmentType: employmentType || null,
      search: search || null,
    });

    if (sort === 'latest') {
      matchedJobs.sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0));
    } else if (sort === 'company') {
      matchedJobs.sort((a, b) => a.company.localeCompare(b.company));
    } else {
      matchedJobs.sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const total = matchedJobs.length;
    const start = (pageNum - 1) * limitNum;
    const paginated = matchedJobs.slice(start, start + limitNum);

    const lastUpdated = await getLastUpdated();

    return res.status(200).json({
      success: true,
      data: {
        jobs: paginated,
        total,
        page: pageNum,
        limit: limitNum,
        last_updated: lastUpdated,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.postRecommendations = exports.getRecommendations;

// POST /api/jobs/:id/explain
exports.explainJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { parsedResume, matchResult } = req.body;

    if (!parsedResume || !matchResult) {
      return res.status(400).json({ success: false, message: 'parsedResume and matchResult are required.' });
    }

    const jobDoc = await Job.findById(id).lean();
    if (!jobDoc) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const job = toApiJob(jobDoc);

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/jobs/explain`,
      { parsed_resume: parsedResume, job, match_result: matchResult },
      { timeout: 60000 }
    );

    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/stats
exports.getJobStats = async (req, res, next) => {
  try {
    const total = await Job.countDocuments({ isActive: true });
    const internships = await Job.countDocuments({ isActive: true, employmentType: 'Internship' });
    const lastUpdated = await getLastUpdated();
    return res.status(200).json({
      success: true,
      data: { total, internships, last_updated: lastUpdated },
    });
  } catch (error) {
    next(error);
  }
};
