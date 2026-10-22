import React from 'react';
import { Menu, CircleUserRound, Cpu } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onMenuClick }) {
  return (
    <header className="topbar sticky top-0 z-40 px-5 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="menu-button md:hidden" onClick={onMenuClick} aria-label="Open navigation">
          <Menu className="w-5 h-5" />
        </button>
        <div className="brand-mark">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <p className="brand-name">Career Copilot</p>
          <p className="brand-context">Placement workspace / 2026</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="service-status hidden sm:flex items-center gap-2">
          <span className="status-dot"></span>
          AI services ready
        </div>
        <button className="profile-button" aria-label="Open profile">
          <CircleUserRound className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
