const crypto = require('crypto');
const axios = require('axios');
const Job = require('../models/Job');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const SYNC_TIMEOUT_MS = 180000; // 3 minutes

function hashJob(job) {
  const payload = JSON.stringify({
    title: job.title,
    location: job.location,
    employmentType: job.employment_type || job.employmentType,
    description: (job.description || '').slice(0, 500),
    requiredSkills: job.required_skills || job.requiredSkills || [],
  });
  return crypto.createHash('md5').update(payload).digest('hex');
}

function toMongoDoc(normalized) {
  return {
    source: normalized.source,
    sourceJobId: normalized.source_job_id,
    company: normalized.company,
    title: normalized.title,
    location: normalized.location,
    employmentType: normalized.employment_type,
    description: normalized.description || '',
    requiredSkills: normalized.required_skills || [],
    preferredSkills: normalized.preferred_skills || [],
    educationRequirements: normalized.education_requirements || [],
    experienceRequirements: normalized.experience_requirements || [],
    graduationYear: normalized.graduation_year || null,
    jobUrl: normalized.job_url,
    postedAt: normalized.posted_at ? new Date(normalized.posted_at) : null,
    lastUpdated: normalized.last_updated ? new Date(normalized.last_updated) : new Date(),
    isActive: normalized.is_active !== false,
    contentHash: hashJob(normalized),
  };
}

function toApiJob(doc) {
  return {
    id: doc._id.toString(),
    source: doc.source,
    source_job_id: doc.sourceJobId,
    company: doc.company,
    title: doc.title,
    location: doc.location,
    employment_type: doc.employmentType,
    description: doc.description,
    required_skills: doc.requiredSkills,
    preferred_skills: doc.preferredSkills,
    education_requirements: doc.educationRequirements,
    experience_requirements: doc.experienceRequirements,
    graduation_year: doc.graduationYear,
    job_url: doc.jobUrl,
    posted_at: doc.postedAt,
    last_updated: doc.lastUpdated,
    is_active: doc.isActive,
  };
}

async function syncJobsFromAI() {
  const response = await axios.post(
    `${AI_SERVICE_URL}/api/ai/jobs/refresh`,
    {},
    { timeout: SYNC_TIMEOUT_MS }
  );
  const fetched = response.data.jobs || [];

  if (fetched.length === 0) {
    return {
      sources_checked: 1,
      jobs_fetched: 0,
      new_jobs: 0,
      updated_jobs: 0,
      unchanged_jobs: 0,
    };
  }

  // Bulk upsert — much faster than one-by-one
  const bulkOps = fetched.map((job) => {
    const doc = toMongoDoc(job);
    return {
      updateOne: {
        filter: { source: doc.source, sourceJobId: doc.sourceJobId },
        update: { $set: doc },
        upsert: true,
      },
    };
  });

  const result = await Job.bulkWrite(bulkOps, { ordered: false });

  return {
    sources_checked: 1,
    jobs_fetched: fetched.length,
    new_jobs: result.upsertedCount || 0,
    updated_jobs: result.modifiedCount || 0,
    unchanged_jobs: Math.max(0, fetched.length - (result.upsertedCount || 0) - (result.modifiedCount || 0)),
  };
}

async function getLastUpdated() {
  const latest = await Job.findOne({ isActive: true }).sort({ lastUpdated: -1 }).select('lastUpdated');
  return latest ? latest.lastUpdated : null;
}

module.exports = {
  hashJob,
  toMongoDoc,
  toApiJob,
  syncJobsFromAI,
  getLastUpdated,
};
