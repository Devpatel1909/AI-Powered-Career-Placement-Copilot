import React, { useState } from 'react';
import { GitCompare, CheckCircle2, XCircle, ShieldAlert, Sparkles, Zap, BookOpen } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePersistedState } from '../utils/persistedState';

export default function JDMatcher({ parsedResume, jdMatch, setJdMatch }) {
  const [jobDescription, setJobDescription] = usePersistedState(
    'career_app_job_description',
    "Job Title: Senior AI / Software Engineer\n\nRequirements:\n- Strong experience with Python, React.js, FastAPI, Node.js.\n- Hands-on experience with LLMs (DeepSeek / OpenAI), Prompt Engineering, and RAG pipelines.\n- Experience with Vector Databases (ChromaDB / Pinecone) and Agentic Frameworks (LangChain / LangGraph).\n- Microservices architecture, Docker, MongoDB."
  );
  const [resumeText, setResumeText] = usePersistedState(
    'career_app_resume_text',
    parsedResume ? JSON.stringify(parsedResume, null, 2) : "Upload resume in Module 1 or paste text here."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!resumeText || !jobDescription) {
      setError('Please provide both Resume Text and Job Description.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await apiService.compareJD(resumeText, jobDescription);
      if (res.success) {
        setJdMatch(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to compare Resume vs JD.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-emerald-400" /> Module 3: AI Resume vs Job Description Matcher
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Deep comparative evaluation between candidate profile and target job specifications.
        </p>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Resume Data / Text
          </label>
          <textarea
            rows={8}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-xs font-mono text-gray-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-2">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Target Job Description (JD)
          </label>
          <textarea
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={loading}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" /> Run Deep JD Match Analysis
      </button>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner message="Evaluating Career Readiness & Skill Gaps with DeepSeek..." />}

      {/* Analysis Output */}
      {jdMatch && !loading && (
        <div className="space-y-6">
          {/* Gauge & Key Scores */}
          <div className="glass-card p-6 rounded-2xl border border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center p-4 bg-gray-900/60 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-400 uppercase font-semibold">Career Readiness Score</p>
              <h3 className="text-4xl font-extrabold text-emerald-400 mt-1">{jdMatch.career_readiness_score}%</h3>
            </div>

            <div className="md:col-span-2 space-y-2">
              <h4 className="text-md font-bold text-gray-100">Matching vs Missing Skill Summary</h4>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-emerald-400 font-semibold">{jdMatch.matching_skills.length} Matching Skills</span>
                <span className="text-gray-600">•</span>
                <span className="text-xs text-rose-400 font-semibold">{jdMatch.missing_skills.length} Skill Gaps</span>
              </div>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-3">
              <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Matching Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {jdMatch.matching_skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg font-mono">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-3">
              <h3 className="text-md font-bold text-rose-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Missing Skills / Gaps
              </h3>
              <div className="flex flex-wrap gap-2">
                {jdMatch.missing_skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg font-mono">
                    ✗ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Skill Matrix */}
          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> Priority Skills Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {jdMatch.priority_skills.map((ps, i) => (
                <div key={i} className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-200 text-sm">{ps.skill}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      ps.importance === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {ps.importance}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{ps.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
