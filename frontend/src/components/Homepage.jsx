import React, { useState } from "react";
import "../styles/Homepage.css";
import StudyResources from "./StudyResources"; // Import the StudyResources component
import Dashboard from "./Dashboard"; // Import the new Dashboard component
import TrackProgress from "./TrackProgress"; // Import the TrackProgress component
import MockExam from "./MockExam"; // Import the MockExam component


export default function Homepage() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigation = (page) => setCurrentPage(page);

  // Render different pages
  if (currentPage === "dashboard") {
  return <Dashboard onNavigate={setCurrentPage} />;
}
  if (currentPage === "study-resources") {
   
      return <StudyResources onNavigate={setCurrentPage} />;
    
  }
  if (currentPage === "mock-exams") {
    return <MockExam onNavigate={setCurrentPage} />
  }
  if (currentPage === "track-progress") {
    return <TrackProgress onNavigate={setCurrentPage} />;
  }

  // Home page JSX
  return (
    <div className="homepage-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-icon">🎓</div>
          <div className="header-text">
            <h1>Brain2Bureau - Loksewa Prep</h1>
            <p>Your Complete Preparation Companion</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Navigation Buttons */}
        <div className="nav-buttons">
          <button
            className="nav-btn"
            onClick={() => handleNavigation("dashboard")}
          >
            Dashboard
          </button>
          <button
            className="nav-btn"
            onClick={() => handleNavigation("study-resources")}
          >
            Study Resources
          </button>
          <button
            className="nav-btn"
            onClick={() => handleNavigation("mock-exams")}
          >
            Mock Exams
          </button>
          <button
            className="nav-btn"
            onClick={() => handleNavigation("track-progress")}
          >
            Track Progress
          </button>
        </div>

        {/* Welcome Card */}
        <div className="welcome-card">
          <h2>Welcome Back! 👋</h2>
          <p>Continue your Loksewa preparation journey</p>

          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card resources">
              <div className="stat-number">8</div>
              <div className="stat-label">Resources Read</div>
            </div>
            <div className="stat-card exams">
              <div className="stat-number">5</div>
              <div className="stat-label">Exams Taken</div>
            </div>
            <div className="stat-card score">
              <div className="stat-number">78%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
