import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  BrainCircuit,
  Check,
  FileSearch,
  Menu,
  Network,
  Radar,
  Route,
  Sparkles,
  Target,
} from 'lucide-react';

const roleData = {
  'Product engineer': { score: '84%', gap: 'Systems design', accent: '#c8ff52', focus: 'Build proof that travels.' },
  'ML engineer': { score: '76%', gap: 'Model deployment', accent: '#ff7b5c', focus: 'Turn curiosity into signal.' },
  'Product designer': { score: '91%', gap: 'Research synthesis', accent: '#72d6ff', focus: 'Make your point of view legible.' },
};

export default function LandingPage({ onEnter }) {
  const [role, setRole] = useState('Product engineer');
  const [menuOpen, setMenuOpen] = useState(false);
  const active = roleData[role];

  return (
    <div className="landing-page">
      <a className="skip-link" href="#top">Skip to content</a>
      <header className="landing-nav">
        <a href="#top" className="landing-logo" aria-label="Career Copilot home">
          <span className="logo-orbit"><span /></span>
          <span>Career<br /><em>Copilot</em></span>
        </a>
        <nav className="landing-links" aria-label="Main navigation">
          <a href="#method">Method</a>
          <a href="#signal">Signal map</a>
          <a href="#about">About the engine</a>
        </nav>
        <button className="landing-enter" onClick={onEnter}>Open workspace <ArrowRight size={16} /></button>
        <button className="landing-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Menu size={20} /></button>
        {menuOpen && (
          <nav className="landing-mobile-menu" aria-label="Mobile navigation">
            <a href="#method" onClick={() => setMenuOpen(false)}>Method <ArrowRight size={15} /></a>
            <a href="#signal" onClick={() => setMenuOpen(false)}>Signal map <ArrowRight size={15} /></a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About the engine <ArrowRight size={15} /></a>
            <button onClick={onEnter}>Open workspace <ArrowRight size={15} /></button>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="hero-index"><span>Career intelligence for the in-between</span></div>
          <div className="hero-copy">
            <p className="landing-kicker"><span className="live-pulse" /> Evidence-backed career direction</p>
            <h1>Find the role<br /><span>your work already proves.</span></h1>
            <p className="hero-lede">Career Copilot finds the evidence in your experience, maps it to the role you want, and gives you the shortest honest route forward.</p>
            <div className="hero-actions">
              <button className="hero-cta" onClick={onEnter}>Build your signal <ArrowDownRight size={18} /></button>
              <a className="hero-text-link" href="#method">See how it works <span>↗</span></a>
            </div>
          </div>
          <div className="hero-stamp" aria-hidden="true"><span>CV</span><span>JD</span><span>RAG</span><span>AI</span></div>
          <div className="hero-visual" role="img" aria-label="A signal map connecting experience, intent and market to a target role">
            <div className="visual-grid" />
            <div className="signal-ring ring-one" /><div className="signal-ring ring-two" />
            <div className="signal-core"><BrainCircuit size={28} /><strong>signal</strong><small>01 / 04</small></div>
            <span className="signal-node node-a">experience</span><span className="signal-node node-b">intent</span><span className="signal-node node-c">market</span>
            <svg className="signal-lines" viewBox="0 0 600 460" preserveAspectRatio="none" aria-hidden="true"><path d="M310 230 C235 155 145 120 65 92" /><path d="M310 230 C390 160 492 132 552 104" /><path d="M310 230 C230 315 140 360 72 402" /><path d="M310 230 C392 302 458 350 548 390" /></svg>
            <div className="orbit-label">Your signal is<br /><b>more than a score.</b></div>
          </div>
          <a className="scroll-cue" href="#method"><span>Scroll to find the thread</span><ArrowDownRight size={16} /></a>
        </section>

        <section className="landing-method" id="method">
          <div className="section-marker">The method</div>
          <div className="method-intro"><h2>Less guessing.<br /><i>More becoming.</i></h2><p>Most career tools compare keywords. This one builds a working model of you, then tests it against the moving target of work.</p></div>
          <div className="method-rail">
            <article><FileSearch size={24} /><h3>Read the evidence</h3><p>Parse the work behind your job titles. Skills, decisions, outcomes, patterns.</p></article>
            <article><Radar size={24} /><h3>Find the tension</h3><p>Match your signal to a real role and see the gaps worth closing next.</p></article>
            <article><Route size={24} /><h3>Move with intent</h3><p>Generate a roadmap, practice the conversation, and apply with proof.</p></article>
          </div>
        </section>

        <section className="signal-section" id="signal">
          <div className="section-marker">The signal map</div>
          <div className="signal-heading"><h2>Try on a<br /><span>future self.</span></h2><p>Choose a direction. The map shifts to show the kind of evidence that makes your next move believable.</p></div>
          <div className="signal-workbench">
            <div className="role-picker"><span className="picker-label">Target role</span>{Object.keys(roleData).map((item) => <button key={item} className={role === item ? 'role-active' : ''} onClick={() => setRole(item)}>{item}<ArrowRight size={15} /></button>)}<div className="picker-foot"><Sparkles size={14} /> Live reasoning preview</div></div>
            <div className="map-panel" style={{ '--signal-accent': active.accent }}><div className="map-top"><span>FIT / {active.score}</span><span>ROLE 0{Object.keys(roleData).indexOf(role) + 1}</span></div><div className="map-graphic"><div className="map-core"><Target size={22} /><b>{active.score}</b><small>readiness</small></div><div className="map-line map-line-a" /><div className="map-line map-line-b" /><div className="map-line map-line-c" /><div className="map-tag tag-a">{active.gap}</div><div className="map-tag tag-b">transferable skills</div><div className="map-tag tag-c">proof points</div></div><div className="map-bottom"><span>{active.focus}</span><span className="map-status"><Check size={14} /> evidence-backed</span></div></div>
          </div>
        </section>

        <section className="proof-section" aria-labelledby="proof-heading">
          <div className="section-marker">What the workspace makes visible</div>
          <div className="proof-heading">
            <h2 id="proof-heading">A clearer route<br /><span>from work to words.</span></h2>
            <p>Your next application gets stronger when the reasoning is inspectable. Career Copilot keeps the useful detail in view instead of reducing your experience to a keyword match.</p>
          </div>
          <div className="proof-grid">
            <article><span className="proof-index">01 / Evidence</span><h3>Specific proof points</h3><p>See which decisions, outcomes, and technical signals support a target role before you write the story around them.</p></article>
            <article><span className="proof-index">02 / Gaps</span><h3>Gaps with a reason</h3><p>Separate a missing keyword from a missing capability, then focus your time on the gap that changes the outcome.</p></article>
            <article><span className="proof-index">03 / Practice</span><h3>A route you can rehearse</h3><p>Turn the analysis into a roadmap, interview prompts, and a clearer explanation of why your experience transfers.</p></article>
          </div>
        </section>

        <section className="landing-about" id="about">        <div className="section-marker">Behind the signal</div><div><p className="about-quote">“The goal is not to make you look like the job. It is to make the connection impossible to miss.”</p><div className="about-meta"><Network size={21} /><span>Generative AI + retrieval + agentic reasoning<br /><small>Built for the moment before the leap.</small></span></div></div><button className="about-cta" onClick={onEnter}>Enter the copilot <ArrowRight size={17} /></button></section>
      </main>
      <footer className="landing-footer"><span>CAREER COPILOT / 2026</span><span>Resume to roadmap, with receipts.</span><span>Scroll / Explore / Move</span></footer>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <a className="not-found-skip" href="#not-found-main">Skip to content</a>
      <main id="not-found-main">
        <span className="signal">Signal lost / 404</span>
        <h1>This route is no longer in the map.</h1>
        <p>The page you followed has moved. Return to the copilot and keep building a clearer next step.</p>
        <a href="/">Return to Career Copilot <ArrowRight size={17} /></a>
      </main>
    </div>
  );
}