import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Sparkles, Award, Code, Database, Briefcase } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResumeAnalyzer({ parsedResume, setParsedResume, improvement, setImprovement }) {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a PDF resume file first.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await apiService.uploadResume(file, targetRole);
      if (res.success) {
        setParsedResume(res.data.parsed);
        setImprovement(res.data.improvement);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume. Make sure FastAPI/Node server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" /> Module 1 & 2: Resume Parser & AI Improver
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Extracts structured JSON fields using DeepSeek V4 Flash and delivers granular ATS score & content feedback.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Upload PDF Resume
            </label>
            <div className="border-2 border-dashed border-gray-700 hover:border-blue-500/50 rounded-xl p-4 text-center cursor-pointer transition-all bg-gray-900/40">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                className="hidden" 
                id="resume-file-input"
              />
              <label htmlFor="resume-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">
                  {file ? file.name : 'Click to upload or drag & drop PDF resume'}
                </span>
                <span className="text-xs text-gray-500">Max size 10MB PDF</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Target Job Role
            </label>
            <input 
              type="text" 
              value={targetRole} 
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g. Full Stack Developer, AI Engineer"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-3 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Run AI Resume Analysis
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /> {error}
          </div>
        )}
      </div>

      {loading && <LoadingSpinner message="Parsing PDF & Analyzing with DeepSeek..." />}

      {/* Results View */}
      {parsedResume && improvement && !loading && (
        <div className="space-y-6">
          {/* ATS Score & Overview */}
          <div className="glass-card p-6 rounded-2xl border border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="text-center p-4 bg-gray-900/60 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-400 uppercase font-semibold">ATS Quality Score</p>
              <h3 className="text-4xl font-extrabold text-blue-400 mt-1">{improvement.resume_score}<span className="text-lg text-gray-500">/100</span></h3>
            </div>
            
            <div className="md:col-span-3 space-y-2">
              <h4 className="text-lg font-bold text-gray-100">{parsedResume.name || 'Candidate Profile'}</h4>
              <p className="text-xs text-gray-400">📧 {parsedResume.email || 'N/A'} • 📱 {parsedResume.phone || 'N/A'}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {parsedResume.programming_languages.map((lang, i) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs rounded-full">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section Feedback & Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> ATS Suggestions & Missing Keywords
              </h3>
              
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Missing Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {improvement.missing_keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-full">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Actionable ATS Suggestions</p>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {improvement.ats_suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span> {sug}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> Project & Section Recommendations
              </h3>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Project Bullet Upgrades</p>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {improvement.project_improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Recommended Certifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {improvement.certification_suggestions.map((cert, i) => (
                    <span key={i} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs rounded-full">
                      📜 {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Extracted Resume Raw JSON Viewer */}
          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-3">
            <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" /> Extracted Structured Resume (JSON)
            </h3>
            <pre className="bg-gray-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-80 border border-gray-800">
              {JSON.stringify(parsedResume, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
