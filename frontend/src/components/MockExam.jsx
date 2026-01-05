// MockExam.jsx
import React from 'react';
import "../styles/MockExam.css";

export default function MockExam({ onNavigate }) {
  const examTypes = [
    {
      id: 'general-knowledge',
      title: 'General Knowledge Test',
      icon: '📚'
    },
    {
      id: 'constitution',
      title: 'Constitution Test',
      icon: '⚖️'
    },
    {
      id: 'full-mock',
      title: 'Full Mock Exam',
      icon: '📝'
    }
  ];

  return (
    <div className="mock-exam-container">
      {/* Header */}
      <header className="mock-header">
        <div className="header-content">
          <div className="logo-icon">
            <span>🧠</span>
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
          onClick={() => onNavigate?.('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className="nav-btn"
          onClick={() => onNavigate?.('study-resources')}
        >
          Study Resources
        </button>
        <button 
          className="nav-btn nav-btn-active"
          onClick={() => onNavigate?.('mock-exams')}
        >
          Mock Exams
        </button>
        <button 
          className="nav-btn"
          onClick={() => onNavigate?.('track-progress')}
        >
          Track Progress
        </button>
      </div>

      {/* Main Content */}
      <main className="mock-main">
        <section className="exam-section">
          <h2 className="section-title">
            <span className="icon">📝</span>
            Mock Examinations
          </h2>
          <p className="section-description">Test your knowledge with practice exams</p>

          {/* Exam Buttons */}
          <div className="exam-buttons">
            {examTypes.map((exam) => (
              <button 
                key={exam.id}
                className="exam-btn"
                onClick={() => console.log(`Starting ${exam.id}`)}
              >
                <span className="exam-icon">{exam.icon}</span>
                {exam.title}
              </button>
            ))}
          </div>

          <div className="back-btn-container">
            <button 
              className="back-btn" 
              onClick={() => onNavigate?.('home')}
            >
              Back to Home
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}