import React from 'react';
import { 
  FileCheck2, 
  Target, 
  MapPin, 
  Award, 
  Zap, 
  ArrowRight,
  Sparkles,
  Bot,
  Database,
  Briefcase,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function Dashboard({ setActiveTab, parsedResume, improvement, jdMatch }) {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="glass-card p-8 rounded-3xl relative overflow-hidden border border-blue-500/20 bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-purple-950/30">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Placement Preparation Platform
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Accelerate your tech placement journey with AI precision.
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Upload your resume, compare against target JDs, close skill gaps with personalized roadmaps, get AI-matched job recommendations, and leverage autonomous agent tools.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('resume-analyzer')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              Upload & Analyze Resume <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('personalized-jobs')}
              className="px-5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <Briefcase className="w-4 h-4 text-emerald-400" /> Find Jobs
            </button>
            <button
              onClick={() => setActiveTab('agent')}
              className="px-5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-purple-400" /> Launch AI Agent
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Resume Score" 
          value={improvement ? `${improvement.resume_score}/100` : 'Not Tested'} 
          subtitle="ATS & Content Rating" 
          icon={FileCheck2} 
          color="blue" 
        />
        <MetricCard 
          title="JD Career Readiness" 
          value={jdMatch ? `${jdMatch.career_readiness_score}%` : 'Not Analyzed'} 
          subtitle="Match against Target Role" 
          icon={Target} 
          color="green" 
        />
        <MetricCard 
          title="Skills Extracted" 
          value={parsedResume ? parsedResume.skills.length : 0} 
          subtitle="Identified technical skills" 
          icon={Award} 
          color="purple" 
        />
        <MetricCard 
          title="RAG Vector Engine" 
          value="ChromaDB" 
          subtitle="Top-K Similarity Retrieval" 
          icon={Database} 
          color="amber" 
        />
      </div>

      {/* Grid Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => setActiveTab('resume-analyzer')}
          className="glass-card p-6 rounded-2xl glass-card-hover cursor-pointer border border-gray-800 space-y-3"
        >
          <div className="p-3 w-fit bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-100">1. Resume Analysis</h3>
          <p className="text-xs text-gray-400">
            PDF parsing, skills categorization, ATS feedback, action verb check, and structured JSON extraction using DeepSeek V4 Flash.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('jd-matcher')}
          className="glass-card p-6 rounded-2xl glass-card-hover cursor-pointer border border-gray-800 space-y-3"
        >
          <div className="p-3 w-fit bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-100">2. Resume vs JD Matcher</h3>
          <p className="text-xs text-gray-400">
            Identify exact skill overlaps, missing keywords, candidate strengths, weaknesses, and priority skill matrix.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('roadmap')}
          className="glass-card p-6 rounded-2xl glass-card-hover cursor-pointer border border-gray-800 space-y-3"
        >
          <div className="p-3 w-fit bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-100">3. Personalized Roadmap</h3>
          <p className="text-xs text-gray-400">
            Day-by-day and week-by-week personalized study plan, curated resources, and portfolio project suggestions.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('personalized-jobs')}
          className="glass-card p-6 rounded-2xl glass-card-hover cursor-pointer border border-gray-800 space-y-3"
        >
          <div className="p-3 w-fit bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-100">4. Personalized Jobs</h3>
          <p className="text-xs text-gray-400">
            AI-matched job recommendations powered by DeepSeek LLM, RAG placement context, and your resume profile.
          </p>
        </div>
      </div>
    </div>
  );
}
