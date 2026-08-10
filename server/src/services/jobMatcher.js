// Deterministic skill matching (mirrors ai-service matching logic)

const SKILL_ALIASES = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  reactjs: 'react',
  'react.js': 'react',
  react: 'react',
  node: 'nodejs',
  'node.js': 'nodejs',
  nodejs: 'nodejs',
  py: 'python',
  python: 'python',
  'c++': 'cpp',
  cpp: 'cpp',
  ml: 'machine learning',
  'machine learning': 'machine learning',
  ai: 'artificial intelligence',
  'artificial intelligence': 'artificial intelligence',
  genai: 'generative ai',
  'generative ai': 'generative ai',
  'rest api': 'restful api',
  'restful api': 'restful api',
  aws: 'aws',
  docker: 'docker',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  mongodb: 'mongodb',
  mongo: 'mongodb',
  sql: 'sql',
  dsa: 'data structures',
  'data structures': 'data structures',
};

function normalizeSkill(skill) {
  if (!skill) return '';
  const cleaned = skill.toLowerCase().replace(/[^\w\s\+\#\.]/g, ' ').replace(/\s+/g, ' ').trim();
  return SKILL_ALIASES[cleaned] || cleaned;
}

function normalizeSkills(skills) {
  const set = new Set();
  for (const skill of skills || []) {
    const n = normalizeSkill(skill);
    if (n) set.add(n);
  }
  return set;
}

function pct(matched, total) {
  if (total <= 0) return 100;
  return (matched / total) * 100;
}

function roleRelevanceScore(jobTitle, targetRoles) {
  if (!targetRoles?.length) return 70;
  const title = jobTitle.toLowerCase();
  for (const role of targetRoles) {
    const r = role.toLowerCase();
    if (title.includes(r) || r.includes(title)) return 100;
    const rw = new Set(r.split(' '));
    const tw = new Set(title.split(' '));
    for (const w of rw) if (tw.has(w)) return 75;
  }
  return 40;
}

function locationScore(jobLocation, preferred) {
  if (!preferred) return 100;
  const j = jobLocation.toLowerCase();
  const p = preferred.toLowerCase();
  if (j.includes('remote') || p.includes('remote')) return 100;
  if (j.includes(p) || p.includes(j)) return 100;
  if (p.includes('india') && j.includes('india')) return 90;
  return 50;
}

function calculateMatchScore({
  resumeSkills,
  jobRequiredSkills,
  jobPreferredSkills,
  jobTitle,
  jobLocation,
  targetRoles,
  preferredLocation,
}) {
  const resumeSet = normalizeSkills(resumeSkills);
  const requiredSet = normalizeSkills(jobRequiredSkills);
  const preferredSet = normalizeSkills(jobPreferredSkills);

  const reqMatching = [...requiredSet].filter((s) => resumeSet.has(s));
  const reqMissing = [...requiredSet].filter((s) => !resumeSet.has(s));
  const prefMatching = [...preferredSet].filter((s) => resumeSet.has(s));

  const requiredPct = pct(reqMatching.length, requiredSet.size);
  const preferredPct = pct(prefMatching.length, preferredSet.size);
  const rolePct = roleRelevanceScore(jobTitle, targetRoles);
  const locPct = locationScore(jobLocation, preferredLocation);

  const score = Math.round(
    (requiredPct * 50 + preferredPct * 15 + rolePct * 15 + 80 * 10 + 80 * 5 + locPct * 5) / 100
  );
  const clamped = Math.min(100, Math.max(0, score));

  let recommendation = 'Stretch Role';
  if (clamped >= 80) recommendation = 'Strong Match';
  else if (clamped >= 65) recommendation = 'Good Match';
  else if (clamped >= 50) recommendation = 'Moderate Match';

  return {
    score: clamped,
    matching_skills: [...new Set([...reqMatching, ...prefMatching])].sort(),
    missing_skills: reqMissing.sort(),
    partial_matches: prefMatching.sort(),
    recommendation,
  };
}

function buildResumeProfile(parsedResume, extraSkills = []) {
  const skills = [...extraSkills];
  if (parsedResume) {
    skills.push(...(parsedResume.skills || []));
    skills.push(...(parsedResume.programming_languages || parsedResume.programmingLanguages || []));
    skills.push(...(parsedResume.frameworks || []));
    skills.push(...(parsedResume.databases || []));
  }
  return {
    skills: [...new Set(skills.filter(Boolean))],
    target_roles: parsedResume?.target_roles || [],
  };
}

function matchJobs(jobs, profile, { targetRole, preferredLocation, employmentType, search }) {
  const targetRoles = profile.target_roles?.length ? profile.target_roles : [targetRole];
  const searchL = (search || '').toLowerCase().trim();

  return jobs
    .filter((job) => {
      if (employmentType && job.employment_type?.toLowerCase() !== employmentType.toLowerCase()) return false;
      if (!job.is_active) return false;
      if (!searchL) return true;
      const haystack = `${job.title} ${job.company} ${job.location} ${(job.required_skills || []).join(' ')}`.toLowerCase();
      return haystack.includes(searchL);
    })
    .map((job) => ({
      ...job,
      match: calculateMatchScore({
        resumeSkills: profile.skills,
        jobRequiredSkills: job.required_skills || [],
        jobPreferredSkills: job.preferred_skills || [],
        jobTitle: job.title,
        jobLocation: job.location,
        targetRoles,
        preferredLocation: preferredLocation || 'Remote / India',
      }),
    }));
}

module.exports = { calculateMatchScore, buildResumeProfile, matchJobs };
