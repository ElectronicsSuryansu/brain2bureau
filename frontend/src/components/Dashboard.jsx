// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import "../styles/Dashboard.css";
import Profile from "./Profile";
import { studyMaterials } from "../data/studyMaterials";

function uniqueDays(entries) {
  const s = new Set();
  entries.forEach(e => {
    try { s.add(new Date(e.time).toDateString()); } catch(e) {}
  });
  return s.size;
}

export default function Dashboard({ onNavigate, toggleDarkMode }) {
  const [resourceStates, setResourceStates] = useState(() => {
    const raw = localStorage.getItem('resourceStates') || '{}';
    try { return JSON.parse(raw); } catch(e) { return {}; }
  });
  const [exams, setExams] = useState(() => {
    const raw = localStorage.getItem('examHistory') || '[]';
    try { return JSON.parse(raw); } catch(e) { return []; }
  });
  const [activityLog, setActivityLog] = useState(() => {
    const raw = localStorage.getItem('activityLog') || '[]';
    try { return JSON.parse(raw); } catch(e) { return []; }
  });

  useEffect(() => {
    const handler = (e) => {
      if (!e) return;
      if (e.key === 'resourceStates') setResourceStates(JSON.parse(localStorage.getItem('resourceStates') || '{}'));
      if (e.key === 'examHistory') setExams(JSON.parse(localStorage.getItem('examHistory') || '[]'));
      if (e.key === 'activityLog') setActivityLog(JSON.parse(localStorage.getItem('activityLog') || '[]'));
    };
    window.addEventListener('storage', handler);
    window.addEventListener('resourceStatesChanged', () => setResourceStates(JSON.parse(localStorage.getItem('resourceStates') || '{}')));
    window.addEventListener('activityLogChanged', () => setActivityLog(JSON.parse(localStorage.getItem('activityLog') || '[]')));
    window.addEventListener('examHistoryChanged', () => setExams(JSON.parse(localStorage.getItem('examHistory') || '[]')));
    const interval = setInterval(() => {
      setResourceStates(JSON.parse(localStorage.getItem('resourceStates') || '{}'));
      setExams(JSON.parse(localStorage.getItem('examHistory') || '[]'));
      setActivityLog(JSON.parse(localStorage.getItem('activityLog') || '[]'));
    }, 1500);
    return () => { window.removeEventListener('storage', handler); window.removeEventListener('resourceStatesChanged', () => {}); window.removeEventListener('activityLogChanged', () => {}); window.removeEventListener('examHistoryChanged', () => {}); clearInterval(interval); };
  }, []);

  const resourcesRead = Object.values(resourceStates).filter(r => r.completed).length;
  const examsTaken = exams.length;
  const averageScore = examsTaken ? Math.round(exams.reduce((s,x) => s + (x.percentage||0),0) / examsTaken) : 0;
  const studyDays = uniqueDays([...(activityLog || []), ...exams]);
  const overallPercent = (() => {
    const vals = Object.values(resourceStates);
    if (!vals || !vals.length) return 0;
    const sum = vals.reduce((s, r) => s + (r.progress || 0), 0);
    return Math.round(sum / vals.length);
  })();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-icon">
            <span>🎓</span>
          </div>
          <div className="header-text">
            <h1>Brain2Bureau - Loksewa Prep</h1>
            <p>Your Complete Preparation Companion</p>
          </div>
          {/* Profile Component */}
          <Profile onNavigate={onNavigate} toggleDarkMode={toggleDarkMode} />
        </div>
      </header>

      {/* Navigation Buttons */}
      <div className="nav-container">
        <button 
          className="nav-btn nav-btn-active"
          onClick={() => onNavigate && onNavigate('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className="nav-btn"
          onClick={() => onNavigate && onNavigate('study-resources')}
        >
          Study Resources
        </button>
        <button 
          className="nav-btn"
          onClick={() => onNavigate && onNavigate('mock-exams')}
        >
          Mock Exams
        </button>
        <button 
          className="nav-btn"
          onClick={() => onNavigate && onNavigate('track-progress')}
        >
          Track Progress
        </button>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Card */}
        <section className="welcome-section">
          <h2 className="welcome-title">Welcome Back! 👋</h2>
          <p className="welcome-subtitle">Continue your Loksewa preparation journey</p>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{resourcesRead}</div>
              <div className="stat-label">Resources Read</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">{examsTaken}</div>
              <div className="stat-label">Exams Taken</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">{averageScore}%</div>
              <div className="stat-label">Average Score</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">{studyDays}</div>
              <div className="stat-label">Study Days</div>
            </div>
          </div>
        </section>

        {/* Overall Progress Card */}
        <section className="progress-section">
          <h3 className="progress-title">Overall Progress</h3>

          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${overallPercent}%` }}>
              <span className="progress-text">{overallPercent}% Complete</span>
            </div>
          </div>

          <p className="progress-message">Keep going! You're making great progress</p>
        </section>
        <div><button className="back-btn" onClick={() => onNavigate && onNavigate("home") }>
          Back to Home
        </button></div>
      </main>
    </div>
  );
}