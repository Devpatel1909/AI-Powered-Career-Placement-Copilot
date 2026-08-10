import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  MapPin,
  Building2,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function MatchBadge({ score }) {
  const color =
    score >= 80 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
    score >= 65 ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
    score >= 50 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
    'bg-rose-500/20 text-rose-300 border-rose-500/40';

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
      {score}% Match
    </span>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function PersonalizedJobsView({
  parsedResume,
  improvement,
  jdMatch,
  setActiveTab,
  setJdMatch,
  setRoadmap,
}) {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('India');
  const [employmentType, setEmploymentType] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [sort, setSort] = useState('match_score');
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [explainJob, setExplainJob] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiService.getJobStats();
      if (res.success) setStats(res.data);
    } catch {
      // stats optional
    }
  }, []);

  const fetchJobs = useCallback(async (pageOverride) => {
    const currentPage = pageOverride ?? page;
    setError(null);
    setLoading(true);
    try {
      const res = await apiService.getJobRecommendations(
        { search, location, employmentType, role, sort, page: currentPage, limit: 20 },
        parsedResume
      );
      if (res.success) {
        setJobs(res.data.jobs || []);
        setTotal(res.data.total || 0);
        setLastUpdated(res.data.last_updated);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job recommendations.');
    } finally {
      setLoading(false);
    }
  }, [search, location, employmentType, role, sort, page, parsedResume]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFindJobs = () => {
    setPage(1);
    setHasSearched(true);
    fetchJobs(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setHasSearched(true);
    fetchJobs(newPage);
  };

  const handleRefreshJobs = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await apiService.refreshJobs();
      if (res.success) {
        await fetchStats();
        handleFindJobs();
      }
    } catch (err) {
      const msg = err.code === 'ECONNABORTED'
        ? 'Sync timed out. Ensure AI service is running on port 8000, then try again.'
        : (err.response?.data?.message || err.message || 'Failed to refresh jobs from sources.');
      setError(msg);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExplain = async (job) => {
    if (!parsedResume) {
      setError('Upload your resume in Module 1 to get AI explanations.');
      return;
    }
    setExplainJob(job);
    setExplaining(true);
    setExplanation(null);
    try {
      const res = await apiService.explainJobMatch(job.id, parsedResume, job.match);
      if (res.success) setExplanation(res.data);
    } catch (err) {
      setExplanation({ reason: err.response?.data?.message || 'Explanation failed.' });
    } finally {
      setExplaining(false);
    }
  };

  const handlePrepare = (job) => {
    if (setJdMatch) {
      setJdMatch({
        career_readiness_score: job.match?.score || 0,
        missing_skills: job.match?.missing_skills || [],
        matching_skills: job.match?.matching_skills || [],
        strengths: explanation?.strengths || [],
        weaknesses: job.match?.missing_skills || [],
      });
    }
    // Store job description context for interview/roadmap modules
    sessionStorage.setItem('prepareJobDescription', job.description || job.title);
    sessionStorage.setItem('prepareMissingSkills', JSON.stringify(job.match?.missing_skills || []));
    setActiveTab('roadmap');
  };

  const recommendedForYou = parsedResume
    ? [...jobs].filter((j) => j.match?.score >= 65).slice(0, 4)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-400" /> Job Recommendations
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real jobs from public boards, matched to your resume with deterministic scoring.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {lastUpdated && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Last updated: {timeAgo(lastUpdated)}
            </span>
          )}
          {stats && (
            <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700">
              {stats.total} jobs · {stats.internships} internships
            </span>
          )}
          <button
            onClick={handleRefreshJobs}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:border-blue-500 text-gray-300 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <Filter className="w-4 h-4" /> Search & Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              placeholder="Search title, company, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFindJobs()}
              className="w-full pl-9 p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <input
            placeholder="Location (e.g. India, Remote)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          />
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Job Types</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
          </select>
          <input
            placeholder="Target role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="match_score">Sort: Match Score</option>
            <option value="latest">Sort: Latest</option>
            <option value="company">Sort: Company</option>
          </select>
        </div>

        {/* Find Jobs button */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleFindJobs}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Searching...' : 'Find Jobs'}
          </button>
          <button
            onClick={handleRefreshJobs}
            disabled={refreshing}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 text-gray-200 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Fetching from Greenhouse...' : 'Sync New Jobs'}
          </button>
          <span className="text-xs text-gray-500">Sync runs once · Find Jobs searches stored jobs (fast)</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`px-3 py-1 rounded-full border ${parsedResume ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
            {parsedResume ? '✓ Resume loaded — personalized matching active' : '⚠ Upload resume in Module 1 for personalized scores'}
          </span>
          {employmentType === 'Internship' && (
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
              Showing internships only
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading && <LoadingSpinner message={refreshing ? 'Syncing jobs from Greenhouse (30-60 sec)...' : 'Finding matching jobs...'} />}

      {/* Recommended For You */}
      {!loading && hasSearched && parsedResume && recommendedForYou.length > 0 && (
        <div className="glass-card p-5 rounded-2xl border border-blue-500/20 bg-blue-950/20 space-y-3">
          <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Recommended For You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendedForYou.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-900/60 rounded-xl border border-gray-800 text-sm">
                <div>
                  <span className="font-bold text-emerald-400">{job.match?.score}%</span>
                  <span className="text-gray-300 ml-2">{job.title}</span>
                  <p className="text-xs text-gray-500">{job.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job list */}
      {!loading && !hasSearched && (
        <div className="glass-card p-10 rounded-2xl border border-gray-800 text-center space-y-4">
          <Briefcase className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-gray-400 text-sm">
            Set your filters above, then click <strong className="text-blue-400">Find Jobs</strong> to search.
          </p>
          <p className="text-gray-500 text-xs">
            First time? Click <strong>Sync New Jobs</strong> once to load jobs from Greenhouse (takes ~30-60 sec).
          </p>
        </div>
      )}

      {!loading && hasSearched && jobs.length === 0 && (
        <div className="glass-card p-10 rounded-2xl border border-gray-800 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-gray-400 text-sm">No jobs found for your filters. Try <strong>Sync New Jobs</strong> or change filters.</p>
        </div>
      )}

      {!loading && hasSearched && jobs.map((job) => (
        <div key={job.id} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-bold text-gray-100">{job.title}</h4>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {job.company}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {job.employment_type}
                </span>
              </div>
            </div>
            {parsedResume && job.match && <MatchBadge score={job.match.score} />}
          </div>

          {parsedResume && job.match && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                <p className="font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Matching Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {(job.match.matching_skills || []).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">✓ {s}</span>
                  ))}
                  {(job.match.matching_skills || []).length === 0 && <span className="text-gray-500">None detected</span>}
                </div>
              </div>
              <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                <p className="font-semibold text-rose-400 mb-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Missing Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {(job.match.missing_skills || []).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300">⚠ {s}</span>
                  ))}
                  {(job.match.missing_skills || []).length === 0 && <span className="text-gray-500">None</span>}
                </div>
              </div>
            </div>
          )}

          {parsedResume && job.match && (
            <p className="text-sm text-gray-400">
              Recommendation: <span className="text-blue-300 font-semibold">{job.match.recommendation}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Job
            </a>
            {parsedResume && (
              <>
                <button
                  onClick={() => handleExplain(job)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Why Am I a Match?
                </button>
                <button
                  onClick={() => handlePrepare(job)}
                  className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Prepare For This Job
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      {!loading && hasSearched && total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-xs text-gray-400">Page {page} of {Math.ceil(total / 20)}</span>
          <button
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => handlePageChange(page + 1)}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Explain Modal */}
      {explainJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-2xl border border-gray-700 max-w-lg w-full max-h-[80vh] overflow-y-auto space-y-4">
            <h3 className="text-lg font-bold text-gray-100">{explainJob.title} — Match Analysis</h3>
            {explaining && <LoadingSpinner message="Generating AI explanation..." />}
            {explanation && !explaining && (
              <div className="space-y-3 text-sm text-gray-300">
                <p><strong className="text-blue-300">Recommendation:</strong> {explanation.recommendation}</p>
                <p>{explanation.reason}</p>
                {explanation.strengths?.length > 0 && (
                  <div>
                    <p className="font-semibold text-emerald-400 mb-1">Strengths</p>
                    <ul className="list-disc list-inside text-xs text-gray-400">
                      {explanation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {explanation.priority_skills?.length > 0 && (
                  <div>
                    <p className="font-semibold text-amber-400 mb-1">Priority Skills to Learn</p>
                    <div className="flex flex-wrap gap-1">
                      {explanation.priority_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {explanation.preparation_advice?.length > 0 && (
                  <div>
                    <p className="font-semibold text-purple-400 mb-1">Preparation Advice</p>
                    <ul className="list-disc list-inside text-xs text-gray-400">
                      {explanation.preparation_advice.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => { setExplainJob(null); setExplanation(null); }}
              className="w-full py-2 rounded-xl bg-gray-800 text-gray-300 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
