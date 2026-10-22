import React, { useState } from 'react';
import { Map, Calendar, BookOpen, Rocket, Clock, CheckSquare, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePersistedState } from '../utils/persistedState';

export default function RoadmapView({ missingSkills, roadmap, setRoadmap }) {
  const [targetRole, setTargetRole] = usePersistedState('career_app_roadmap_target_role', 'Software Engineer');
  const [hours, setHours] = usePersistedState('career_app_roadmap_hours', 15);
  const [weeks, setWeeks] = usePersistedState('career_app_roadmap_weeks', 4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const skillsToUse = missingSkills && missingSkills.length > 0 
        ? missingSkills 
        : ['FastAPI Microservices', 'Docker', 'LangChain Agents', 'ChromaDB Vector Search'];
      
      const res = await apiService.generateRoadmap(skillsToUse, targetRole, hours, weeks);
      if (res.success) {
        setRoadmap(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Map className="w-6 h-6 text-purple-400" /> Module 4: Personalized AI Learning Roadmap Generator
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Generates tailored daily and weekly learning schedules, curated resources, and portfolio projects.
        </p>
      </div>

      {/* Control Panel */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Hours / Week</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Duration (Weeks)</label>
          <input
            type="number"
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-100 focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Generate AI Roadmap
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner message="Building Personalized Curriculum & Project Schedule with DeepSeek..." />}

      {roadmap && !loading && (
        <div className="space-y-6">
          {/* Weekly Milestones */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" /> Weekly Curriculum ({roadmap.timeframe_weeks} Weeks)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.weekly_plan.map((week, idx) => (
                <div key={idx} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-lg">
                      Week {week.week_number}
                    </span>
                    <h4 className="text-sm font-bold text-gray-200">{week.theme}</h4>
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Daily Schedule</p>
                    {week.daily_breakdown.map((day, dIdx) => (
                      <div key={dIdx} className="p-2.5 bg-gray-900/60 rounded-xl border border-gray-800/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-gray-300 font-semibold">
                          <span>{day.day}: {day.focus}</span>
                          <span className="text-gray-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {day.hours}h
                          </span>
                        </div>
                        <ul className="list-disc list-inside text-gray-400 text-[11px] space-y-0.5">
                          {day.activities.map((act, aIdx) => (
                            <li key={aIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Projects & Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-400" /> Recommended Portfolio Projects
              </h3>
              <div className="space-y-3">
                {roadmap.recommended_projects.map((proj, i) => (
                  <div key={i} className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-2">
                    <h4 className="text-sm font-bold text-blue-300">{proj.title}</h4>
                    <div className="flex flex-wrap gap-1">
                      {proj.tech_stack.map((t, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                    <ul className="list-disc list-inside text-xs text-gray-400 space-y-0.5">
                      {proj.key_features.map((f, fIdx) => (
                        <li key={fIdx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
              <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" /> Curated Resources & Practice
              </h3>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Learning Materials</p>
                <div className="space-y-2">
                  {roadmap.learning_resources.map((res, i) => (
                    <div key={i} className="p-2.5 bg-gray-900/60 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-gray-200">{res.title}</p>
                        <p className="text-[11px] text-gray-500">{res.type}</p>
                      </div>
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                        {res.url_or_ref}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
