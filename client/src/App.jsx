import React, { lazy, Suspense, useState } from 'react';
import { usePersistedState } from './utils/persistedState';
import LandingPage, { NotFoundPage } from './pages/LandingPage';

const Navbar = lazy(() => import('./components/Navbar'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer'));
const JDMatcher = lazy(() => import('./pages/JDMatcher'));
const RoadmapView = lazy(() => import('./pages/RoadmapView'));
const InterviewView = lazy(() => import('./pages/InterviewView'));
const ChatbotView = lazy(() => import('./pages/ChatbotView'));
const AgentView = lazy(() => import('./pages/AgentView'));
const RAGHubView = lazy(() => import('./pages/RAGHubView'));
const InterviewPrepGuide = lazy(() => import('./pages/InterviewPrepGuide'));
const PersonalizedJobsView = lazy(() => import('./pages/PersonalizedJobsView'));

export default function App() {
  const isMissingRoute = window.location.pathname !== '/';
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = usePersistedState('career_app_active_tab', 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [parsedResume, setParsedResume] = usePersistedState('career_app_parsed_resume', null);
  const [improvement, setImprovement] = usePersistedState('career_app_improvement', null);
  const [jdMatch, setJdMatch] = usePersistedState('career_app_jd_match', null);
  const [roadmap, setRoadmap] = usePersistedState('career_app_roadmap', null);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} parsedResume={parsedResume} improvement={improvement} jdMatch={jdMatch} roadmap={roadmap} />;
      case 'resume-analyzer':
        return <ResumeAnalyzer parsedResume={parsedResume} setParsedResume={setParsedResume} improvement={improvement} setImprovement={setImprovement} />;
      case 'jd-matcher':
        return <JDMatcher parsedResume={parsedResume} jdMatch={jdMatch} setJdMatch={setJdMatch} />;
      case 'roadmap':
        return <RoadmapView missingSkills={jdMatch?.missing_skills || improvement?.missing_skills} roadmap={roadmap} setRoadmap={setRoadmap} />;
      case 'interview-prep':
        return <InterviewView parsedResume={parsedResume} jdMatch={jdMatch} />;
      case 'chatbot':
        return <ChatbotView />;
      case 'agent':
        return <AgentView parsedResume={parsedResume} jdMatch={jdMatch} />;
      case 'rag-hub':
        return <RAGHubView />;
      case 'personalized-jobs':
        return <PersonalizedJobsView parsedResume={parsedResume} improvement={improvement} jdMatch={jdMatch} setActiveTab={setActiveTab} setJdMatch={setJdMatch} setRoadmap={setRoadmap} />;
      case 'prep-guide':
        return <InterviewPrepGuide />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  if (isMissingRoute) {
    return <NotFoundPage />;
  }

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <Suspense fallback={<div className="app-loading" role="status">Loading workspace...</div>}>
      <div className="app-shell min-h-screen flex flex-col">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onMenuClick={() => setSidebarOpen(true)} />
        <div className="app-body flex flex-1 overflow-hidden">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setSidebarOpen(false);
            }}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="app-canvas flex-1 p-5 md:p-8 overflow-y-auto w-full">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </Suspense>
  );
}
