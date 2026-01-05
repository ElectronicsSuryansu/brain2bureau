// Dashboard.jsx
import React from 'react';
import "../styles/Dashboard.css";

export default function Dashboard({ onNavigate }) {
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
              <div className="stat-number">8</div>
              <div className="stat-label">Resources Read</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">5</div>
              <div className="stat-label">Exams Taken</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">78%</div>
              <div className="stat-label">Average Score</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">15</div>
              <div className="stat-label">Study Days</div>
            </div>
          </div>
        </section>

        {/* Overall Progress Card */}
        <section className="progress-section">
          <h3 className="progress-title">Overall Progress</h3>

          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div className="progress-bar-fill">
              <span className="progress-text">65% Complete</span>
            </div>
          </div>

          <p className="progress-message">Keep going! You're making great progress</p>
        </section>
        <div><button className="back-btn" onClick={() => onNavigate && onNavigate("home")}>
          Back to Home
        </button></div>
      </main>
    </div>
  );
}