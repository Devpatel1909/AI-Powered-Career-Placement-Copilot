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
        <h2 className="flex items-center gap-2 text-2xl font-bold text-white-100">
          <HelpCircle className="w-6 h-6 text-amber-400" /> Module 5: AI Interview Question Generator
        </h2>
        <p className="mt-1 text-xs text-white-400">
          Generates technical, behavioral, resume-based, project deep-dive, and coding questions with ideal answers.
        </p>
      </div>

      {/* Control Banner */}
      <div className="flex flex-col items-center justify-between gap-4 p-6 border border-gray-800 glass-card rounded-2xl md:flex-row">
        <div className="flex-1 w-full">
          <label className="block mb-1 text-xs font-semibold uppercase text-white-400">Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white-100 focus:outline-none focus:border-amber-500"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center justify-center w-full gap-2 px-6 py-3 text-sm font-semibold text-white transition-all shadow-lg md:w-auto bg-amber-600 hover:bg-amber-500 rounded-xl shadow-amber-600/30"
        >
          <Sparkles className="w-4 h-4" /> Generate Interview Set
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs border bg-rose-500/10 border-rose-500/30 rounded-xl text-rose-300">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner message="Generating Tailored Technical & Behavioral Questions..." />}

      {questions && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between font-mono text-xs text-white-400">
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
                    <div key={qIdx} className="overflow-hidden border border-gray-800 glass-card rounded-2xl">
                      <div 
                        onClick={() => toggleExpand(globalIdx)}
                        className="flex items-center justify-between p-4 transition-all cursor-pointer bg-gray-900/60 hover:bg-gray-900/90"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              q.difficulty === 'Hard' ? 'bg-rose-500/20 text-rose-300' : 
                              q.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="font-mono text-xs text-white-400">{q.category}</span>
                          </div>
                          <p className="text-sm font-semibold text-white-200">{q.question}</p>
                        </div>

                        {isExpanded ? <ChevronUp className="w-5 h-5 text-white-400" /> : <ChevronDown className="w-5 h-5 text-white-400" />}
                      </div>

                      {isExpanded && (
                        <div className="p-5 space-y-3 text-xs border-t border-gray-800/80 bg-gray-950/60">
                          {q.context_or_trigger && (
                            <p className="text-white-400">
                              <strong className="text-white-300">Why asked:</strong> {q.context_or_trigger}
                            </p>
                          )}

                          <div>
                            <p className="mb-1 font-semibold text-emerald-400">Ideal Answer Highlights:</p>
                            <ul className="space-y-1 list-disc list-inside text-white-300">
                              {q.ideal_answer_points.map((pt, pIdx) => (
                                <li key={pIdx}>{pt}</li>
                              ))}
                            </ul>
                          </div>

                          {q.follow_up_questions && q.follow_up_questions.length > 0 && (
                            <div>
                              <p className="mb-1 font-semibold text-amber-400">Follow-up Probing Questions:</p>
                              <ul className="space-y-1 list-disc list-inside text-white-400">
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
