// TrackProgress.jsx
import React, { useEffect, useState } from 'react';
import"../styles/TrackProgress.css";
import Profile from './Profile';
import ProgressGraph from './ProgressGraph';
import { studyMaterials } from "../data/studyMaterials";

function humanTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
}

function loadStates() {
  const raw = localStorage.getItem('resourceStates') || '{}';
  try { return JSON.parse(raw); } catch(e) { return {}; }
}

export default function TrackProgress({ onNavigate, toggleDarkMode }) {
  const [resourceStates, setResourceStates] = useState(loadStates());
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
      if (e.key === 'resourceStates') setResourceStates(loadStates());
      if (e.key === 'examHistory') setExams(JSON.parse(localStorage.getItem('examHistory') || '[]'));
      if (e.key === 'activityLog') setActivityLog(JSON.parse(localStorage.getItem('activityLog') || '[]'));
    };
    window.addEventListener('storage', handler);
    window.addEventListener('resourceStatesChanged', () => setResourceStates(loadStates()));
    window.addEventListener('activityLogChanged', () => setActivityLog(JSON.parse(localStorage.getItem('activityLog') || '[]')));
    window.addEventListener('examHistoryChanged', () => setExams(JSON.parse(localStorage.getItem('examHistory') || '[]')));
    const interval = setInterval(() => {
      // fallback poll to update within same tab if other code doesn't trigger state
      setResourceStates(loadStates());
      setExams(JSON.parse(localStorage.getItem('examHistory') || '[]'));
      setActivityLog(JSON.parse(localStorage.getItem('activityLog') || '[]'));
    }, 1500);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('resourceStatesChanged', () => setResourceStates(loadStates()));
      window.removeEventListener('activityLogChanged', () => setActivityLog(JSON.parse(localStorage.getItem('activityLog') || '[]')));
      window.removeEventListener('examHistoryChanged', () => setExams(JSON.parse(localStorage.getItem('examHistory') || '[]')));
      clearInterval(interval);
    };
  }, []);

  const studyPercent = (() => {
    const vals = Object.values(resourceStates);
    if (!vals || !vals.length) return 0;
    const sum = vals.reduce((s, r) => s + (r.progress || 0), 0);
    return Math.round(sum / vals.length);
  })();

  const examCount = exams.length;
  const examAvg = examCount ? Math.round(exams.reduce((s,x) => s + (x.percentage||0), 0) / examCount) : 0;

  const activities = [
    ...activityLog.map(a => ({ icon: a.type === 'completed' ? '✅' : (a.type === 'uncompleted' ? '↩️' : a.type === 'exam' ? '📝' : '•'), title: `${a.type === 'completed' ? 'Completed' : a.type === 'uncompleted' ? 'Uncompleted' : a.type}: ${a.title}${a.detail ? ` — ${a.detail}` : ''}`, time: a.time })),
    ...exams.map(e => ({ icon: '📝', title: `Exam: ${e.title ?? 'Mock'} - ${e.percentage}%`, time: e.time }))
  ].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0,10);

  const progressData = [
    { category: 'Study Resources', percentage: studyPercent, color: '#0284c7' },
    { category: 'Mock Exams (avg)', percentage: examAvg, color: '#8b5cf6' }
  ];

  // Graph controls
  const [timeframe, setTimeframe] = React.useState(30); // days
  const [chartType, setChartType] = React.useState('line');
  const [series, setSeries] = React.useState('study'); // 'study' or 'exam'

  // build date list for the timeframe
  const days = Array.from({length: timeframe}).map((_,i) => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - (timeframe - 1 - i));
    return d.toISOString().slice(0,10);
  });

  // aggregate study minutes per day from activityLog (uses duration in seconds)
  const studyByDate = {};
  (activityLog || []).forEach(a => {
    try {
      const date = new Date(a.time).toISOString().slice(0,10);
      const dur = a.duration || 0; // seconds
      studyByDate[date] = (studyByDate[date] || 0) + Math.round((dur || 0) / 60);
    } catch(e){}
  });

  // aggregate exam averages per day
  const examByDate = {};
  (exams || []).forEach(e => {
    try {
      const date = new Date(e.time).toISOString().slice(0,10);
      if (!examByDate[date]) examByDate[date] = { sum: 0, count: 0 };
      examByDate[date].sum += (e.percentage || 0);
      examByDate[date].count += 1;
    } catch(e){}
  });

  const graphData = days.map(d => ({ date: d, value: series === 'study' ? (studyByDate[d] || 0) : (examByDate[d] ? Math.round(examByDate[d].sum / examByDate[d].count) : 0) }));

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
          {/* Profile Component */}
          <Profile onNavigate={onNavigate} toggleDarkMode={toggleDarkMode} />
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

          {/* Graph Section */}
          <div className="graph-card">
            <div className="graph-controls">
              <div>
                <label>Series: </label>
                <select value={series} onChange={(e) => setSeries(e.target.value)}>
                  <option value="study">Study Minutes</option>
                  <option value="exam">Exam Score</option>
                </select>
              </div>
              <div>
                <label>Timeframe: </label>
                <select value={timeframe} onChange={(e) => setTimeframe(parseInt(e.target.value,10))}>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
              <div>
                <label>Chart: </label>
                <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                  <option value="line">Line</option>
                  <option value="bar">Bar</option>
                </select>
              </div>
            </div>

            <div style={{marginTop:12}}>
              {/* Graph */}
              <React.Suspense fallback={<div style={{padding:12}}>Loading graph…</div>}>
                <ProgressGraph data={graphData.map(d => ({ date: d.date.slice(5), value: d.value }))} width={720} height={200} type={chartType} color={series === 'study' ? '#0284c7' : '#8b5cf6'} tooltipEnabled={false} legend={series === 'study' ? 'Study Minutes' : 'Exam Score (%)'} />
              </React.Suspense>

              {/* Analysis: line graph of marks obtained in tests */}
              <div className="analysis-card" style={{marginTop:18}}>
                <h3 style={{margin:0}}>Analysis — Exam Scores</h3>
                <div className="muted" style={{marginTop:6}}>Line chart showing recent exam marks</div>
                <div style={{marginTop:12}}>
                  <React.Suspense fallback={<div style={{padding:12}}>Loading chart…</div>}>
                    <ProgressGraph data={exams.slice(-30).map(e => ({ date: new Date(e.time).toLocaleDateString(), value: e.percentage || 0 }))} width={720} height={220} type={'line'} color={'#ef4444'} tooltipEnabled={true} legend={'Exam Score (%)'} />
                  </React.Suspense>
                </div>
              </div>

            </div>

          </div>

          {/* Recent Activity Section */}
          <div className="recent-activity">
            <h3 className="activity-title">Recent Activity</h3>
            
            <div className="activity-list">
              {activities.map((activity, index) => (
                <div key={index} className="activity-card">
                  <div className="activity-icon">{activity.icon}</div>
                  <div className="activity-content">
                    <p className="activity-title-text">{activity.title}</p>
                    <p className="activity-time">{humanTime(activity.time)}</p>
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