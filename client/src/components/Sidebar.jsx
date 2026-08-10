import React from 'react';
import { 
  FileText, 
  Target, 
  GitCompare, 
  Map, 
  HelpCircle, 
  MessageSquare, 
  Bot, 
  Database,
  LayoutDashboard,
  BookOpen,
  Briefcase,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resume-analyzer', label: 'Resume Parser & Score', icon: FileText },
    { id: 'jd-matcher', label: 'Resume vs JD Matcher', icon: GitCompare },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Map },
    { id: 'interview-prep', label: 'Interview Generator', icon: HelpCircle },
    { id: 'chatbot', label: 'AI Career Chatbot', icon: MessageSquare },
    { id: 'agent', label: 'Agentic Tool Router', icon: Bot },
    { id: 'rag-hub', label: 'RAG Knowledge Hub', icon: Database },
    { id: 'personalized-jobs', label: 'Personalized Jobs', icon: Briefcase },
    { id: 'prep-guide', label: 'Module 12 Q&A Prep', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-gray-800 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Core AI Modules
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-gray-300">System Tech Stack</p>
        <p className="text-[11px] text-gray-500">React • Node • FastAPI • DeepSeek • MongoDB • ChromaDB</p>
      </div>
    </aside>
  );
}
