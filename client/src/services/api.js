import axios from 'axios';

const API_BASE = '/api';

export const apiService = {
  // Module 1 & 2: Upload and Analyze Resume
  uploadResume: async (file, targetRole = 'Software Engineer') => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);

    const response = await axios.post(`${API_BASE}/uploadResume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Module 3: Compare Resume vs JD
  compareJD: async (resumeText, jobDescription) => {
    const response = await axios.post(`${API_BASE}/compareJD`, {
      resumeText,
      jobDescription
    });
    return response.data;
  },

  // Module 4: Generate Roadmap
  generateRoadmap: async (missingSkills, targetRole, hours = 15, weeks = 4) => {
    const response = await axios.post(`${API_BASE}/roadmap`, {
      missingSkills,
      targetRole,
      availableHoursPerWeek: hours,
      durationWeeks: weeks
    });
    return response.data;
  },

  // Module 5: Generate Interview Questions
  generateQuestions: async (resumeText, jobDescription, targetRole) => {
    const response = await axios.post(`${API_BASE}/generateQuestions`, {
      resumeText,
      jobDescription,
      targetRole
    });
    return response.data;
  },

  // Module 6: Career Chatbot
  sendChatMessage: async (query, history = [], useRag = false) => {
    const response = await axios.post(`${API_BASE}/chat`, {
      query,
      history,
      useRag
    });
    return response.data;
  },

  // Module 7: Agent Workflow
  runAgent: async (userQuery, resumeText = '', jobDescription = '', targetRole = 'Software Engineer') => {
    const response = await axios.post(`${API_BASE}/agent`, {
      userQuery,
      resumeText,
      jobDescription,
      targetRole
    });
    return response.data;
  },

  // Module 8: RAG Knowledge Base
  ingestDocument: async (documentTitle, category, content) => {
    const response = await axios.post(`${API_BASE}/rag/ingest`, {
      documentTitle,
      category,
      content
    });
    return response.data;
  },

  queryRAG: async (query) => {
    const response = await axios.post(`${API_BASE}/rag/query`, { query });
    return response.data;
  },

  // Module 9: Personalized Job Recommendations (legacy LLM)
  getPersonalizedJobs: async ({
    resumeText,
    targetRole = 'Software Engineer',
    skills = [],
    missingSkills = [],
    careerReadinessScore = null,
    preferredLocation = 'Remote / India',
    useRag = true,
  }) => {
    const response = await axios.post(`${API_BASE}/personalizedJobs`, {
      resumeText,
      targetRole,
      skills,
      missingSkills,
      careerReadinessScore,
      preferredLocation,
      useRag,
    });
    return response.data;
  },

  // Dynamic Job Board
  refreshJobs: async () => {
    const response = await axios.post(`${API_BASE}/jobs/refresh`, {}, { timeout: 180000 });
    return response.data;
  },

  getJobStats: async () => {
    const response = await axios.get(`${API_BASE}/jobs/stats`);
    return response.data;
  },

  getJobRecommendations: async (filters = {}, parsedResume = null) => {
    const response = await axios.post(`${API_BASE}/jobs/recommendations`, {
      parsedResume,
      skills: filters.skills || [],
    }, {
      params: {
        search: filters.search || '',
        location: filters.location || '',
        employment_type: filters.employmentType || '',
        role: filters.role || 'Software Engineer',
        page: filters.page || 1,
        limit: filters.limit || 20,
        sort: filters.sort || 'match_score',
      },
    });
    return response.data;
  },

  explainJobMatch: async (jobId, parsedResume, matchResult) => {
    const response = await axios.post(`${API_BASE}/jobs/${jobId}/explain`, {
      parsedResume,
      matchResult,
    });
    return response.data;
  },
};
