import React from 'react';
import { Sparkles, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-gray-800 bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            AI Career & Placement Copilot
          </h1>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 inline" /> DeepSeek V4 Flash + OpenRouter + ChromaDB Stack
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          FastAPI & Node Gateway Active
        </div>
        <button
          onClick={() => setActiveTab('prep-guide')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === 'prep-guide'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-gray-800/80 hover:bg-gray-700 text-gray-200 border border-gray-700'
          }`}
        >
          <Terminal className="w-4 h-4" /> AI Engineer Interview Prep Guide
        </button>
      </div>
    </header>
  );
}
