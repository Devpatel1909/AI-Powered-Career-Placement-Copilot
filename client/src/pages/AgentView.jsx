import React, { useState } from 'react';
import { Bot, Play, CheckCircle2, ArrowRight, Sparkles, Terminal, Activity } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePersistedState } from '../utils/persistedState';

export default function AgentView({ parsedResume, jdMatch }) {
  const [query, setQuery] = usePersistedState('career_app_agent_query', "Am I ready for Microsoft? Check my skill gaps, improve my resume, generate interview questions, and build a roadmap.");
  const [targetRole, setTargetRole] = usePersistedState('career_app_agent_target_role', 'Senior Software Engineer');
  const [agentResult, setAgentResult] = usePersistedState('career_app_agent_result', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunAgent = async () => {
    if (!query.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const resumeStr = parsedResume ? JSON.stringify(parsedResume) : "Candidate with Python, React, FastAPI, SQL, Microservices.";
      const jdStr = jdMatch ? JSON.stringify(jdMatch) : "Microsoft Software Engineer requiring Algorithms, Distributed Systems, System Design.";
      
      const res = await apiService.runAgent(query, resumeStr, jdStr, targetRole);
      if (res.success) {
        setAgentResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute Agent workflow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Bot className="w-6 h-6 text-purple-400" /> Module 7: Agentic AI Workflow & Tool Router
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Autonomous multi-step tool execution loop: Plan → Select Tool → Execute → Observe → Synthesize Answer.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">User Goal / Goal Prompt</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          onClick={handleRunAgent}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" /> Run Autonomous Agent Execution
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner message="LangGraph Agent is planning tool selection & executing steps..." />}

      {agentResult && !loading && (
        <div className="space-y-6">
          {/* Tools Called Header */}
          <div className="glass-card p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-gray-300">Tools Invoked:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {agentResult.tools_used.map((tool, i) => (
                <span key={i} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs rounded-lg font-mono">
                  🔧 {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Execution Trace Timeline */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" /> Step-by-Step Agent Trajectory
            </h3>

            <div className="space-y-3">
              {agentResult.execution_trace.map((step, idx) => (
                <div key={idx} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="text-xs font-mono font-bold text-blue-400">Step #{step.step_number}</span>
                    <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                      Action Tool: {step.action_tool}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300">
                    <strong className="text-gray-400">Thought:</strong> {step.thought}
                  </p>

                  <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800/80 text-xs font-mono text-emerald-400 space-y-1">
                    <p className="text-gray-500 text-[10px]">Observation Output:</p>
                    <p>{step.observation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Synthesized Answer */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3">
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Final Agent Synthesis Response
            </h3>
            <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
              {agentResult.final_answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
