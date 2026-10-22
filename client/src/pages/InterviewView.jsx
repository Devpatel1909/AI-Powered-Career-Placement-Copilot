import React, { useState } from 'react';
import { HelpCircle, Code, UserCheck, Briefcase, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePersistedState } from '../utils/persistedState';

export default function InterviewView({ parsedResume, jdMatch }) {
  const [targetRole, setTargetRole] = usePersistedState('career_app_interview_target_role', 'Software Engineer');
  const [questions, setQuestions] = usePersistedState('career_app_questions', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);

    try {
      const resumeStr = parsedResume ? JSON.stringify(parsedResume) : "Candidate with Python, React, FastAPI, SQL, Microservices.";
      const jdStr = jdMatch ? JSON.stringify(jdMatch) : "Senior AI / Software Engineer position requiring DSA, LLMs, System Design.";
      
      const res = await apiService.generateQuestions(resumeStr, jdStr, targetRole);
      if (res.success) {
        setQuestions(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-amber-400" /> Module 5: AI Interview Question Generator
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Generates technical, behavioral, resume-based, project deep-dive, and coding questions with ideal answers.
        </p>
      </div>

      {/* Control Banner */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-100 focus:outline-none focus:border-amber-500"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Generate Interview Set
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner message="Generating Tailored Technical & Behavioral Questions..." />}

      {questions && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Total Generated Questions: {questions.total_questions}</span>
            <span>Target: {questions.target_role}</span>
          </div>

          {/* Render Question Categories */}
          {[
            { title: 'Technical Questions', list: questions.technical_questions, icon: Code, color: 'text-blue-400' },
            { title: 'Behavioral Questions', list: questions.behavioral_questions, icon: UserCheck, color: 'text-emerald-400' },
            { title: 'Project Deep Dives', list: questions.project_questions, icon: Briefcase, color: 'text-purple-400' },
            { title: 'Coding Challenges', list: questions.coding_questions, icon: Code, color: 'text-amber-400' }
          ].map((cat, catIdx) => (
            <div key={catIdx} className="space-y-3">
              <h3 className={`text-md font-bold ${cat.color} flex items-center gap-2`}>
                <cat.icon className="w-5 h-5" /> {cat.title}
              </h3>

              <div className="space-y-3">
                {cat.list.map((q, qIdx) => {
                  const globalIdx = `${catIdx}-${qIdx}`;
                  const isExpanded = expandedIndex === globalIdx;
                  return (
                    <div key={qIdx} className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
                      <div 
                        onClick={() => toggleExpand(globalIdx)}
                        className="p-4 bg-gray-900/60 cursor-pointer flex items-center justify-between hover:bg-gray-900/90 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              q.difficulty === 'Hard' ? 'bg-rose-500/20 text-rose-300' : 
                              q.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">{q.category}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-200">{q.question}</p>
                        </div>

                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>

                      {isExpanded && (
                        <div className="p-5 space-y-3 border-t border-gray-800/80 bg-gray-950/60 text-xs">
                          {q.context_or_trigger && (
                            <p className="text-gray-400">
                              <strong className="text-gray-300">Why asked:</strong> {q.context_or_trigger}
                            </p>
                          )}

                          <div>
                            <p className="font-semibold text-emerald-400 mb-1">Ideal Answer Highlights:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-300">
                              {q.ideal_answer_points.map((pt, pIdx) => (
                                <li key={pIdx}>{pt}</li>
                              ))}
                            </ul>
                          </div>

                          {q.follow_up_questions && q.follow_up_questions.length > 0 && (
                            <div>
                              <p className="font-semibold text-amber-400 mb-1">Follow-up Probing Questions:</p>
                              <ul className="list-disc list-inside space-y-1 text-gray-400">
                                {q.follow_up_questions.map((fu, fIdx) => (
                                  <li key={fIdx}>{fu}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
