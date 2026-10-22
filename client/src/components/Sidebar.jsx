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
  X,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const groups = [
    { label: 'Workspace', items: [{ id: 'dashboard', label: 'Overview', icon: LayoutDashboard }, { id: 'personalized-jobs', label: 'Job matches', icon: Briefcase }] },
    { label: 'Build your case', items: [{ id: 'resume-analyzer', label: 'Resume analysis', icon: FileText }, { id: 'jd-matcher', label: 'Role fit', icon: GitCompare }, { id: 'roadmap', label: 'Skill roadmap', icon: Map }] },
    { label: 'Practice', items: [{ id: 'interview-prep', label: 'Interview prep', icon: HelpCircle }, { id: 'chatbot', label: 'Career coach', icon: MessageSquare }] },
    { label: 'AI workspace', items: [{ id: 'agent', label: 'Agent runner', icon: Bot }, { id: 'rag-hub', label: 'Knowledge hub', icon: Database }, { id: 'prep-guide', label: 'Engineering notes', icon: BookOpen }] },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-inner">
        <div className="sidebar-mobile-head">
          <span>Navigation</span>
          <button className="menu-button" onClick={onClose} aria-label="Close navigation"><X className="w-5 h-5" /></button>
        </div>
        {groups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="nav-group-label">{group.label}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`nav-item ${isActive ? 'nav-item-active' : ''}`}>
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="stack-note">
        <p className="stack-title">Powered by your evidence</p>
        <p>Resume parsing, retrieval and reasoning stay in one workspace.</p>
      </div>
    </aside>
  );
}
