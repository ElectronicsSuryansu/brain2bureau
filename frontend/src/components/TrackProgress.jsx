// TrackProgress.jsx
import React from 'react';
import"../styles/TrackProgress.css";

export default function TrackProgress({ onNavigate }) {
  const progressData = [
    {
      category: 'Study Resources',
      percentage: 40,
      color: '#0284c7'
    },
    {
      category: 'Mock Exams',
      percentage: 60,
      color: '#0284c7'
    }
  ];

  const recentActivities = [
    {
      icon: '✅',
      title: 'Completed: Nepal Constitution',
      time: '2 days ago',
      type: 'completed'
    },
    {
      icon: '📝',
      title: 'Exam: General Knowledge - Score: 85%',
      time: '3 days ago',
      type: 'exam'
    },
    {
      icon: '✅',
      title: 'Completed: Geography of Nepal',
      time: '5 days ago',
      type: 'completed'
    }
  ];

  return (
    <div className="track-progress-container">
      {/* Header */}
      <header className="track-header">
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
          className="nav-btn nav-btn-active"
          onClick={() => onNavigate && onNavigate('track-progress')}
        >
          Track Progress
        </button>
      </div>

      {/* Main Content */}
      <main className="track-main">
        {/* Your Progress Section */}
        <section className="progress-section">
          <h2 className="section-title">
            <span className="icon">📊</span>
            Your Progress
          </h2>

          {/* Progress Bars */}
          <div className="progress-list">
            {progressData.map((item, index) => (
              <div key={index} className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">{item.category}</span>
                  <span className="progress-percentage">{item.percentage}%</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Section */}
          <div className="recent-activity">
            <h3 className="activity-title">Recent Activity</h3>
            
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <p className="activity-title-text">{activity.title}</p>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div><button className="back-btn" onClick={() => onNavigate && onNavigate("home")}>
          Back to Home
        </button></div>
        </section>
      </main>
    </div>
  );
}