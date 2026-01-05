// StudyResources.jsx
import React from 'react';
import "../styles/StudyResources.css";

export default function StudyResources({ onNavigate }) {
  const studyMaterials = [
    {
      title: 'Nepal Constitution 2072',
      description: 'Complete guide to Nepal\'s constitution'
    },
    {
      title: 'General Knowledge',
      description: 'Current affairs and GK topics'
    },
    {
      title: 'Nepali History',
      description: 'Historical events and timeline'
    },
    {
      title: 'Geography of Nepal',
      description: 'Physical and political geography'
    },
    {
      title: 'Basic Economics',
      description: 'Economic concepts and Nepal\'s economy'
    }
  ];

  return (
    <div className="study-resources-container">
      {/* Header */}
      <header className="study-header">
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
          className="nav-btn"
          onClick={() => onNavigate && onNavigate('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className="nav-btn nav-btn-active"
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
      <main className="study-main">
        {/* Study Materials Section */}
        <section className="study-materials-section">
          <h2 className="section-title">
            <span className="icon">📚</span>
            Study Materials
          </h2>

          <div className="materials-list">
            {studyMaterials.map((material, index) => (
              <div key={index} className="material-card">
                <h3 className="material-title">{material.title}</h3>
                <p className="material-description">{material.description}</p>
              </div>
            ))}
          </div>
          <div><button className="back-btn" onClick={() => onNavigate && onNavigate("home")}>
          Back to Home
        </button></div>
        </section>
      </main>
    </div>
  );
}