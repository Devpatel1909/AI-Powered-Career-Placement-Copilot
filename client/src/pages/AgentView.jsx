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
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-100">
          <Bot className="w-6 h-6 text-purple-400" /> Module 7: Agentic AI Workflow & Tool Router
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Autonomous multi-step tool execution loop: Plan → Select Tool → Execute → Observe → Synthesize Answer.
        </p>
      </div>

      {/* Input Form */}
      <div className="p-6 space-y-4 border border-gray-800 glass-card rounded-2xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="block mb-1 text-xs font-semibold text-gray-400 uppercase">User Goal / Goal Prompt</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-700 rounded-xl text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-400 uppercase">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-700 rounded-xl text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          onClick={handleRunAgent}
          disabled={loading}
          className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-purple-600/30"
        >
          <Play className="w-4 h-4" /> Run Autonomous Agent Execution
        </button>
      </div>

      {error && (
        <div className="p-3 text-xs border bg-rose-500/10 border-rose-500/30 rounded-xl text-rose-300">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner message="LangGraph Agent is planning tool selection & executing steps..." />}

      {agentResult && !loading && (
        <div className="space-y-6">
          {/* Tools Called Header */}
          <div className="flex items-center justify-between p-4 border border-gray-800 glass-card rounded-xl">
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
            <h3 className="flex items-center gap-2 font-bold text-gray-100 text-md">
              <Terminal className="w-5 h-5 text-blue-400" /> Step-by-Step Agent Trajectory
            </h3>

            <div className="space-y-3">
              {agentResult.execution_trace.map((step, idx) => (
                <div key={idx} className="p-5 space-y-2 border border-gray-800 glass-card rounded-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                    <span className="font-mono text-xs font-bold text-blue-400">Step #{step.step_number}</span>
                    <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                      Action Tool: {step.action_tool}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300">
                    <strong className="text-gray-400">Thought:</strong> {step.thought}
                  </p>
                
                  <div className="p-3 space-y-1 font-mono text-xs border bg-gray-50/80 rounded-xl border-gray-800/80 text-emerald-400">
                    <p className="text-gray-500 text-[10px]">Observation Output:</p>
                    <p>{step.observation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Final Synthesized Answer */}
          <div className="p-6 space-y-3 border glass-card rounded-2xl border-purple-500/30 bg-purple-950/20">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-100">
              <Sparkles className="w-5 h-5 text-purple-400" /> Final Agent Synthesis Response
            </h3>
            <p className="text-xs leading-relaxed text-gray-200 whitespace-pre-wrap">
              {agentResult.final_answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
