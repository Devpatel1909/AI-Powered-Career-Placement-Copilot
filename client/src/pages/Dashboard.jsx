import React from 'react';
import { 
  FileCheck2, 
  Target, 
  MapPin, 
  Award, 
  ArrowRight,
  Database,
  Briefcase,
  Upload,
  Search,
  Route,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';

export default function Dashboard({ setActiveTab, parsedResume, improvement, jdMatch, roadmap }) {
  const resumeReady = Boolean(parsedResume && improvement);
  const matchReady = Boolean(jdMatch);
  return (
    <div className="dashboard-view">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Placement workspace</p>
          <h2>Make your next move clear.</h2>
          <p className="intro-copy">Turn your resume into a stronger application, one evidence-backed step at a time.</p>
        </div>
        <div className="intro-actions">
          <button onClick={() => setActiveTab('resume-analyzer')} className="primary-button"><Upload className="w-4 h-4" /> {resumeReady ? 'Update resume' : 'Analyze resume'}</button>
          <button onClick={() => setActiveTab('personalized-jobs')} className="secondary-button"><Briefcase className="w-4 h-4" /> Browse matches</button>
        </div>
      </div>

      <div className="metrics-grid">
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

      <div className="dashboard-grid">
        <section className="work-panel next-step-panel">
          <div className="panel-heading"><div><p className="eyebrow">Recommended next</p><h3>{resumeReady ? (matchReady ? 'Close the highest-value gap' : 'Compare yourself to a target role') : 'Start with your resume'}</h3></div><ArrowRight className="panel-arrow" /></div>
          <p className="panel-copy">{resumeReady ? (matchReady ? 'Your role fit is ready. Build a focused roadmap around the skills employers are asking for.' : 'A parsed resume gives every other module useful context.') : 'Upload a PDF to extract skills, score your evidence and unlock personalized recommendations.'}</p>
          <button onClick={() => setActiveTab(resumeReady ? (matchReady ? 'roadmap' : 'jd-matcher') : 'resume-analyzer')} className="text-button">{resumeReady ? (matchReady ? 'Open skill roadmap' : 'Compare a role') : 'Upload and analyze'} <ArrowRight className="w-4 h-4" /></button>
        </section>
        <section className="work-panel evidence-panel">
          <div className="panel-heading"><div><p className="eyebrow">Your evidence</p><h3>What is ready to use</h3></div><FileCheck2 className="panel-icon" /></div>
          <div className="evidence-list"><div><span>Resume profile</span><strong>{resumeReady ? 'Analyzed' : 'Waiting'}</strong></div><div><span>Target role fit</span><strong>{matchReady ? 'Scored' : 'Not started'}</strong></div><div><span>Learning plan</span><strong>{roadmap ? 'Generated' : 'Available next'}</strong></div></div>
        </section>
      </div>

      <section className="module-strip">
        <div className="section-heading"><div><p className="eyebrow">The workflow</p><h3>From profile to placement</h3></div><p>Each step adds context to the next.</p></div>
        <div className="workflow-grid">
          <button onClick={() => setActiveTab('resume-analyzer')}><span className="workflow-number">01</span><span><strong>Resume analysis</strong><small>Extract signal from your experience</small></span><Upload className="workflow-arrow" /></button>
          <button onClick={() => setActiveTab('jd-matcher')}><span className="workflow-number">02</span><span><strong>Role fit</strong><small>See what a target job still needs</small></span><Search className="workflow-arrow" /></button>
          <button onClick={() => setActiveTab('roadmap')}><span className="workflow-number">03</span><span><strong>Skill roadmap</strong><small>Turn gaps into a practical plan</small></span><Route className="workflow-arrow" /></button>
        </div>
      </section>
    </div>
  );
}
