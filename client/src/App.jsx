import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JDMatcher from './pages/JDMatcher';
import RoadmapView from './pages/RoadmapView';
import InterviewView from './pages/InterviewView';
import ChatbotView from './pages/ChatbotView';
import AgentView from './pages/AgentView';
import RAGHubView from './pages/RAGHubView';
import InterviewPrepGuide from './pages/InterviewPrepGuide';
import PersonalizedJobsView from './pages/PersonalizedJobsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Shared Application State across modules
  const [parsedResume, setParsedResume] = useState(null);
  const [improvement, setImprovement] = useState(null);
  const [jdMatch, setJdMatch] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            parsedResume={parsedResume}
            improvement={improvement}
            jdMatch={jdMatch}
          />
        );
      case 'resume-analyzer':
        return (
          <ResumeAnalyzer 
            parsedResume={parsedResume} 
            setParsedResume={setParsedResume}
            improvement={improvement}
            setImprovement={setImprovement}
          />
        );
      case 'jd-matcher':
        return (
          <JDMatcher 
            parsedResume={parsedResume}
            jdMatch={jdMatch}
            setJdMatch={setJdMatch}
          />
        );
      case 'roadmap':
        return (
          <RoadmapView 
            missingSkills={jdMatch?.missing_skills || improvement?.missing_skills}
            roadmap={roadmap}
            setRoadmap={setRoadmap}
          />
        );
      case 'interview-prep':
        return (
          <InterviewView 
            parsedResume={parsedResume}
            jdMatch={jdMatch}
          />
        );
      case 'chatbot':
        return <ChatbotView />;
      case 'agent':
        return (
          <AgentView 
            parsedResume={parsedResume}
            jdMatch={jdMatch}
          />
        );
      case 'rag-hub':
        return <RAGHubView />;
      case 'personalized-jobs':
        return (
          <PersonalizedJobsView
            parsedResume={parsedResume}
            improvement={improvement}
            jdMatch={jdMatch}
            setActiveTab={setActiveTab}
            setJdMatch={setJdMatch}
            setRoadmap={setRoadmap}
          />
        );
      case 'prep-guide':
        return <InterviewPrepGuide />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-gray-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
