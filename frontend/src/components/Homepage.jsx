import React, { useEffect, useState } from "react";
import "../styles/Homepage.css";
import StudyResources from "./StudyResources";
import Dashboard from "./Dashboard";
import TrackProgress from "./TrackProgress";
import MockExam from "./MockExam";
import Profile from "./Profile"; // Import Profile component
import MyAccount from "./MyAccount";
import Settings from "./Settings";

function humanTime(iso) {
  try { return new Date(iso).toLocaleString(); } catch(e) { return iso; }
}

export default function Homepage({ isDarkMode, toggleDarkMode }) {
  const [currentPage, setCurrentPage] = useState("home");
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

  const [news, setNews] = useState(() => {
    const raw = localStorage.getItem('news') || '[]';
    try { return JSON.parse(raw); } catch(e) { return []; }
  });

  // expose minimal global for inline templating above (keeps rendering simple)
  React.useEffect(() => { window.__latestNews = news.length ? news : [ { title: 'New Study Tips: Active Recall', body: 'We added a new guide on Active Recall. Check Study Resources.', time: Date.now() }, { title: 'Mock Exam Update', body: 'New mock exam added for General Knowledge with 60 questions.', time: Date.now() - 1000*60*60*24 } ]; }, [news]);

  useEffect(() => {
    const storageHandler = (e) => {
      if (!e) return;
      if (e.key === 'resourceStates') setResourceStates(JSON.parse(localStorage.getItem('resourceStates') || '{}'));
      if (e.key === 'examHistory') setExams(JSON.parse(localStorage.getItem('examHistory') || '[]'));
      if (e.key === 'activityLog') setActivityLog(JSON.parse(localStorage.getItem('activityLog') || '[]'));
      if (e.key === 'news') setNews(JSON.parse(localStorage.getItem('news') || '[]'));
      if (e.key === 'profile') {
        const p = JSON.parse(localStorage.getItem('profile') || '{}');
        // update header if needed
      }
    };
    const resourceHandler = () => setResourceStates(JSON.parse(localStorage.getItem('resourceStates') || '{}'));
    const examHandler = () => setExams(JSON.parse(localStorage.getItem('examHistory') || '[]'));
    const activityHandler = () => setActivityLog(JSON.parse(localStorage.getItem('activityLog') || '[]'));

    window.addEventListener('storage', storageHandler);
    window.addEventListener('resourceStatesChanged', resourceHandler);
    window.addEventListener('examHistoryChanged', examHandler);
    window.addEventListener('activityLogChanged', activityHandler);

    const interval = setInterval(() => {
      setResourceStates(JSON.parse(localStorage.getItem('resourceStates') || '{}'));
      setExams(JSON.parse(localStorage.getItem('examHistory') || '[]'));
      setActivityLog(JSON.parse(localStorage.getItem('activityLog') || '[]'));
    }, 1500);
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('resourceStatesChanged', resourceHandler);
      window.removeEventListener('examHistoryChanged', examHandler);
      window.removeEventListener('activityLogChanged', activityHandler);
      clearInterval(interval);
    };
  }, []);

  // Auto-logout handler (checks inactivity against profile.autoLogoutMinutes)
  useEffect(() => {
    let lastActivity = Number(localStorage.getItem('lastActivity') || Date.now());
    const touch = () => { lastActivity = Date.now(); localStorage.setItem('lastActivity', String(lastActivity)); };
    window.addEventListener('mousemove', touch);
    window.addEventListener('keydown', touch);

    const checker = setInterval(() => {
      try {
        const p = JSON.parse(localStorage.getItem('profile') || '{}');
        const auto = p.autoLogoutMinutes || 0;
        if (auto > 0) {
          const la = Number(localStorage.getItem('lastActivity') || lastActivity);
          if (Date.now() - la > auto * 60 * 1000) {
            // auto logout
            localStorage.removeItem('profile');
            try { window.dispatchEvent(new Event('profileChanged')); } catch(e) {}
            alert('You have been logged out due to inactivity');
            setCurrentPage('home');
          }
        }
      } catch(e){}
    }, 10 * 1000);

    return () => { window.removeEventListener('mousemove', touch); window.removeEventListener('keydown', touch); clearInterval(checker); };
  }, []);

  const handleNavigation = (page) => setCurrentPage(page);

  // Render different pages
  if (currentPage === "dashboard") {
    return <Dashboard onNavigate={setCurrentPage} toggleDarkMode={toggleDarkMode} />;
  }
  if (currentPage === "study-resources") {
    return <StudyResources onNavigate={setCurrentPage} toggleDarkMode={toggleDarkMode} />;
  }
  if (currentPage === "mock-exams") {
    return <MockExam onNavigate={setCurrentPage} toggleDarkMode={toggleDarkMode} />;
  }
  if (currentPage === "track-progress") {
    return <TrackProgress onNavigate={setCurrentPage} toggleDarkMode={toggleDarkMode} />;
  }
  if (currentPage === "my-account") {
    return <MyAccount onNavigate={setCurrentPage} toggleDarkMode={toggleDarkMode} />;
  }
  if (currentPage === "settings") {
    return <Settings onNavigate={setCurrentPage} toggleDarkMode={toggleDarkMode} />;
  }
  if (currentPage === 'news') {
    const NewsManager = React.lazy(() => import('./NewsManager'));
    return <React.Suspense fallback={<div style={{padding:12}}>Loading…</div>}><NewsManager onNavigate={setCurrentPage} /></React.Suspense>;
  }

  const resourcesRead = Object.values(resourceStates).filter(r => r && (r.completed || (r.progress||0) >= 100)).length;
  const examsTaken = exams.length;
  const averageScore = examsTaken ? Math.round(exams.reduce((s,x) => s + (x.percentage||0), 0) / examsTaken) : 0;
  const overallPercent = (() => {
    const vals = Object.values(resourceStates);
    if (!vals || !vals.length) return 0;
    const sum = vals.reduce((s, r) => s + (r.progress || 0), 0);
    return Math.round(sum / vals.length);
  })();

  const activities = [
    ...(activityLog || []).map(a => ({ icon: a.type === 'completed' ? '✅' : a.type === 'exam' ? '📝' : '•', title: `${a.type === 'completed' ? 'Completed' : a.type === 'exam' ? 'Exam' : a.type}: ${a.title}${a.detail ? ` — ${a.detail}` : ''}`, time: a.time })),
    ...exams.map(e => ({ icon: '📝', title: `Exam: ${e.title ?? 'Mock'} - ${e.percentage}%`, time: e.time }))
  ].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0,4);

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
          {/* Profile Component */}
          <Profile onNavigate={setCurrentPage} toggleDarkMode={toggleDarkMode} />
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
          <div className="welcome-grid">
            <div className="welcome-left">
              <h2>Welcome Back! 👋</h2>
              <p>Continue your Loksewa preparation journey</p>

              {/* Stats Cards */}
              <div className="stats-container">
                <div className="stat-card resources">
                  <div className="stat-number">{resourcesRead}</div>
                  <div className="stat-label">Resources Read</div>
                </div>
                <div className="stat-card exams">
                  <div className="stat-number">{examsTaken}</div>
                  <div className="stat-label">Exams Taken</div>
                </div>
                <div className="stat-card score">
                  <div className="stat-number">{averageScore}%</div>
                  <div className="stat-label">Average Score</div>
                </div>
              </div>

              <div className="overall-progress">
                <div className="progress-pill">Overall: {overallPercent}%</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${overallPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="welcome-right">
              <h3>Recent Activity</h3>
              <div className="recent-list">
                {activities.map((a, i) => (
                  <div key={i} className="recent-item">
                    <div className="recent-icon">{a.icon}</div>
                    <div>
                      <div className="recent-title">{a.title}</div>
                      <div className="recent-time">{humanTime(a.time)}</div>
                    </div>
                  </div>
                ))}
                {!activities.length && <div className="recent-empty">No recent activity yet — start studying or take a quiz.</div>}
              </div>

              {/* Latest News */}
              <div className="news-section" style={{marginTop:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <h3 style={{margin:0}}>Latest News</h3>
                  <div><button className="small-button" onClick={() => handleNavigation('news')}>View all</button></div>
                </div>
                <div className="news-list">
                  {/* Populated from localStorage 'news' or sample */}
                  {(window.__latestNews || []).slice(0,3).map((n,i)=> (
                    <div key={i} className="news-item">
                      <div className="news-title">{n.title}</div>
                      <div className="news-meta"><span className="muted">{new Date(n.time).toLocaleDateString()}</span></div>
                      <div className="news-body">{n.body}</div>
                    </div>
                  ))}
                  {!((window.__latestNews || []).length) && <div className="muted">No news yet — check back later.</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}